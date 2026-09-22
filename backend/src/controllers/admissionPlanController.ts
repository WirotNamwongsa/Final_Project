import { Request, Response } from 'express'
import pool from '../config/db'

// Get all admission plans with related data
export const getAdmissionPlans = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        ap.*,
        c.*,
        d.div_name
      FROM admission_plan ap
      JOIN curriculums c ON ap.cur_id = c.cur_id
      JOIN divisions d ON ap.div_id = d.div_id
      ORDER BY ap.ap_years DESC, d.div_name ASC
    `
    const result = await pool.query(query)
    
    const plans = result.rows.map(row => ({
      ap_id: row.ap_id,
      ap_years: row.ap_years,
      plan_num: row.plan_num,
      curriculum: {
        cur_id: row.cur_id,
        cur_name: row.cur_name,
        cur_shortname: row.cur_shortname
      },
      division: {
        div_id: row.div_id,
        div_name: row.div_name
      }
    }))
    
    res.json({ success: true, data: plans })
  } catch (error) {
    console.error('Error fetching admission plans:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch admission plans' })
  }
}

// Create new admission plan
export const createAdmissionPlan = async (req: Request, res: Response) => {
  try {
    const { ap_years, div_id, cur_id, plan_num } = req.body
    console.log('Creating admission plan:', { ap_years, div_id, cur_id, plan_num })
    
    if (!ap_years || !div_id || !cur_id || !plan_num) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      })
    }

    const query = `
      INSERT INTO admission_plan (ap_years, div_id, cur_id, plan_num)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const result = await pool.query(query, [ap_years, div_id, cur_id, plan_num])
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: 'Admission plan created successfully'
    })
  } catch (error) {
    console.error('Error creating admission plan:', error)
    res.status(500).json({ success: false, message: 'Failed to create admission plan' })
  }
}

// Update admission plan
export const updateAdmissionPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { ap_years, div_id, cur_id, plan_num } = req.body
    
    const query = `
      UPDATE admission_plan 
      SET ap_years = $1, div_id = $2, cur_id = $3, plan_num = $4
      WHERE ap_id = $5
      RETURNING *
    `
    const result = await pool.query(query, [ap_years, div_id, cur_id, plan_num, id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admission plan not found' })
    }
    
    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Admission plan updated successfully'
    })
  } catch (error) {
    console.error('Error updating admission plan:', error)
    res.status(500).json({ success: false, message: 'Failed to update admission plan' })
  }
}

// Delete admission plan
export const deleteAdmissionPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const query = 'DELETE FROM admission_plan WHERE ap_id = $1 RETURNING *'
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admission plan not found' })
    }
    
    res.json({ 
      success: true, 
      message: 'Admission plan deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting admission plan:', error)
    res.status(500).json({ success: false, message: 'Failed to delete admission plan' })
  }
}
