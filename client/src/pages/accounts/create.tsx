import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import api from '../../lib/api'

export default function AccountCreatePage() {
  const navigate = useNavigate()
  const [industries, setIndustries] = useState<any[]>([])
  const [form, setForm] = useState({ wechatId: '', realName: '', phone: '', industryId: '', device: { model: '', imei: '' } })

  useEffect(() => { api.get('/industries').then((res: any) => setIndustries(res.data)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/accounts', form)
    navigate('/accounts')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/accounts')} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">新增账号</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">微信号</label>
                <Input value={form.wechatId} onChange={(e) => setForm({ ...form, wechatId: e.target.value })} placeholder="wx_xxx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">实名</label>
                <Input value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })} placeholder="请输入真实姓名" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="13800000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属行业 *</label>
                <select required className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.industryId} onChange={(e) => setForm({ ...form, industryId: e.target.value })}>
                  <option value="">请选择行业</option>
                  {industries.map((ind) => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm mb-6">
          <CardHeader><CardTitle>设备信息</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">设备型号</label>
              <Input value={form.device.model} onChange={(e) => setForm({ ...form, device: { ...form.device, model: e.target.value } })} placeholder="iPhone 15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMEI</label>
              <Input value={form.device.imei} onChange={(e) => setForm({ ...form, device: { ...form.device, imei: e.target.value } })} placeholder="设备 IMEI 号" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/accounts')}>取消</Button>
          <Button type="submit"><Save className="w-4 h-4 mr-2" />创建</Button>
        </div>
      </form>
    </div>
  )
}
