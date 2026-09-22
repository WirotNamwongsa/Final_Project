// backend/src/controllers/userController.ts
import { Request, Response } from 'express'
import pool from '../config/db'
import bcrypt from 'bcrypt'

export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' })
  }
}

const ALLOWED_ROLES = ['admin', 'staff']

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
      [username, hashedPassword, role]
    )

    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { username, password, role } = req.body

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }
    
    let query = 'UPDATE users SET username = $1, role = $2'
    let params = [username, role]
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      query += ', password_hash = $3'
      params.push(hashedPassword)
      params.push(id)
    } else {
      params.push(id)
    }
    
    query += ' WHERE id = $' + params.length + ' RETURNING id, username, role, created_at'
    
    const result = await pool.query(query, params)
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM users WHERE id = $1', [id])
    res.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' })
  }
}