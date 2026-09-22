import { Request, Response } from 'express'
import pool from '../config/db'

// Get all curriculums
export const getCurriculums = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM curriculums ORDER BY cur_id')
    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching curriculums:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch curriculums' })
  }
}

// Create new curriculum
export const createCurriculum = async (req: Request, res: Response) => {
  try {
    const { cur_name, cur_shortname } = req.body
    console.log('Creating curriculum:', { cur_name, cur_shortname })
    
    if (!cur_name || !cur_shortname) {
      return res.status(400).json({ success: false, message: 'Curriculum name and short name are required' })
    }
    const result = await pool.query(
      'INSERT INTO curriculums (cur_name, cur_shortname) VALUES ($1, $2) RETURNING *',
      [cur_name, cur_shortname]
    )
    res.status(201).json({ success: true, data: result.rows[0], message: 'Curriculum created successfully' })
  } catch (error) {
    console.error('Error creating curriculum:', error)
    res.status(500).json({ success: false, message: 'Failed to create curriculum' })
  }
}

// Update curriculum
export const updateCurriculum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { cur_name, cur_shortname } = req.body
    const result = await pool.query(
      'UPDATE curriculums SET cur_name = $1, cur_shortname = $2 WHERE cur_id = $3 RETURNING *',
      [cur_name, cur_shortname, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Curriculum not found' })
    }
    res.json({ success: true, data: result.rows[0], message: 'Curriculum updated successfully' })
  } catch (error) {
    console.error('Error updating curriculum:', error)
    res.status(500).json({ success: false, message: 'Failed to update curriculum' })
  }
}

// Get children info — เรียกก่อนลบเพื่อแสดงใน popup
export const getCurriculumChildren = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const [divisionsResult, plansResult] = await Promise.all([
      pool.query('SELECT div_id, div_name FROM divisions WHERE cur_id = $1', [id]),
      pool.query('SELECT ap_id, ap_years, plan_num FROM admission_plan WHERE cur_id = $1', [id])
    ])
    res.json({
      success: true,
      data: {
        divisions: divisionsResult.rows,
        plans: plansResult.rows
      }
    })
  } catch (error) {
    console.error('Error fetching children:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch children' })
  }
}

// Delete curriculum — cascade ลบลูกก่อน แล้วค่อยลบแม่
export const deleteCurriculum = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    await client.query('BEGIN')

    // 1. ลบ admission_plan ที่ผูกกับ curriculum นี้
    await client.query('DELETE FROM admission_plan WHERE cur_id = $1', [id])

    // 2. ลบ divisions ที่ผูกกับ curriculum นี้
    await client.query('DELETE FROM divisions WHERE cur_id = $1', [id])

    // 3. ลบ curriculum
    const result = await client.query(
      'DELETE FROM curriculums WHERE cur_id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, message: 'ไม่พบหลักสูตร' })
    }

    await client.query('COMMIT')
    res.json({ success: true, message: 'ลบหลักสูตรและข้อมูลที่เกี่ยวข้องสำเร็จ' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error deleting curriculum:', error)
    res.status(500).json({ success: false, message: 'Failed to delete curriculum' })
  } finally {
    client.release()
  }
}