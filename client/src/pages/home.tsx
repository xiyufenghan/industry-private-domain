import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Users, UserPlus, ClipboardList, CheckSquare, ArrowUpRight, ArrowDownRight, FileText, PenTool, BarChart3, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import api from '../lib/api'

export default function HomePage() {
  const { user } = useOutletContext<any>()
  const [summary, setSummary] = useState<any>({})
  const [todos, setTodos] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    api.get('/dashboard/summary').then((res: any) => setSummary(res.data))
    api.get('/todos').then((res: any) => setTodos(res.data.slice(0, 5)))
    api.get('/orders?limit=5').then((res: any) => setOrders(res.data.orders || []))
  }, [])

  const toggleTodo = async (id: string, completed: boolean) => {
    await api.patch(`/todos/${id}`, { completed: !completed })
    setTodos(todos.map((t) => t.id === id ? { ...t, completed: !completed } : t))
  }

  const statCards = [
    { label: '管理账号', value: summary.accountCount || 0, icon: Users, color: 'from-blue-500 to-blue-600', change: 12 },
    { label: '本月新增客户', value: summary.newCustomers || 0, icon: UserPlus, color: 'from-emerald-500 to-emerald-600', change: 8 },
    { label: '待处理工单', value: summary.pendingOrders || 0, icon: ClipboardList, color: 'from-orange-400 to-orange-500', change: -5 },
    { label: '今日待办', value: summary.todoCount || 0, icon: CheckSquare, color: 'from-violet-500 to-violet-600', change: 0 },
  ]

  const quickLinks = [
    { label: '数据导入', icon: BarChart3, path: '/dashboard/import', desc: '导入行业运营数据' },
    { label: '新建工单', icon: Plus, path: '/workspace/orders', desc: '创建运营需求工单' },
    { label: '文案生成', icon: FileText, path: '/workspace/copywriter', desc: '生成行业推广文案' },
    { label: '排版编辑', icon: PenTool, path: '/workspace/editor', desc: '公众号图文排版' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">你好，{user?.name} 👋</h1>
          <p className="text-gray-500 mt-1">欢迎回到行业私域工作间，以下是今日概览</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <Card key={i} className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.change > 0 ? (
                      <><ArrowUpRight className="w-3.5 h-3.5 text-green-500" /><span className="text-xs text-green-600">+{card.change}%</span></>
                    ) : card.change < 0 ? (
                      <><ArrowDownRight className="w-3.5 h-3.5 text-red-500" /><span className="text-xs text-red-600">{card.change}%</span></>
                    ) : (
                      <span className="text-xs text-gray-400">较上期持平</span>
                    )}
                    <span className="text-xs text-gray-400 ml-1">较上期</span>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two columns: Todos + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              今日待办
              <Link to="/workspace/orders" className="text-sm text-primary font-normal hover:underline">查看全部</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">暂无待办事项</p>
            ) : (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {todo.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              近期工单
              <Link to="/workspace/orders" className="text-sm text-primary font-normal hover:underline">查看全部</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">暂无工单</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div key={order.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-1.5 h-8 rounded-full ${order.priority === 'URGENT' ? 'bg-red-400' : order.priority === 'HIGH' ? 'bg-orange-400' : order.priority === 'MEDIUM' ? 'bg-blue-400' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{order.title}</p>
                      <p className="text-xs text-gray-400">{order.industry?.name} · {order.orderNo}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : order.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {order.status === 'PENDING' ? '待处理' : order.status === 'IN_PROGRESS' ? '进行中' : '已完成'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <Card className="border-0 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <link.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-sm text-gray-800">{link.label}</p>
                <p className="text-xs text-gray-400 mt-1">{link.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
