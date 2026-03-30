import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { OrderTypes } from '../../lib/constants'
import api from '../../lib/api'

export default function OrderCreatePage() {
  const navigate = useNavigate()
  const [industries, setIndustries] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', description: '', type: '公众号排版', priority: 'MEDIUM', deadline: '', industryId: '' })

  useEffect(() => { api.get('/industries').then((res: any) => setIndustries(res.data)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/orders', form)
    navigate('/workspace/orders')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/workspace/orders')} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">新建工单</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader><CardTitle>工单信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="请输入工单标题" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属行业 *</label>
                <select required className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.industryId} onChange={(e) => setForm({ ...form, industryId: e.target.value })}>
                  <option value="">请选择行业</option>
                  {industries.map((ind) => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {OrderTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="LOW">低</option>
                  <option value="MEDIUM">中</option>
                  <option value="HIGH">高</option>
                  <option value="URGENT">紧急</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="详细描述需求内容..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/workspace/orders')}>取消</Button>
          <Button type="submit"><Save className="w-4 h-4 mr-2" />创建工单</Button>
        </div>
      </form>
    </div>
  )
}
