import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { success, error } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { industryId, status, search, page = '1', limit = '20' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where: any = {}
  if (industryId && industryId !== 'all') where.industryId = industryId
  if (status && status !== 'all') where.status = status
  if (search) {
    where.OR = [
      { wechatId: { contains: search as string } },
      { realName: { contains: search as string } },
      { phone: { contains: search as string } },
    ]
  }

  if (req.user!.role !== 'ADMIN') {
    where.industryId = { in: req.user!.industries }
  }

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      include: { industry: true, device: true },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.account.count({ where }),
  ])

  success(res, { accounts, total, page: Number(page), limit: Number(limit) })
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const account = await prisma.account.findUnique({
    where: { id: req.params.id },
    include: { industry: true, device: true },
  })
  if (!account) { error(res, '账号不存在', 404); return }
  success(res, account)
})

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { wechatId, realName, phone, status, remark, industryId, device } = req.body
  if (!industryId) { error(res, '请选择所属行业'); return }

  const account = await prisma.account.create({
    data: {
      wechatId, realName, phone, status: status || 'NORMAL', remark, industryId,
      device: device ? { create: { model: device.model, imei: device.imei, status: device.status || 'IN_USE' } } : undefined,
    },
    include: { industry: true, device: true },
  })
  success(res, account)
})

router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { wechatId, realName, phone, status, remark, industryId, device } = req.body
  const account = await prisma.account.update({
    where: { id: req.params.id },
    data: { wechatId, realName, phone, status, remark, industryId },
    include: { industry: true, device: true },
  })

  if (device) {
    if (account.device) {
      await prisma.device.update({ where: { id: account.device.id }, data: device })
    } else {
      await prisma.device.create({ data: { ...device, accountId: account.id } })
    }
  }
  const updated = await prisma.account.findUnique({ where: { id: req.params.id }, include: { industry: true, device: true } })
  success(res, updated)
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  await prisma.account.delete({ where: { id: req.params.id } })
  success(res, null, '删除成功')
})

export default router
