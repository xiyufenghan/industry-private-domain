import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { OrderStatusLabel, OrderStatusColor, PriorityLabel, PriorityColor } from '../../lib/constants'
import api from '../../lib/api'
import { formatDate } from '../../lib/utils'

export default function OrdersPage() {
  const { selectedIndustry } = useOutletContext<any>()
  const [orders, setOrders] = useState<any[]>([])
  const [view, setView] = useState<'board' | 'list'>('board')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const params: any = { limit: 100 }
    if (selectedIndustry !== 'all') params.industryId = selectedIndustry
    if (statusFilter !== 'all') params.status = statusFilter
    api.get('/orders', { params }).then((res: any) => setOrders(res.data.orders || []))
  }, [selectedIndustry, statusFilter])

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status })
    setOrders(orders.map((o) => o.id === id ? { ...o, status } : o))
  }

  const boardColumns = [
    { status: 'PENDING', label: '待处理', color: 'border-t-yellow-400' },
    { status: 'IN_PROGRESS', label: '进行中', color: 'border-t-blue-400' },
    { status: 'DONE', label: '已完成', color: 'border-t-green-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">需求工单</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView('board')} className={`p-2 rounded-md transition-colors cursor-pointer ${view === 'board' ? 'bg-white shadow-sm' : ''}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors cursor-pointer ${view === 'list' ? 'bg-white shadow-sm' : ''}`}><List className="w-4 h-4" /></button>
          </div>
          <Link to="/workspace/orders/new"><Button size="sm"><Plus className="w-4 h-4 mr-2" />新建工单</Button></Link>
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-3 gap-5">
          {boardColumns.map((col) => (
            <div key={col.status}>
              <div className={`border-t-2 ${col.color} bg-white rounded-lg shadow-sm`}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <h3 className="font-medium text-sm text-gray-700">{col.label}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                    {orders.filter((o) => o.status === col.status).length}
                  </span>
                </div>
                <div className="px-3 pb-3 space-y-2.5 max-h-[600px] overflow-y-auto">
                  {orders.filter((o) => o.status === col.status).map((order) => (
                    <Link key={order.id} to={`/workspace/orders/${order.id}`}>
                      <Card className="border shadow-none hover:shadow-sm transition-all duration-200 cursor-pointer mb-2">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{order.title}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${PriorityColor[order.priority as keyof typeof PriorityColor]}`}>
                              {PriorityLabel[order.priority as keyof typeof PriorityLabel]}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{order.industry?.name}</span>
                          </div>
                          {order.deadline && (
                            <p className="text-[10px] text-gray-400 mt-2">截止 {formatDate(order.deadline)}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">工单号</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">标题</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">类型</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">行业</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">优先级</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">截止</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{order.orderNo}</td>
                    <td className="py-3 px-4"><Link to={`/workspace/orders/${order.id}`} className="text-gray-800 hover:text-primary">{order.title}</Link></td>
                    <td className="py-3 px-4 text-gray-600">{order.type}</td>
                    <td className="py-3 px-4 text-gray-600">{order.industry?.name}</td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded ${PriorityColor[order.priority as keyof typeof PriorityColor]}`}>{PriorityLabel[order.priority as keyof typeof PriorityLabel]}</span></td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full ${OrderStatusColor[order.status as keyof typeof OrderStatusColor]}`}>{OrderStatusLabel[order.status as keyof typeof OrderStatusLabel]}</span></td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{order.deadline ? formatDate(order.deadline) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
