import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { RoleLabel } from '../../lib/constants'
import api from '../../lib/api'

export default function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [industries, setIndustries] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'OPERATOR', industryIds: [] as string[] })

  const fetch = () => { api.get('/users').then((res: any) => setUsers(res.data)) }
  useEffect(() => {
    fetch()
    api.get('/industries').then((res: any) => setIndustries(res.data))
  }, [])

  const handleAdd = async () => {
    if (!form.username || !form.password || !form.name) return
    await api.post('/users', form)
    setForm({ username: '', password: '', name: '', role: 'OPERATOR', industryIds: [] })
    setShowForm(false)
    fetch()
  }

  const toggleIndustry = (id: string) => {
    setForm((f) => ({
      ...f,
      industryIds: f.industryIds.includes(id) ? f.industryIds.filter((i) => i !== id) : [...f.industryIds, id],
    }))
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-2" />新增用户</Button>
      </div>

      {showForm && (
        <Card className="border-0 shadow-sm animate-fade-in">
          <CardHeader><CardTitle className="text-base">新增用户</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">用户名 *</label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">密码 *</label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="ADMIN">管理员</option><option value="MANAGER">市场经理</option><option value="OPERATOR">运营人员</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">关联行业</label>
              <div className="flex flex-wrap gap-2">
                {industries.map((ind) => (
                  <button key={ind.id} onClick={() => toggleIndustry(ind.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${form.industryIds.includes(ind.id) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {ind.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>取消</Button><Button onClick={handleAdd}><Save className="w-4 h-4 mr-2" />保存</Button></div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-500">用户名</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">角色</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">关联行业</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{u.username}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{u.name}</td>
                  <td className="py-3 px-4"><Badge variant="secondary">{RoleLabel[u.role as keyof typeof RoleLabel] || u.role}</Badge></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {u.industries?.map((ind: any) => (
                        <span key={ind.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{ind.name}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
