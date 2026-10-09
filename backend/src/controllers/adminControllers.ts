import { Request, Response } from 'express'
import pool from '../config/db'
import { getPublicUrl } from '../config/supabase'
import { supabase } from '../config/supabase'

const toUrl = (filePath: string | null) => {
  if (!filePath) return null
  return getPublicUrl(filePath)
}

export const getApplicants = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        a.app_id,
        a.prefix,
        a.full_name,
        a.id_card_number,
        a.id_type,
        a.phone,
        a.email,
        a.status,
        a.created_at,
        c.cur_id,
        c.cur_name,
        c.cur_shortname,
        d.div_id,
        d.div_name,
        p.total_amount,
        p.paid_at,
        p.slip_name,
        p.slip_path,
        e.enrolled_at,   
        -- เพิ่ม 2 บรรทัดนี้
        MAX(CASE WHEN doc.doc_type = 'id_front' THEN doc.file_path END) AS id_front_path,
        MAX(CASE WHEN doc.doc_type = 'id_back'  THEN doc.file_path END) AS id_back_path,
        MAX(CASE WHEN doc.doc_type = 'edu_front' THEN doc.file_path END) AS edu_front_path
      FROM applicants a
      JOIN curriculums c ON a.cur_id = c.cur_id
      JOIN divisions d ON a.div_id = d.div_id
      LEFT JOIN payments p ON a.app_id = p.app_id
      LEFT JOIN enrollments e ON e.app_id = a.app_id
      -- เพิ่ม LEFT JOIN นี้
      LEFT JOIN documents doc ON doc.app_id = a.app_id
      -- เพิ่ม GROUP BY เพราะใช้ MAX()
      GROUP BY
        a.app_id, a.prefix, a.full_name, a.id_card_number, a.id_type,
        a.phone, a.email, a.status, a.created_at,
        c.cur_id, c.cur_name, c.cur_shortname,
        d.div_id, d.div_name,
        p.total_amount, p.paid_at, p.slip_name, p.slip_path,
        e.enrolled_at
      ORDER BY a.created_at DESC
    `
    const result = await pool.query(query)

    const applicants = result.rows.map(row => ({
      app_id:         row.app_id,
      prefix:         row.prefix,
      full_name:      row.full_name,
      id_card_number: row.id_card_number,
      id_type:         row.id_type,
      phone:          row.phone,
      email:          row.email,
      status:         row.status,
      created_at:     row.created_at,
       enrolled_at: row.enrolled_at,
      

      // เพิ่ม 2 field นี้
      id_front_url:   toUrl(row.id_front_path),
      id_back_url:    toUrl(row.id_back_path),
      edu_front_url: toUrl(row.edu_front_path), 
      curriculum: {
        cur_id:        row.cur_id,
        cur_name:      row.cur_name,
        cur_shortname: row.cur_shortname,
      },
      division: {
        div_id:   row.div_id,
        div_name: row.div_name,
      },
      payment: {
        total_amount: row.total_amount,
        paid_at:      row.paid_at,
        slip_name:    row.slip_name,
       slip_url:     toUrl(row.slip_path),
      },
    }))

    res.json({ success: true, data: applicants })
  } catch (error) {
    console.error('Error fetching applicants:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch applicants' })
  }
}

// GET /api/admin/applicants/:app_id/documents
// ดึงเอกสารทั้งหมดของผู้สมัคร
export const getApplicantDocuments = async (req: Request, res: Response) => {
  try {
    const { app_id } = req.params;
    const appId = Array.isArray(app_id) ? app_id[0] : app_id;
    
  const query = `
  SELECT 
    d.doc_id,
    d.doc_type,
    d.file_name,
    d.file_path,
    d.file_size,
    d.uploaded_at,
    a.prefix,
    a.full_name,
    a.id_card_number,
    a.status,
    a.review_error_message,
    p.slip_approved,
    p.slip_error_message
  FROM documents d
  JOIN applicants a ON d.app_id = a.app_id
  LEFT JOIN payments p ON p.app_id = a.app_id
  WHERE d.app_id = $1
  ORDER BY d.uploaded_at ASC
