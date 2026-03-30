import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { success } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { industryId, category, startDate, endDate } = req.query

  const where: any = { category: category as string }

  if (industryId && industryId !== 'all') {
    where.industryId = industryId
  } else if (req.user!.role !== 'ADMIN') {
    where.industryId = { in: req.user!.industries }
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    }
  }

  const data = await prisma.dashboardData.findMany({
    where,
    include: { industry: true },
    orderBy: { date: 'asc' },
  })

  const parsed = data.map((d) => ({
    ...d,
    metrics: JSON.parse(d.metrics),
  }))

  success(res, parsed)
})

router.get('/summary', authMiddleware, async (req: AuthRequest, res) => {
  const industryFilter: any = {}
  if (req.user!.role !== 'ADMIN') {
    industryFilter.industryId = { in: req.user!.industries }
  }

  const [accountCount, todoCount, pendingOrders] = await Promise.all([
    prisma.account.count({ where: { ...industryFilter, status: 'NORMAL' } }),
    prisma.todo.count({ where: { userId: req.user!.id, completed: false } }),
    prisma.workOrder.count({ where: { ...industryFilter, status: 'PENDING' } }),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const latestCustomerData = await prisma.dashboardData.findMany({
    where: { ...industryFilter, category: 'CUSTOMER', date: { gte: monthStart } },
  })

  let newCustomers = 0
  for (const d of latestCustomerData) {
    const metrics = JSON.parse(d.metrics)
    newCustomers += metrics.newAdded || 0
  }

  success(res, { accountCount, newCustomers, pendingOrders, todoCount })
})

export default router
