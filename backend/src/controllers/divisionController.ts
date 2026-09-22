import { Request, Response } from 'express'
import pool from '../config/db'

// Get all divisions with curriculum info
export const getDivisions = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        d.*,
        c.cur_name,
        c.cur_shortname
      FROM divisions d
      JOIN curriculums c ON d.cur_id = c.cur_id
      ORDER BY c.cur_name ASC, d.div_name ASC
    `
    const result = await pool.query(query)
    const divisions = result.rows.map(row => ({
      div_id: row.div_id,
      div_name: row.div_name,
      cur_id: row.cur_id,
      curriculum: {
        cur_id: row.cur_id,
        cur_name: row.cur_name,
        cur_shortname: row.cur_shortname
      }
    }))
    res.json({ success: true, data: divisions })
  } catch (error) {
    console.error('Error fetching divisions:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch divisions' })
  }
}

// Create new division
export const createDivision = async (req: Request, res: Response) => {
  try {
    const { div_name, cur_id } = req.body
    console.log('Creating division:', { div_name, cur_id })
    
    if (!div_name || !cur_id) {
      return res.status(400).json({
        success: false,
        message: 'Division name and curriculum are required'
      })
    }
    const result = await pool.query(
      'INSERT INTO divisions (div_name, cur_id) VALUES ($1, $2) RETURNING *',
      [div_name, cur_id]
    )
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Division created successfully'
    })
  } catch (error) {
    console.error('Error creating division:', error)
    res.status(500).json({ success: false, message: 'Failed to create division' })
  }
}

// Update division
export const updateDivision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { div_name, cur_id } = req.body
    const result = await pool.query(
      'UPDATE divisions SET div_name = $1, cur_id = $2 WHERE div_id = $3 RETURNING *',
      [div_name, cur_id, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Division not found' })
    }
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Division updated successfully'
    })
  } catch (error) {
    console.error('Error updating division:', error)
    res.status(500).json({ success: false, message: 'Failed to update division' })
  }
}

// Get children info — เรียกก่อนลบเพื่อแสดงใน popup
export const getDivisionChildren = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT ap_id, ap_years, plan_num FROM admission_plan WHERE div_id = $1',
      [id]
    )
    res.json({
      success: true,
      data: { plans: result.rows }
    })
  } catch (error) {
    console.error('Error fetching division children:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch children' })
  }
}

// Delete division — cascade ลบ admission_plan ก่อน แล้วค่อยลบ division
export const deleteDivision = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    await client.query('BEGIN')

    // 1. ลบ admission_plan ที่ผูกกับ division นี้
    await client.query('DELETE FROM admission_plan WHERE div_id = $1', [id])

    // 2. ลบ division
    const result = await client.query(
      'DELETE FROM divisions WHERE div_id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, message: 'ไม่พบสาขาวิชา' })
    }

    await client.query('COMMIT')
    res.json({ success: true, message: 'ลบสาขาวิชาและข้อมูลที่เกี่ยวข้องสำเร็จ' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error deleting division:', error)
    res.status(500).json({ success: false, message: 'Failed to delete division' })
  } finally {
    client.release()
  }
}