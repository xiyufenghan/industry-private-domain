import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

export function roleMiddleware(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未登录' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: '权限不足' })
      return
    }
    next()
  }
}

export function industryGuard(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未登录' })
    return
  }
  if (req.user.role === 'ADMIN') {
    next()
    return
  }
  const industryId = req.params.industryId || req.query.industryId || req.body?.industryId
  if (industryId && industryId !== 'all' && !req.user.industries.includes(industryId)) {
    res.status(403).json({ success: false, error: '无权访问该行业数据' })
    return
  }
  next()
}
