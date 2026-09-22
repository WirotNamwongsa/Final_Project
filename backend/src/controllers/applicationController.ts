import { Request, Response } from "express";
import pool from "../config/db";
import { sendSuccess, sendError } from "../utils/response";
import { uploadToSupabase } from "../middleware/upload";
import { getPublicUrl } from "../config/supabase";


export const getPendingApplicants = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.app_id, a.prefix, a.full_name, a.status, a.created_at,
        c.cur_shortname, d.div_name
      FROM applicants a
      JOIN admission_plan ap ON ap.ap_id = a.ap_id
      JOIN curriculums c ON c.cur_id = ap.cur_id
      JOIN divisions d ON d.div_id = ap.div_id
      WHERE a.status IN ('pending_approve', 'pending_payment')
      ORDER BY a.created_at DESC
      LIMIT 20
    `)
    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลได้', 500, err)
  }
}

// ดึงข้อมูลผู้สมัครทั้งหมด
export const getApplicants = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.app_id, a.prefix, a.full_name, a.status, a.created_at,
        c.cur_shortname, d.div_name
      FROM applicants a
      JOIN admission_plan ap ON ap.ap_id = a.ap_id
      JOIN curriculums c ON c.cur_id = ap.cur_id
      JOIN divisions d ON d.div_id = ap.div_id
      ORDER BY a.created_at DESC
    `)
    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลได้', 500, err)
  }
}
export const getCurriculums = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT cur_id, cur_name, cur_shortname FROM curriculums ORDER BY cur_id",
    );
    sendSuccess(res, result.rows);
  } catch (err) {
    sendError(res, "ไม่สามารถดึงข้อมูลหลักสูตรได้", 500, err);
  }
};

// ดึงสาขาตามหลักสูตร
export const getDivisions = async (req: Request, res: Response) => {
  try {
    const { cur_id } = req.query;
    const query = cur_id
      ? "SELECT div_id, div_name, cur_id FROM divisions WHERE cur_id = $1 ORDER BY div_id"
      : "SELECT div_id, div_name, cur_id FROM divisions ORDER BY div_id";
    const result = await pool.query(query, cur_id ? [cur_id] : []);
    sendSuccess(res, result.rows);
  } catch (err) {
    sendError(res, "ไม่สามารถดึงข้อมูลสาขาได้", 500, err);
  }
};

// ดึงค่าใช้จ่ายตามหลักสูตร
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { cur_id } = req.query;

    const query = cur_id
      ? `SELECT exp_id, exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type, exp_sizes
         FROM expense_detail WHERE cur_id = $1 ORDER BY payment_type DESC, exp_id`
      : `SELECT exp_id, exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type, exp_sizes
         FROM expense_detail ORDER BY payment_type DESC, exp_id`

    const result = await pool.query(query, cur_id ? [cur_id] : [])
    sendSuccess(res, result.rows)
  } catch (err: any) {
    console.error('getExpenses error:', err.message)
    sendError(res, "ไม่สามารถดึงข้อมูลค่าใช้จ่ายได้", 500, err)
  }
}

