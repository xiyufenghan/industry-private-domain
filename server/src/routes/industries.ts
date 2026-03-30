import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { success, error } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const industries = await prisma.industry.findMany({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
  })
  success(res, industries)
})

router.post('/', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res) => {
  const { name, code, description } = req.body
  if (!name || !code) {
    error(res, '行业名称和代码不能为空')
    return
  }
  const industry = await prisma.industry.create({ data: { name, code, description } })
  success(res, industry)
})

router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res) => {
  const { id } = req.params
  const { name, code, description, active } = req.body
  const industry = await prisma.industry.update({
    where: { id },
    data: { name, code, description, active },
  })
  success(res, industry)
})

export default router
