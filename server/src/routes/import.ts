import { Router } from 'express'
import multer from 'multer'
import * as XLSX from 'xlsx'
import { prisma } from '../lib/prisma'
import { success, error } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/logs', authMiddleware, async (req: AuthRequest, res) => {
  const { industryId, category, page = '1', limit = '20' } = req.query
  const skip = (Number(page) - 1) * Number(limit)
  const where: any = {}
  if (industryId && industryId !== 'all') where.industryId = industryId
  if (category && category !== 'all') where.category = category

  const [logs, total] = await Promise.all([
    prisma.importLog.findMany({
      where, include: { user: { select: { name: true } }, industry: { select: { name: true } } },
      skip, take: Number(limit), orderBy: { createdAt: 'desc' },
    }),
    prisma.importLog.count({ where }),
  ])
  success(res, { logs, total })
})

router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) { error(res, '请上传文件'); return }
  const { category, industryId } = req.body
  if (!category || !industryId) { error(res, '请选择数据类别和行业'); return }

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)

  if (rows.length === 0) { error(res, 'Excel 文件没有数据行'); return }

  const errors: Array<{ row: number; field: string; message: string }> = []
  let successCount = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2
    const rowErrors: string[] = []

    if (!row['日期']) rowErrors.push('缺少日期字段')

    if (rowErrors.length > 0) {
      errors.push(...rowErrors.map((msg) => ({ row: rowNum, field: '通用', message: msg })))
      continue
    }

    const dateVal = row['日期']
    let date: Date
    if (typeof dateVal === 'number') {
      date = new Date((dateVal - 25569) * 86400 * 1000)
    } else {
      date = new Date(dateVal)
    }
    if (isNaN(date.getTime())) {
      errors.push({ row: rowNum, field: '日期', message: '日期格式无效' })
      continue
    }

    let metrics: any = {}
    if (category === 'OA') {
      metrics = {
        followers: Number(row['粉丝数'] || 0),
        newFollowers: Number(row['新增粉丝'] || 0),
        reads: Number(row['阅读量'] || 0),
        interactions: Number(row['互动数'] || 0),
      }
    } else if (category === 'CUSTOMER') {
      metrics = {
        total: Number(row['客户总量'] || 0),
        newAdded: Number(row['新增客户'] || 0),
        active: Number(row['活跃客户'] || 0),
      }
    } else if (category === 'IDENTITY') {
      metrics = {
        identified: Number(row['已识别'] || 0),
        unidentified: Number(row['未识别'] || 0),
      }
    } else if (category === 'ACTIVITY') {
      metrics = {
        activityName: row['活动名称'] || '',
        participants: Number(row['参与人数'] || 0),
        conversions: Number(row['转化数'] || 0),
        conversionRate: Number(row['转化率'] || 0),
      }
    }

    await prisma.dashboardData.create({
      data: { date, category, industryId, metrics: JSON.stringify(metrics) },
    })
    successCount++
  }

  const importStatus = errors.length === 0 ? 'SUCCESS' : successCount > 0 ? 'PARTIAL' : 'FAILED'
  const log = await prisma.importLog.create({
    data: {
      fileName: req.file.originalname,
      category, industryId, userId: req.user!.id,
      totalRows: rows.length, successRows: successCount, failRows: errors.length,
      status: importStatus,
      errors: errors.length > 0 ? JSON.stringify(errors) : null,
    },
  })

  success(res, { importLogId: log.id, totalRows: rows.length, successRows: successCount, failRows: errors.length, errors })
})

export default router
