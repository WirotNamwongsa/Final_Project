// backend/src/controllers/userController.ts
import { Request, Response } from 'express'
import pool from '../config/db'
import bcrypt from 'bcrypt'

export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, username, role, created_at, id = $1 AS is_current_user
       FROM users
       ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, created_at DESC`,
      [req.authUser!.id]
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

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' })
    }

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

    if (req.authUser?.role === 'staff') {
      if (id !== req.authUser.id) {
        return res.status(403).json({ success: false, message: 'แก้ไขได้เฉพาะบัญชีของตัวเอง' })
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'role')) {
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เปลี่ยนบทบาทผู้ใช้' })
      }
      const invalidField = Object.keys(req.body).some(key => !['username', 'password'].includes(key))
      if (invalidField || (username !== undefined && typeof username !== 'string') || (password !== undefined && typeof password !== 'string')) {
        return res.status(400).json({ success: false, message: 'Invalid account details' })
      }

      const updates: string[] = []
      const params: string[] = []
      if (username !== undefined) {
        if (!username.trim()) {
          return res.status(400).json({ success: false, message: 'Username cannot be empty' })
        }
        params.push(username.trim())
        updates.push(`username = $${params.length}`)
      }
      if (password) {
        params.push(await bcrypt.hash(password, 10))
        updates.push(`password_hash = $${params.length}`)
      }
      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อผู้ใช้หรือรหัสผ่านที่ต้องการเปลี่ยน' })
      }
      params.push(id)
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING id, username, role, created_at`
      const result = await pool.query(query, params)
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้' })
      }
      return res.json({ success: true, data: result.rows[0] })
    }

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
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
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
