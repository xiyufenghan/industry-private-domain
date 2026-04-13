import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { Plus, Eye, CheckCircle, XCircle } from 'lucide-react'
import api from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
import {
  Role, PromotionStatus, PromotionStatusLabel, PromotionStatusColor,
  PriorityLabel, PriorityColor,
} from '../../lib/constants'

export default function PromotionsPage() {
  const { user, selectedIndustry } = useOutletContext<any>()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/promotions', {
        params: { industryId: selectedIndustry, status: statusFilter, page, limit: 20 },
      })
      setTasks(res.data.tasks)
      setTotal(res.data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [selectedIndustry, statusFilter, page])

  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/promotions/${id}/status`, { status })
    fetchTasks()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">宣推任务</h1>
          <p className="text-sm text-gray-500 mt-1">管理私域推送宣发需求</p>
        </div>
        {user.role === Role.ADMIN && (
          <button
            onClick={() => navigate('/promotions/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            下发宣推需求
          </button>
        )}
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-3">
        {['all', ...Object.values(PromotionStatus)].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
              statusFilter === s
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {s === 'all' ? '全部' : PromotionStatusLabel[s as PromotionStatus]}
          </button>
        ))}
        <span className="text-sm text-gray-400 ml-auto">共 {total} 条</span>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">暂无宣推任务</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">任务编号</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">标题</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">行业</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">内容类型</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">优先级</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">承接数</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">截止时间</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-gray-500">{task.taskNo}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{task.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {(task.industryNames || []).map((name: string, i: number) => (
                        <span key={i} className="inline-flex px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{task.contentType}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${PriorityColor[task.priority as keyof typeof PriorityColor] || ''}`}>
                      {PriorityLabel[task.priority as keyof typeof PriorityLabel] || task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${PromotionStatusColor[task.status as PromotionStatus] || ''}`}>
                      {PromotionStatusLabel[task.status as PromotionStatus] || task.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{task._count?.executions || 0}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{task.deadline ? formatDateTime(task.deadline) : '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/promotions/${task.id}`}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {user.role === Role.ADMIN && task.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                          className="p-1.5 rounded hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
                          title="标记完成"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.role === Role.ADMIN && task.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'CANCELLED')}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                          title="取消任务"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded border border-gray-200 disabled:opacity-50 cursor-pointer"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">第 {page} 页</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 20 >= total}
            className="px-3 py-1.5 text-sm rounded border border-gray-200 disabled:opacity-50 cursor-pointer"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
