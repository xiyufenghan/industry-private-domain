import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import api from '../../lib/api'

export default function IndustriesPage() {
  const navigate = useNavigate()
  const [industries, setIndustries] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', description: '' })

  const fetch = () => { api.get('/industries').then((res: any) => setIndustries(res.data)) }
  useEffect(() => { fetch() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.code) return
    await api.post('/industries', form)
    setForm({ name: '', code: '', description: '' })
    setShowForm(false)
    fetch()
  }

  const toggleActive = async (id: string, active: boolean) => {
    await api.put(`/industries/${id}`, { active: !active })
    fetch()
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">行业管理</h1>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-2" />新增行业</Button>
      </div>

      {showForm && (
        <Card className="border-0 shadow-sm animate-fade-in">
          <CardHeader><CardTitle className="text-base">新增行业</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">行业名称 *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：本地生活" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">行业代码 *</label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="如：LOCAL" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="行业描述" /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>取消</Button><Button onClick={handleAdd}><Save className="w-4 h-4 mr-2" />保存</Button></div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-500">名称</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">代码</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">描述</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
            </tr></thead>
            <tbody>
              {industries.map((ind) => (
                <tr key={ind.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-medium text-gray-800">{ind.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{ind.code}</td>
                  <td className="py-3 px-4 text-gray-600">{ind.description || '-'}</td>
                  <td className="py-3 px-4"><Badge variant={ind.active !== false ? 'default' : 'secondary'}>{ind.active !== false ? '启用' : '停用'}</Badge></td>
                  <td className="py-3 px-4"><button onClick={() => toggleActive(ind.id, ind.active !== false)} className="text-sm text-primary hover:underline cursor-pointer">{ind.active !== false ? '停用' : '启用'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
