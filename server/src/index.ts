import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth'
import accountRoutes from './routes/accounts'
import dashboardRoutes from './routes/dashboard'
import importRoutes from './routes/import'
import orderRoutes from './routes/orders'
import todoRoutes from './routes/todos'
import industryRoutes from './routes/industries'
import userRoutes from './routes/users'
import copywriterRoutes from './routes/copywriter'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/import', importRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/todos', todoRoutes)
app.use('/api/industries', industryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/copywriter', copywriterRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 生产环境：托管前端静态文件
const clientDist = path.join(__dirname, '../../client/dist')
app.use(express.static(clientDist))

// 所有非 /api 路由返回 index.html（支持前端路由）
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'))
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
