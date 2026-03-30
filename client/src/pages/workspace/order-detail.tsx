import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { OrderStatusLabel, PriorityLabel, PriorityColor } from '../../lib/constants'
import api from '../../lib/api'
import { formatDateTime } from '../../lib/utils'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)

  useEffect(() => { api.get(`/orders/${id}`).then((res: any) => setOrder(res.data)) }, [id])

  const updateStatus = async (status: string) => {
    const res: any = await api.patch(`/orders/${id}/status`, { status })
    setOrder(res.data)
  }

  if (!order) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const nextStatuses: Record<string, string[]> = {
    PENDING: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['DONE', 'CANCELLED'],
    DONE: [],
    CANCELLED: [],
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/workspace/orders')} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.title}</h1>
          <p className="text-sm text-gray-400">{order.orderNo}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">工单信息</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div><p className="text-xs text-gray-400 mb-1">状态</p><span className="text-sm font-medium">{OrderStatusLabel[order.status as keyof typeof OrderStatusLabel]}</span></div>
            <div><p className="text-xs text-gray-400 mb-1">优先级</p><span className={`text-xs px-2 py-0.5 rounded ${PriorityColor[order.priority as keyof typeof PriorityColor]}`}>{PriorityLabel[order.priority as keyof typeof PriorityLabel]}</span></div>
            <div><p className="text-xs text-gray-400 mb-1">行业</p><span className="text-sm">{order.industry?.name}</span></div>
            <div><p className="text-xs text-gray-400 mb-1">类型</p><span className="text-sm">{order.type}</span></div>
            <div><p className="text-xs text-gray-400 mb-1">创建人</p><span className="text-sm">{order.creator?.name}</span></div>
            <div><p className="text-xs text-gray-400 mb-1">截止日期</p><span className="text-sm">{order.deadline ? formatDateTime(order.deadline) : '未设置'}</span></div>
            <div className="col-span-2"><p className="text-xs text-gray-400 mb-1">创建时间</p><span className="text-sm">{formatDateTime(order.createdAt)}</span></div>
          </div>
          {order.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">描述</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {nextStatuses[order.status]?.length > 0 && (
        <div className="flex gap-3">
          {nextStatuses[order.status].map((s) => (
            <Button key={s} variant={s === 'CANCELLED' ? 'outline' : 'default'} onClick={() => updateStatus(s)}>
              {OrderStatusLabel[s as keyof typeof OrderStatusLabel]}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