`;
    
   const result = await pool.query(query, [appId]);

    
    const firstRow = result.rows[0];
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบเอกสารของผู้สมัครคนนี้' 
      });
    }
    
    const applicantInfo = {
      app_id:         appId,
      prefix:         firstRow.prefix,
      full_name:      firstRow.full_name,
      id_card_number: firstRow.id_card_number,
      status:         firstRow.status,
      review_error_message: firstRow.review_error_message ?? '',
    };
    
    const documents = result.rows.map(row => ({
      doc_id:      row.doc_id,
      doc_type:    row.doc_type,
      file_name:   row.file_name,
      file_size:   row.file_size,
      uploaded_at: row.uploaded_at,
      file_url:    toUrl(row.file_path)
    }));
    
    // ✅ เพิ่ม comma หลัง documents และแก้ slip_error_message
    res.json({ 
      success: true, 
      data: {
        applicant:          applicantInfo,
        documents:          documents,
        slip_approved:      firstRow.slip_approved,
        slip_error_message: firstRow.slip_error_message ?? '',
        review_error_message: firstRow.review_error_message ?? '',
      }
    });
    
  } catch (error) {
    console.error('Error fetching applicant documents:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch applicant documents' })
  }
}

export const deleteApplicant = async (req: Request, res: Response) => {
  const { app_id } = req.params
  const client = await pool.connect()
  try {
    const found = await client.query(`SELECT app_id, full_name FROM applicants WHERE app_id = $1`, [app_id])
    if (found.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้สมัคร' })
    }

    // ดึง file paths ก่อนลบ
    const docs = await client.query(`SELECT file_path FROM documents WHERE app_id = $1`, [app_id])
    const slip = await client.query(`SELECT slip_path FROM payments WHERE app_id = $1`, [app_id])

    await client.query('BEGIN')
    await client.query(`DELETE FROM applicants WHERE app_id = $1`, [app_id])
    await client.query('COMMIT')

    // ลบไฟล์จาก Supabase Storage
    const filePaths = [
      ...docs.rows.map((r: any) => r.file_path),
      slip.rows[0]?.slip_path,
    ].filter(Boolean)

    for (const filePath of filePaths) {
      try {
        const { error } = await supabase.storage
          .from('uploads')
          .remove([filePath])
        if (error) console.error('Failed to delete file from Supabase:', error)
      } catch (error) {
        console.error('Error deleting file from Supabase:', error)
      }
    }

    res.json({ success: true, message: `ลบข้อมูล ${found.rows[0].full_name} เรียบร้อยแล้ว` })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('deleteApplicant error:', error)
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล' })
  } finally {
    client.release()
  }
}

// GET /api/admin/applicants/detail/:idCard
// ข้อมูลเต็มของผู้สมัครสำหรับ admin (รวม PII)
export const getApplicantDetail = async (req: Request, res: Response) => {
  try {
    const { idCard } = req.params
    const result = await pool.query(`
      SELECT
        a.app_id, a.prefix, a.full_name, a.id_card_number, a.id_type,
        a.phone, a.email, a.address,
        a.prev_school, a.prev_level, a.prev_year, a.gpa,
        a.status, a.review_error_message, a.created_at,
        c.cur_name, d.div_name,
        p.total_amount, p.required_amount, p.due_date,
        p.paid_at, p.verified_at, p.slip_sender, p.slip_receiver,
        p.slip_approved, p.slip_error_message,
        e.enrolled_at, e.verified_at AS enroll_verified_at,
        MAX(CASE WHEN doc.doc_type = 'self_house_front'   THEN doc.file_path END) AS self_front_url,
        MAX(CASE WHEN doc.doc_type = 'self_house_back'    THEN doc.file_path END) AS self_back_url,
        MAX(CASE WHEN doc.doc_type = 'father_house_front' THEN doc.file_path END) AS father_front_url,
        MAX(CASE WHEN doc.doc_type = 'father_house_back'  THEN doc.file_path END) AS father_back_url,
        MAX(CASE WHEN doc.doc_type = 'mother_house_front' THEN doc.file_path END) AS mother_front_url,
        MAX(CASE WHEN doc.doc_type = 'mother_house_back'  THEN doc.file_path END) AS mother_back_url,
        MAX(CASE WHEN doc.doc_type = 'payment_slip'       THEN doc.file_path END) AS payment_slip_url
      FROM applicants a
      JOIN curriculums c ON c.cur_id = a.cur_id
      JOIN divisions d ON d.div_id = a.div_id
      LEFT JOIN payments p ON p.app_id = a.app_id
      LEFT JOIN enrollments e ON e.app_id = a.app_id
      LEFT JOIN documents doc ON doc.app_id = a.app_id
      WHERE a.id_card_number = $1
      GROUP BY
        a.app_id, a.prefix, a.full_name, a.id_card_number, a.id_type,
        a.phone, a.email, a.address,
        a.prev_school, a.prev_level, a.prev_year, a.gpa,
        a.status, a.review_error_message, a.created_at,
        c.cur_name, d.div_name,
        p.total_amount, p.required_amount, p.due_date,
        p.paid_at, p.verified_at, p.slip_sender, p.slip_receiver,
        p.slip_approved, p.slip_error_message,
        e.enrolled_at, e.verified_at
    `, [idCard])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้สมัคร' })
    }

    const row = result.rows[0]
    res.json({
      success: true,
      data: {
        ...row,
        self_front_url:   toUrl(row.self_front_url),
        self_back_url:    toUrl(row.self_back_url),
        father_front_url: toUrl(row.father_front_url),
        father_back_url:  toUrl(row.father_back_url),
        mother_front_url: toUrl(row.mother_front_url),
        mother_back_url:  toUrl(row.mother_back_url),
        payment_slip_url: toUrl(row.payment_slip_url),
        slip_sender:         row.slip_sender ?? '-',
        slip_receiver:       row.slip_receiver ?? '-',
        slip_approved:       row.slip_approved ?? null,
        slip_error_message:  row.slip_error_message ?? '',
      }
    })
  } catch (err) {
    console.error('getApplicantDetail error:', err)
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' })
  }
}

export const truncateApplicants = async (_req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('TRUNCATE TABLE enrollments, applicant_expenses, payments, documents, applicants RESTART IDENTITY CASCADE')
    await client.query('COMMIT')

    // ลบไฟล์ทั้งหมดจาก Supabase Storage
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('uploads')
        .list('', { limit: 1000 })

      if (!listError && files && files.length > 0) {
        const filePaths = files
          .filter(file => file.name !== '.gitkeep')
          .map(file => file.name)

        if (filePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('uploads')
            .remove(filePaths)

          if (deleteError) {
            console.error('Failed to delete files from Supabase:', deleteError)
          }
        }
      }
    } catch (error) {
      console.error('Error deleting files from Supabase Storage:', error)
    }

    res.json({ success: true, message: 'ล้างข้อมูลผู้สมัครเรียบร้อยแล้ว' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('truncateApplicants error:', error)
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการล้างข้อมูล' })
  } finally {
    client.release()
  }
}

// POST /api/admin/applicants/:app_id/approve-slip
// อนุมัติสลิปการชำระเงิน
export const approveSlip = async (req: Request, res: Response) => {
  const { app_id } = req.params
  const { verified_by } = req.body

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Lock the applicant row so the approval decision is based on the current state.
    const applicantResult = await client.query(
      `SELECT a.status, p.slip_path, p.slip_approved
       FROM applicants a
       LEFT JOIN payments p ON p.app_id = a.app_id
       WHERE a.app_id = $1
       FOR UPDATE OF a`,
      [app_id]
    )

    if (applicantResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้สมัคร' })
    }

    const applicant = applicantResult.rows[0]
    if (applicant.status === 'enrolled' && applicant.slip_approved === true) {
      await client.query('COMMIT')
      return res.json({ success: true, message: 'อนุมัติแล้ว' })
    }
    if (applicant.status === 'expired') {
      await client.query('ROLLBACK')
      return res.status(410).json({ success: false, message: 'ใบสมัครหมดเขตชำระเงินแล้ว ไม่สามารถอนุมัติได้' })
    }
    if (applicant.status !== 'pending_document_review') {
      await client.query('ROLLBACK')
      return res.status(409).json({ success: false, message: 'อนุมัติได้เฉพาะใบสมัครที่อยู่ระหว่างตรวจสอบเอกสาร' })
    }
    if (!applicant.slip_path) {
      await client.query('ROLLBACK')
      return res.status(409).json({ success: false, message: 'ไม่พบไฟล์สลิปสำหรับตรวจสอบ' })
    }

    // อัปเดตสถานะสลิป
    const paymentUpdate = await client.query(
      `UPDATE payments
       SET slip_approved = true,
           slip_error_message = NULL,
           verified_at = NOW(),
           verified_by = $1
       WHERE app_id = $2 AND slip_path IS NOT NULL`,
      [verified_by || 'admin', app_id]
    )
    if (paymentUpdate.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ success: false, message: 'ไม่พบไฟล์สลิปสำหรับตรวจสอบ' })
    }

    // Only a pending document review can be approved into enrolled.
    const applicantUpdate = await client.query(
      `UPDATE applicants
       SET status = 'enrolled',
           review_error_message = NULL,
           updated_at = NOW()
       WHERE app_id = $1 AND status = 'pending_document_review'
       RETURNING app_id`,
      [app_id]
    )
    if (applicantUpdate.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ success: false, message: 'สถานะใบสมัครเปลี่ยนไปแล้ว กรุณาตรวจสอบอีกครั้ง' })
    }

    await client.query(
      `INSERT INTO enrollments (app_id, enrolled_at, verified_at, verified_by)
       VALUES ($1, NOW(), NOW(), $2)
       ON CONFLICT (app_id) DO UPDATE SET
         verified_at = NOW(),
         verified_by = EXCLUDED.verified_by`,
      [app_id, verified_by || 'admin']
    )

    await client.query('COMMIT')

    res.json({ success: true, message: 'อนุมัติสลิปและเอกสารเรียบร้อยแล้ว' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('approveSlip error:', error)
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอนุมัติสลิป' })
  } finally {
    client.release()
  }
}

// POST /api/admin/applicants/:app_id/reject-slip
// ส่งเอกสารมอบตัวกลับไปให้ผู้สมัครแก้ไข
export const rejectSlip = async (req: Request, res: Response) => {
  const { app_id } = req.params
  const { error_message } = req.body

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const rejection = await client.query(
      `UPDATE applicants
       SET status = 'revision_required',
           review_error_message = $1,
           updated_at = NOW()
       WHERE app_id = $2 AND status = 'pending_document_review'
       RETURNING app_id`,
      [error_message || 'กรุณาแก้ไขเอกสารตามที่เจ้าหน้าที่แจ้ง', app_id]
    )

    if (rejection.rowCount === 0) {
      await client.query('ROLLBACK')
      const existing = await pool.query('SELECT app_id FROM applicants WHERE app_id = $1', [app_id])
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้สมัคร' })
      }
      return res.status(409).json({ success: false, message: 'ปฏิเสธได้เฉพาะใบสมัครที่อยู่ระหว่างตรวจสอบเอกสาร' })
    }

    await client.query('COMMIT')

    res.json({ success: true, message: 'ส่งใบสมัครกลับไปแก้ไขเรียบร้อยแล้ว' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('rejectSlip error:', error)
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการส่งเอกสารกลับไปแก้ไข' })
  } finally {
    client.release()
  }
}
