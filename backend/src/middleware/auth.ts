import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; username: string; role: string }
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers['authorization']
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })

  try {
    const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload
    if (typeof payload !== 'object' || !payload.id || !payload.role) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' })
    }
    req.authUser = {
      id: String(payload.id),
      username: String(payload.username || ''),
      role: String(payload.role),
    }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.authUser || !['admin', 'superadmin'].includes(req.authUser.role)) {
    return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง' })
  }
  next()
}

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })

  try {
    const payload = jwt.verify(token, getJwtSecret()) as any
    if (payload.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง' })
    }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
