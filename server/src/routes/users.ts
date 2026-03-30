import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { success, error } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'

const router = Router()

router.get('/', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, role: true, createdAt: true, industries: { include: { industry: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const mapped = users.map((u) => ({
    ...u,
    industries: u.industries.map((ui) => ({ id: ui.industry.id, name: ui.industry.name, code: ui.industry.code })),
  }))
  success(res, mapped)
})

router.post('/', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res) => {
  const { username, password, name, role, industryIds } = req.body
  if (!username || !password || !name) { error(res, '用户名、密码和姓名不能为空'); return }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      username, password: hashed, name, role: role || 'OPERATOR',
      industries: { create: (industryIds || []).map((id: string) => ({ industryId: id })) },
    },
    include: { industries: { include: { industry: true } } },
  })
  success(res, { id: user.id, username: user.username, name: user.name, role: user.role })
})

router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res) => {
  const { name, role, password, industryIds } = req.body
  const data: any = {}
  if (name) data.name = name
  if (role) data.role = role
  if (password) data.password = await bcrypt.hash(password, 10)

  const user = await prisma.user.update({ where: { id: req.params.id }, data })

  if (industryIds) {
    await prisma.userIndustry.deleteMany({ where: { userId: req.params.id } })
    await prisma.userIndustry.createMany({
      data: industryIds.map((id: string) => ({ userId: req.params.id, industryId: id })),
    })
  }

  success(res, { id: user.id, username: user.username, name: user.name, role: user.role })
})

export default router