export const getAdmissionPlan = async (req: Request, res: Response) => {
  try {
    const { prev_level, ap_years } = req.query

    // map prev_level → filter condition
    // m3  → ปวช. เท่านั้น
    // m6  → ปวส. ม.6/ต่างสาขา เท่านั้น
    // pvc → ปวส. ทุกแบบ (ม.6/ต่างสาขา + สายตรง + ทวิภาคี)
    let curIds: number[] | null = null

    if (prev_level === 'm3') {
      // ดึง cur_id ที่เป็น ปวช. เท่านั้น
    }

    const result = await pool.query(`
      SELECT
        ap.ap_id, ap.ap_years, ap.plan_num,
        ap.cur_id, c.cur_name, c.cur_shortname,
        ap.div_id, d.div_name,
        COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') AS online_enrolled,
        COALESCE(o.count, 0) AS onsite_enrolled,
        ap.plan_num - (
          COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') + COALESCE(o.count, 0)
        ) AS remaining,
        CASE WHEN ap.plan_num - (
          COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') + COALESCE(o.count, 0)
        ) <= 0 THEN true ELSE false END AS is_full
      FROM admission_plan ap
      JOIN curriculums c ON c.cur_id = ap.cur_id
      JOIN divisions d ON d.div_id = ap.div_id
      LEFT JOIN applicants a ON a.ap_id = ap.ap_id
      LEFT JOIN onsite_enrollments o ON o.ap_id = ap.ap_id
      WHERE (
        CASE
          WHEN $1 = 'm3'  THEN c.cur_shortname = 'ปวช.'
          WHEN $1 = 'm6'  THEN c.cur_shortname = 'ปวส(ม.6)'
          WHEN $1 = 'pvc' THEN c.cur_shortname = 'ปวส(สายตรง)'
          ELSE true
        END
      )
      AND ($2::varchar IS NULL OR ap.ap_years = $2)
      GROUP BY ap.ap_id, ap.cur_id, ap.div_id, c.cur_id, c.cur_name, c.cur_shortname, d.div_name, o.count
      ORDER BY c.cur_id, d.div_name
    `, [prev_level || null, ap_years || null])

    sendSuccess(res, result.rows)
  } catch (err) {
    sendError(res, 'ไม่สามารถดึงข้อมูลแผนการรับสมัครได้', 500, err)
  }
}

