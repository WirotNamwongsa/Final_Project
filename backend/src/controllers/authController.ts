// backend/src/controllers/authController.ts
import { Request, Response } from 'express'
import pool from '../config/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // ค้นหา user ใน database
    const result = await pool.query(
      'SELECT id, username, password_hash, role FROM users WHERE username = $1',
      [username]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' 
      })
    }

    const user = result.rows[0]

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' 
      })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    )

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' 
    })
  }
}

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