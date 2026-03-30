import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { success, error } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { industryId, status, type, page = '1', limit = '20' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where: any = {}
  if (industryId && industryId !== 'all') where.industryId = industryId
  if (status && status !== 'all') where.status = status
  if (type && type !== 'all') where.type = type

  if (req.user!.role !== 'ADMIN') {
    where.industryId = { in: req.user!.industries }
  }

  const [orders, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: { industry: true, creator: { select: { id: true, name: true } } },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.workOrder.count({ where }),
  ])

  success(res, { orders, total, page: Number(page), limit: Number(limit) })
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const order = await prisma.workOrder.findUnique({
    where: { id: req.params.id },
    include: { industry: true, creator: { select: { id: true, name: true } } },
  })
  if (!order) { error(res, '工单不存在', 404); return }
  success(res, order)
})

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { title, description, type, priority, deadline, industryId } = req.body
  if (!title || !industryId) { error(res, '标题和行业不能为空'); return }

  const now = new Date()
  const orderNo = `WO${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

  const order = await prisma.workOrder.create({
    data: {
      orderNo, title, description, type: type || '其他',
      priority: priority || 'MEDIUM',
      deadline: deadline ? new Date(deadline) : null,
      industryId, creatorId: req.user!.id,
    },
    include: { industry: true, creator: { select: { id: true, name: true } } },
  })
  success(res, order)
})

router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  const { status } = req.body
  const validStatuses = ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']
  if (!validStatuses.includes(status)) { error(res, '无效的状态'); return }

  const order = await prisma.workOrder.update({
    where: { id: req.params.id },
    data: { status },
    include: { industry: true, creator: { select: { id: true, name: true } } },
  })
  success(res, order)
})

router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { title, description, type, priority, deadline, industryId } = req.body
  const order = await prisma.workOrder.update({
    where: { id: req.params.id },
    data: {
      title, description, type, priority,
      deadline: deadline ? new Date(deadline) : undefined,
      industryId,
    },
    include: { industry: true, creator: { select: { id: true, name: true } } },
  })
  success(res, order)
})

export default router
