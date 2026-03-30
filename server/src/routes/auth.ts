import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { success, error } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'industry-workspace-jwt-secret-2024'

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    error(res, '请输入用户名和密码')
    return
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { industries: { include: { industry: true } } },
  })

  if (!user) {
    error(res, '用户名或密码错误')
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    error(res, '用户名或密码错误')
    return
  }

  const industryIds = user.industries.map((ui) => ui.industryId)
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, industries: industryIds },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  success(res, {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      industries: user.industries.map((ui) => ({
        id: ui.industry.id,
        name: ui.industry.name,
        code: ui.industry.code,
      })),
    },
  })
})

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { industries: { include: { industry: true } } },
  })

  if (!user) {
    error(res, '用户不存在', 404)
    return
  }

  success(res, {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    industries: user.industries.map((ui) => ({
      id: ui.industry.id,
      name: ui.industry.name,
      code: ui.industry.code,
    })),
  })
})

export default router
