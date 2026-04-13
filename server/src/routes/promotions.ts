import { Router } from 'express'
import * as XLSX from 'xlsx'
import { prisma } from '../lib/prisma'
import { success, error } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { roleMiddleware } from '../middleware/role'

const router = Router()

const taskInclude = {
  industries: { include: { industry: true } },
  creator: { select: { id: true, name: true } },
  _count: { select: { executions: true } },
}

// ==================== 宣推任务 CRUD ====================

// 获取任务列表
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { industryId, status, page = '1', limit = '20' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const where: any = {}
  if (industryId && industryId !== 'all') {
    where.industries = { some: { industryId: industryId as string } }
  }
  if (status && status !== 'all') where.status = status

  // 非管理员只看自己行业的
  if (req.user!.role !== 'ADMIN') {
    where.industries = { some: { industryId: { in: req.user!.industries } } }
  }
  // 运营只看已发布的
  if (req.user!.role === 'OPERATOR') {
    where.status = status && status !== 'all' ? status : { in: ['PUBLISHED', 'COMPLETED'] }
  }

  const [tasks, total] = await Promise.all([
    prisma.promotionTask.findMany({
      where,
      include: taskInclude,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.promotionTask.count({ where }),
  ])

  // 格式化行业列表
  const formatted = tasks.map((t) => ({
    ...t,
    industryNames: t.industries.map((i) => i.industry.name),
    industryIds: t.industries.map((i) => i.industryId),
  }))

  success(res, { tasks: formatted, total, page: Number(page), limit: Number(limit) })
})

// 获取任务详情
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const task = await prisma.promotionTask.findUnique({
    where: { id: req.params.id },
    include: {
      industries: { include: { industry: true } },
      creator: { select: { id: true, name: true } },
      executions: {
        include: {
          operator: { select: { id: true, name: true } },
          account: { select: { id: true, wechatId: true, realName: true } },
          touchpointData: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!task) { error(res, '任务不存在', 404); return }

  success(res, {
    ...task,
    industryNames: task.industries.map((i) => i.industry.name),
    industryIds: task.industries.map((i) => i.industryId),
  })
})

// 创建任务（仅管理员）
router.post('/', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res) => {
  const { title, description, contentType, priority, deadline, industryIds } = req.body
  if (!title) { error(res, '标题不能为空'); return }
  if (!industryIds || !Array.isArray(industryIds) || industryIds.length === 0) {
    error(res, '请至少选择一个行业'); return
  }

  const now = new Date()
  const taskNo = `PT${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

  const task = await prisma.promotionTask.create({
    data: {
      taskNo,
      title,
      description,
      contentType: contentType || '产品推广',
      priority: priority || 'MEDIUM',
      status: 'PUBLISHED',
      deadline: deadline ? new Date(deadline) : null,
      creatorId: req.user!.id,
      industries: {
        create: industryIds.map((id: string) => ({ industryId: id })),
      },
    },
    include: {
      industries: { include: { industry: true } },
      creator: { select: { id: true, name: true } },
    },
  })
  success(res, {
    ...task,
    industryNames: task.industries.map((i) => i.industry.name),
    industryIds: task.industries.map((i) => i.industryId),
  })
})

// 更新任务
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: AuthRequest, res) => {
  const { title, description, contentType, priority, deadline, industryIds } = req.body

  const task = await prisma.promotionTask.update({
    where: { id: req.params.id },
    data: {
      title, description, contentType, priority,
      deadline: deadline ? new Date(deadline) : undefined,
    },
    include: {
      industries: { include: { industry: true } },
      creator: { select: { id: true, name: true } },
    },
  })

  // 更新行业关联
  if (industryIds && Array.isArray(industryIds)) {
    await prisma.promotionTaskIndustry.deleteMany({ where: { taskId: req.params.id } })
    await prisma.promotionTaskIndustry.createMany({
      data: industryIds.map((id: string) => ({ taskId: req.params.id, industryId: id })),
    })
  }

  const updated = await prisma.promotionTask.findUnique({
    where: { id: req.params.id },
    include: { industries: { include: { industry: true } }, creator: { select: { id: true, name: true } } },
  })
  success(res, {
    ...updated,
    industryNames: updated!.industries.map((i) => i.industry.name),
    industryIds: updated!.industries.map((i) => i.industryId),
  })
})

// 更新任务状态
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  const { status } = req.body
  const valid = ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']
  if (!valid.includes(status)) { error(res, '无效的状态'); return }

  const task = await prisma.promotionTask.update({
    where: { id: req.params.id },
    data: { status },
    include: { industries: { include: { industry: true } } },
  })
  success(res, task)
})

// ==================== 承接记录 ====================

// 承接任务
router.post('/:id/executions', authMiddleware, async (req: AuthRequest, res) => {
  const { accountId, hasContactedManager, contactNote, touchpoints } = req.body
  if (!accountId) { error(res, '请选择执行账号'); return }
  if (!touchpoints || !Array.isArray(touchpoints) || touchpoints.length === 0) {
    error(res, '请至少选择一个宣推触点'); return
  }

  const task = await prisma.promotionTask.findUnique({ where: { id: req.params.id } })
  if (!task) { error(res, '任务不存在', 404); return }
  if (task.status !== 'PUBLISHED') { error(res, '任务状态不允许承接'); return }

  const execution = await prisma.promotionExecution.create({
    data: {
      taskId: req.params.id,
      operatorId: req.user!.id,
      accountId,
      hasContactedManager: !!hasContactedManager,
      contactNote,
      touchpoints: JSON.stringify(touchpoints),
      status: 'IN_PROGRESS',
    },
    include: {
      operator: { select: { id: true, name: true } },
      account: { select: { id: true, wechatId: true, realName: true } },
    },
  })
  success(res, execution)
})

// 获取某任务的承接列表
router.get('/:id/executions', authMiddleware, async (req: AuthRequest, res) => {
  const executions = await prisma.promotionExecution.findMany({
    where: { taskId: req.params.id },
    include: {
      operator: { select: { id: true, name: true } },
      account: { select: { id: true, wechatId: true, realName: true } },
      touchpointData: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  success(res, executions)
})

// ==================== 触点数据登记 ====================

// 提交触点数据
router.post('/touchpoint-data', authMiddleware, async (req: AuthRequest, res) => {
  const { executionId, touchpoint, metrics, executeDate, remark } = req.body
  if (!executionId || !touchpoint) { error(res, '缺少必填参数'); return }

  const execution = await prisma.promotionExecution.findUnique({ where: { id: executionId } })
  if (!execution) { error(res, '承接记录不存在', 404); return }

  const data = await prisma.touchpointData.create({
    data: {
      executionId,
      accountId: execution.accountId,
      touchpoint,
      metrics: JSON.stringify(metrics || {}),
      executeDate: executeDate ? new Date(executeDate) : new Date(),
      remark,
    },
  })
  success(res, data)
})

// 更新触点数据
router.put('/touchpoint-data/:dataId', authMiddleware, async (req: AuthRequest, res) => {
  const { metrics, executeDate, remark } = req.body
  const data = await prisma.touchpointData.update({
    where: { id: req.params.dataId },
    data: {
      metrics: metrics ? JSON.stringify(metrics) : undefined,
      executeDate: executeDate ? new Date(executeDate) : undefined,
      remark,
    },
  })
  success(res, data)
})

// 查询触点数据
router.get('/touchpoint-data', authMiddleware, async (req: AuthRequest, res) => {
  const { executionId, accountId, touchpoint, startDate, endDate } = req.query
  const where: any = {}
  if (executionId) where.executionId = executionId
  if (accountId) where.accountId = accountId
  if (touchpoint && touchpoint !== 'all') where.touchpoint = touchpoint
  if (startDate && endDate) {
    where.executeDate = { gte: new Date(startDate as string), lte: new Date(endDate as string) }
  }

  const data = await prisma.touchpointData.findMany({
    where,
    include: {
      execution: {
        include: {
          task: { select: { id: true, taskNo: true, title: true } },
          operator: { select: { id: true, name: true } },
        },
      },
      account: { select: { id: true, wechatId: true, realName: true } },
    },
    orderBy: { executeDate: 'desc' },
  })
  success(res, data)
})

// ==================== 数据报表 & 导出 ====================

// 汇总报表
router.get('/report/summary', authMiddleware, async (req: AuthRequest, res) => {
  const { industryId, accountId, touchpoint, startDate, endDate } = req.query

  const taskWhere: any = {}
  if (industryId && industryId !== 'all') {
    taskWhere.industries = { some: { industryId: industryId as string } }
  }

  const execWhere: any = {}
  if (accountId) execWhere.accountId = accountId
  if (Object.keys(taskWhere).length > 0) execWhere.task = taskWhere

  const tdWhere: any = {}
  if (touchpoint && touchpoint !== 'all') tdWhere.touchpoint = touchpoint
  if (startDate && endDate) {
    tdWhere.executeDate = { gte: new Date(startDate as string), lte: new Date(endDate as string) }
  }
  if (accountId) tdWhere.accountId = accountId

  const [taskCount, executionCount, touchpointDataList] = await Promise.all([
    prisma.promotionTask.count({ where: taskWhere }),
    prisma.promotionExecution.count({ where: execWhere }),
    prisma.touchpointData.findMany({
      where: tdWhere,
      include: {
        execution: {
          include: {
            task: {
              select: {
                taskNo: true, title: true, contentType: true,
                industries: { include: { industry: { select: { name: true } } } },
              },
            },
            operator: { select: { name: true } },
          },
        },
        account: { select: { wechatId: true, realName: true } },
      },
      orderBy: { executeDate: 'desc' },
    }),
  ])

  success(res, { taskCount, executionCount, touchpointData: touchpointDataList })
})

// 导出 Excel
router.get('/report/export', authMiddleware, async (req: AuthRequest, res) => {
  const { industryId, accountId, touchpoint, startDate, endDate } = req.query

  const where: any = {}
  if (touchpoint && touchpoint !== 'all') where.touchpoint = touchpoint
  if (accountId) where.accountId = accountId
  if (startDate && endDate) {
    where.executeDate = { gte: new Date(startDate as string), lte: new Date(endDate as string) }
  }

  if (industryId && industryId !== 'all') {
    where.execution = { task: { industries: { some: { industryId: industryId as string } } } }
  }

  const dataList = await prisma.touchpointData.findMany({
    where,
    include: {
      execution: {
        include: {
          task: {
            select: {
              taskNo: true, title: true, contentType: true,
              industries: { include: { industry: { select: { name: true } } } },
            },
          },
          operator: { select: { name: true } },
        },
      },
      account: { select: { wechatId: true, realName: true } },
    },
    orderBy: { executeDate: 'desc' },
  })

  const rows = dataList.map((d) => {
    const metrics = JSON.parse(d.metrics)
    const industryNames = d.execution.task.industries?.map((i: any) => i.industry.name).join('、') || ''
    const base: any = {
      '任务编号': d.execution.task.taskNo,
      '任务标题': d.execution.task.title,
      '内容类型': d.execution.task.contentType,
      '行业': industryNames,
      '运营人员': d.execution.operator.name,
      '账号微信ID': d.account.wechatId || '',
      '账号姓名': d.account.realName || '',
      '触点': d.touchpoint === '1V1' ? '1V1私聊' : d.touchpoint === 'MOMENTS' ? '朋友圈' : '社群',
      '执行日期': d.executeDate.toISOString().split('T')[0],
      '备注': d.remark || '',
    }

    if (d.touchpoint === '1V1') {
      base['发送人数'] = metrics.sendCount || 0
      base['回复人数'] = metrics.replyCount || 0
      base['回复率'] = metrics.replyRate || 0
      base['新增好友'] = metrics.addFriendCount || 0
      base['删除/拉黑'] = metrics.deleteCount || 0
    } else if (d.touchpoint === 'MOMENTS') {
      base['发布条数'] = metrics.publishCount || 0
      base['浏览量'] = metrics.viewCount || 0
      base['点赞数'] = metrics.likeCount || 0
      base['评论数'] = metrics.commentCount || 0
      base['链接点击'] = metrics.clickCount || 0
    } else if (d.touchpoint === 'GROUP') {
      base['群发群数'] = metrics.groupCount || 0
      base['群发人数'] = metrics.sendCount || 0
      base['阅读人数'] = metrics.readCount || 0
      base['互动人数'] = metrics.interactCount || 0
      base['新入群'] = metrics.newMemberCount || 0
      base['退群'] = metrics.exitCount || 0
    }
    return base
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '宣发数据')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename=promotion-report-${Date.now()}.xlsx`)
  res.send(buf)
})

export default router
