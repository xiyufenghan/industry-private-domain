import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { success, error } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const todos = await prisma.todo.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  })
  success(res, todos)
})

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { title, dueDate } = req.body
  if (!title) { error(res, '待办标题不能为空'); return }
  const todo = await prisma.todo.create({
    data: { title, dueDate: dueDate ? new Date(dueDate) : null, userId: req.user!.id },
  })
  success(res, todo)
})

router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { completed, title, dueDate } = req.body
  const data: any = {}
  if (completed !== undefined) data.completed = completed
  if (title !== undefined) data.title = title
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
  const todo = await prisma.todo.update({ where: { id: req.params.id }, data })
  success(res, todo)
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  await prisma.todo.delete({ where: { id: req.params.id } })
  success(res, null, '删除成功')
})

export default router
