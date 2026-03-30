import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'industry-workspace-jwt-secret-2024'

export interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    role: string
    industries: string[]
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未登录，请先登录' })
    return
  }

  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, JWT_SECRET) as any
  req.user = {
    id: decoded.id,
    username: decoded.username,
    role: decoded.role,
    industries: decoded.industries || [],
  }
  next()
}