// ส่งใบสมัคร
export const createApplication = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      id_card_number, id_type, prefix, full_name, address, phone, email,
      prev_school, prev_level, prev_year, gpa, prev_branch,
      cur_id, div_id, ap_id, doc_type, expenses,
    } = req.body;

    const existing = await client.query(
      "SELECT app_id FROM applicants WHERE id_card_number = $1",
      [id_card_number],
    );
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return sendError(res, "เลขบัตรประชาชนนี้สมัครแล้ว", 400);
    }

    const planCheck = await client.query(`
      SELECT ap.plan_num, COUNT(a.app_id) AS count
      FROM admission_plan ap
      LEFT JOIN applicants a ON a.ap_id = ap.ap_id
      WHERE ap.ap_id = $1
      GROUP BY ap.plan_num
    `, [ap_id]);

    if (planCheck.rows.length > 0) {
      const { plan_num, count } = planCheck.rows[0];
      if (parseInt(count) >= parseInt(plan_num)) {
        await client.query("ROLLBACK");
        return sendError(res, "สาขาวิชานี้เต็มแล้ว", 400);
      }
    }

    const appResult = await client.query(`
      INSERT INTO applicants
        (id_card_number, id_type, prefix, full_name, address, phone, email,
         prev_school, prev_level, prev_year, gpa, prev_branch, cur_id, div_id, ap_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING app_id
    `, [
      id_card_number, id_type || "thai_id", prefix, full_name, address, phone, email,
      prev_school, prev_level, prev_year, gpa, prev_branch || null,
      cur_id, div_id, ap_id,
    ]);

    const app_id = appResult.rows[0].app_id;

    const files = req.files as Record<string, Express.Multer.File[]>;
    const docEntries = [
      { key: "id_front", type: "id_front" },
      { key: "id_back", type: "id_back" },
      { key: "edu_front", type: `${doc_type}_front` },
      { key: "edu_back", type: `${doc_type}_back` },
    ];

    for (const entry of docEntries) {
      const file = files?.[entry.key]?.[0];
      if (file) {
        // Upload to Supabase Storage
        const { path: supabasePath, error: uploadError } = await uploadToSupabase(file, 'documents');
        if (uploadError) {
          await client.query('ROLLBACK');
          return sendError(res, `อัปโหลดไฟล์ไม่สำเร็จ: ${uploadError}`, 500);
        }

        await client.query(`
          INSERT INTO documents (app_id, doc_type, file_path, file_name, file_size)
          VALUES ($1, $2, $3, $4, $5)
        `, [app_id, entry.type, supabasePath, file.originalname, file.size]);
      }
    }

    let totalAmount = 0, requiredAmount = 0, optionalAmount = 0;
    const expenseList = JSON.parse(expenses || "[]");
    for (const exp of expenseList) {
      if (exp.quantity <= 0) continue;
      const total = exp.unit_price * exp.quantity;
      totalAmount += total;
      if (exp.is_required) requiredAmount += total;
      else optionalAmount += total;

      await client.query(`
        INSERT INTO applicant_expenses
          (app_id, exp_id, quantity, size, unit_price, total_price, is_required)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [app_id, exp.exp_id, exp.quantity, exp.size || null, exp.unit_price, total, exp.is_required]);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    await client.query(`
      INSERT INTO payments (app_id, total_amount, required_amount, optional_amount, due_date)
      VALUES ($1,$2,$3,$4,$5)
    `, [app_id, totalAmount, requiredAmount, optionalAmount, dueDate]);

    await client.query("COMMIT");
    sendSuccess(res, { app_id, total_amount: totalAmount, due_date: dueDate }, "ส่งใบสมัครเรียบร้อยแล้ว", 201);

  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error('❌ createApplication error:', err.message)
    console.error('❌ detail:', err.detail)
    console.error('❌ hint:', err.hint)
    console.error('❌ where:', err.where)
    console.error('❌ code:', err.code)
    console.error('❌ stack:', err.stack)
    console.error('❌ Request body:', req.body)
    sendError(res, "เกิดข้อผิดพลาดในการส่งใบสมัคร", 500, err);
  } finally {
    client.release();
  }
};

// ตรวจสอบสถานะ
export const checkStatus = async (req: Request, res: Response) => {
  try {
    const { idCard } = req.params;
    const result = await pool.query(
      `
      SELECT
        a.app_id, a.prefix, a.full_name, a.status, a.created_at,
        a.prev_level, a.prev_year,
        c.cur_name, d.div_name,
        p.total_amount, p.required_amount, p.due_date,
        p.paid_at, p.verified_at, p.slip_sender, p.slip_receiver,
        p.slip_approved,
        p.slip_error_message,
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
        a.app_id, a.prefix, a.full_name, a.status, a.created_at,
        a.prev_level, a.prev_year,
        c.cur_name, d.div_name,
        p.total_amount, p.required_amount, p.due_date,
        p.paid_at, p.verified_at, p.slip_sender, p.slip_receiver,
        p.slip_approved, p.slip_error_message,
        e.enrolled_at, e.verified_at
    `, [idCard])

    if (result.rows.length === 0) {
      return sendError(res, "ไม่พบข้อมูลการสมัคร", 404);
    }

    const row = result.rows[0]
const toUrl = (filePath: string | null) => {
  if (!filePath) return null
  return getPublicUrl(filePath)
}

sendSuccess(res, {
  ...row,
  self_front_url:   toUrl(row.self_front_url),
  self_back_url:    toUrl(row.self_back_url),
  father_front_url: toUrl(row.father_front_url),
  father_back_url:  toUrl(row.father_back_url),
  mother_front_url: toUrl(row.mother_front_url),
  mother_back_url:  toUrl(row.mother_back_url),
  payment_slip_url: toUrl(row.payment_slip_url),
  slip_sender: row.slip_sender ?? '-',
  slip_receiver: row.slip_receiver ?? '-',
    slip_approved:     row.slip_approved ?? null,       
      slip_error_message: row.slip_error_message ?? '', 
})


  } catch (err) {
    sendError(res, "เกิดข้อผิดพลาด", 500, err);
  }
};

// สถิติ
//  unction  0 duplicate ID card
export const checkDuplicateIdCard = async (req: Request, res: Response) => {
  try {
    const { id_card_number } = req.body;
    
    if (!id_card_number) {
      return sendError(res, "  0  ID card number is required", 400);
    }

    const result = await pool.query(
      "SELECT app_id, full_name, status FROM applicants WHERE id_card_number = $1",
      [id_card_number]
    );

    if (result.rows.length > 0) {
      return sendSuccess(res, {
        is_duplicate: true,
        applicant: result.rows[0]
      }, "  0  ID card already exists");
    }

    sendSuccess(res, {
      is_duplicate: false
    }, "  0  ID card is available");
  } catch (err) {
    sendError(res, "  0  Error checking duplicate ID card", 500, err);
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
  const overview = await pool.query(`
  SELECT
    COUNT(*) AS total_applicants,
    COUNT(*) FILTER (WHERE status != 'enrolled') AS applicant_count,
    COUNT(*) FILTER (WHERE status = 'paid') AS paid,
    COUNT(*) FILTER (WHERE status = 'enrolled') AS enrolled,
    COUNT(*) FILTER (WHERE status = 'pending_approve') AS pending_approve,
    COUNT(*) FILTER (WHERE status = 'pending_payment') AS pending_payment
  FROM applicants
`);

    const byCourse = await pool.query(`
  SELECT
    grp.cur_group,
    SUM(grp.quota) AS quota,
    SUM(grp.applicants) AS applicants,
    SUM(grp.enrolled) AS enrolled
  FROM (
    SELECT
      CASE
        WHEN c.cur_shortname = 'ปวช.' THEN 'ปวช.'
        ELSE 'ปวส.'
      END AS cur_group,
      COALESCE(q.total_quota, 0) AS quota,
      COUNT(DISTINCT a.app_id) AS applicants,
      COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') AS enrolled
    FROM curriculums c
    LEFT JOIN (
      SELECT cur_id, SUM(plan_num) AS total_quota
      FROM admission_plan
      GROUP BY cur_id
    ) q ON q.cur_id = c.cur_id
    LEFT JOIN admission_plan ap ON ap.cur_id = c.cur_id
    LEFT JOIN applicants a ON a.ap_id = ap.ap_id
    GROUP BY c.cur_id, c.cur_shortname, q.total_quota
  ) grp
  GROUP BY grp.cur_group
  ORDER BY grp.cur_group DESC
`);

    const byDivision = await pool.query(`
  SELECT
    ap.ap_id,
    d.div_id, d.div_name,
    c.cur_id, c.cur_shortname,
    ap.plan_num AS quota,
    COUNT(DISTINCT a.app_id) AS applicants,
    COUNT(DISTINCT a.app_id) FILTER (WHERE a.status = 'enrolled') AS enrolled
  FROM admission_plan ap
  JOIN divisions d ON d.div_id = ap.div_id
  JOIN curriculums c ON c.cur_id = ap.cur_id
  LEFT JOIN applicants a ON a.ap_id = ap.ap_id
  GROUP BY ap.ap_id, d.div_id, d.div_name, c.cur_id, c.cur_shortname, ap.plan_num
  ORDER BY c.cur_id, d.div_id
`);


    

    sendSuccess(res, {
      overview: overview.rows[0],
      by_course: byCourse.rows,
      by_division: byDivision.rows,
    });
  } catch (err) {
    sendError(res, "เกิดข้อผิดพลาด", 500, err);
  }
};


export const enrollApplication = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { idCard } = req.body
    if (!idCard) {
      return sendError(res, 'กรุณาระบุเลขบัตรประชาชน', 400)
    }

    const findResult = await client.query(
      `SELECT app_id, status FROM applicants WHERE id_card_number = $1`,
      [idCard]
    )

    if (findResult.rows.length === 0) {
      return sendError(res, 'ไม่พบข้อมูลผู้สมัคร', 404)
    }

    const application = findResult.rows[0]

    if (application.status === 'enrolled') {
      return sendError(res, 'มอบตัวแล้ว', 400)
    }

    await client.query('BEGIN')

    await client.query(
      `UPDATE applicants 
       SET status = 'enrolled', updated_at = NOW() 
       WHERE app_id = $1`,
      [application.app_id]
    )

    await client.query(
      `INSERT INTO enrollments (app_id, enrolled_at)
       VALUES ($1, NOW())
       ON CONFLICT (app_id) DO UPDATE SET enrolled_at = NOW()`,
      [application.app_id]
    )

    await client.query('COMMIT')

    return sendSuccess(res, { app_id: application.app_id }, 'มอบตัวสำเร็จ')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('enrollApplication error:', error)
    return sendError(res, 'เกิดข้อผิดพลาด', 500, error)
  } finally {
    client.release()
  }
}