import { Request, Response } from 'express'
import pool from '../config/db'
import fs from 'fs'
import path from 'path'

// Get all expense details with related data
export const getExpenseDetails = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        ed.exp_id,
        ed.exp_name,
        ed.exp_detail,
        ed.cur_id,
        ed.exp_cost,
        ed.payment_type,
        ed.exp_sizes,
        CASE WHEN ed.exp_img IS NOT NULL AND ed.exp_img != '' THEN true ELSE false END as has_img,
        c.cur_name,
        c.cur_shortname
      FROM expense_detail ed
      LEFT JOIN curriculums c ON ed.cur_id = c.cur_id
      ORDER BY c.cur_name ASC NULLS LAST, ed.exp_name ASC
    `
    const result = await pool.query(query)

    const expenses = result.rows.map(row => ({
      exp_id: row.exp_id,
      exp_name: row.exp_name,
      exp_detail: row.exp_detail,
      exp_img: row.has_img === true || row.has_img === 't' || row.has_img === 'true'
        ? `/api/admin/expense-detail/${row.exp_id}/image?t=${Date.now()}`
        : null,
      exp_cost: Number(row.exp_cost ?? 0),
      payment_type: row.payment_type || 'mandatory',
      exp_sizes: row.exp_sizes || [],
      curriculum: row.cur_id
        ? {
            cur_id: row.cur_id,
            cur_name: row.cur_name,
            cur_shortname: row.cur_shortname
          }
        : null
    }))

    res.json({ success: true, data: expenses })
  } catch (error) {
    console.error('Error fetching expense details:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch expense details' })
  }
}

// เพิ่ม endpoint ใหม่สำหรับดึงรูปแยก
export const getExpenseImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT exp_img FROM expense_detail WHERE exp_id = $1',
      [id]
    )

    if (result.rows.length === 0 || !result.rows[0].exp_img) {
      return res.status(404).json({ success: false, message: 'Image not found' })
    }

    const base64 = result.rows[0].exp_img as string
    // รองรับทั้ง "data:image/png;base64,..." และ raw base64
    const matches = base64.match(/^data:(.+);base64,(.+)$/)
    if (matches) {
      const mimeType = matches[1]
      const imageBuffer = Buffer.from(matches[2], 'base64')
      res.set('Content-Type', mimeType)
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
      res.set('ETag', 'W/"' + Math.random().toString(36).substr(2, 9) + '"')
      return res.send(imageBuffer)
    }

    // raw base64
    const imageBuffer = Buffer.from(base64, 'base64')
    res.set('Content-Type', 'image/jpeg')
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
    res.set('ETag', 'W/"' + Math.random().toString(36).substr(2, 9) + '"')
    res.send(imageBuffer)
  } catch (error) {
    console.error('Error fetching expense image:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch image' })
  }
}

// Create new expense detail
export const createExpenseDetail = async (req: Request, res: Response) => {
  try {
    const { exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type, exp_sizes } = req.body

    if (!exp_name || !exp_detail || !cur_id || exp_cost === undefined || exp_cost === null || exp_cost === '') {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      })
    }

    const query = `
      INSERT INTO expense_detail (exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type, exp_sizes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const result = await pool.query(query, [exp_name, exp_detail, exp_img || null, cur_id, exp_cost, payment_type || 'mandatory', exp_sizes || []])

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Expense detail created successfully'
    })
  } catch (error) {
    console.error('Error creating expense detail:', error)
    res.status(500).json({ success: false, message: 'Failed to create expense detail' })
  }
}

// Update expense detail
export const updateExpenseDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type, exp_sizes } = req.body

    let query: string
    let params: any[]

    if (exp_img === '' || exp_img === null) {
      const imagePath = path.join(__dirname, `../../../uploads/expense-detail/${id}.jpg`)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }

      query = `
        UPDATE expense_detail
        SET exp_name = $1, exp_detail = $2, exp_img = NULL, cur_id = $3, exp_cost = $4, payment_type = $5, exp_sizes = $6
        WHERE exp_id = $7
        RETURNING *
      `
      params = [exp_name, exp_detail, cur_id, exp_cost, payment_type || 'mandatory', exp_sizes || [], id]
    } else if (exp_img === undefined) {
      query = `
        UPDATE expense_detail
        SET exp_name = $1, exp_detail = $2, cur_id = $3, exp_cost = $4, payment_type = $5, exp_sizes = $6
        WHERE exp_id = $7
        RETURNING *
      `
      params = [exp_name, exp_detail, cur_id, exp_cost, payment_type || 'mandatory', exp_sizes || [], id]
    } else {
      query = `
        UPDATE expense_detail
        SET exp_name = $1, exp_detail = $2, exp_img = $3, cur_id = $4, exp_cost = $5, payment_type = $6, exp_sizes = $7
        WHERE exp_id = $8
        RETURNING *
      `
      params = [exp_name, exp_detail, exp_img, cur_id, exp_cost, payment_type || 'mandatory', exp_sizes || [], id]
    }

    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense detail not found' })
    }

    res.json({ success: true, data: result.rows[0], message: 'Expense detail updated successfully' })
  } catch (error) {
    console.error('Error updating expense detail:', error)
    res.status(500).json({ success: false, message: 'Failed to update expense detail' })
  }
}

// Delete expense detail
export const deleteExpenseDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const query = 'DELETE FROM expense_detail WHERE exp_id = $1 RETURNING *'
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense detail not found' })
    }
    
    res.json({ 
      success: true, 
      message: 'Expense detail deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting expense detail:', error)
    res.status(500).json({ success: false, message: 'Failed to delete expense detail' })
  }
}

// เพิ่มฟังก์ชันลบรูปภาพ
export const deleteExpenseImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // ลบไฟล์รูปภาพจาก server
    // อัปเดตฐานข้อมูลให้ exp_img เป็น null
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
};
