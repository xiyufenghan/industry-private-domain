import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import api from '../../lib/api'

export default function AccountDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [account, setAccount] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    api.get(`/accounts/${id}`).then((res: any) => {
      setAccount(res.data)
      setForm(res.data)
    })
  }, [id])

  const handleSave = async () => {
    await api.put(`/accounts/${id}`, {
      ...form,
      device: form.device ? { model: form.device.model, imei: form.device.imei, status: form.device.status } : undefined,
    })
    navigate('/accounts')
  }

  if (!account) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/accounts')} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">账号详情</h1>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">微信号</label>
              <Input value={form.wechatId || ''} onChange={(e) => setForm({ ...form, wechatId: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">实名</label>
              <Input value={form.realName || ''} onChange={(e) => setForm({ ...form, realName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
              <Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status || 'NORMAL'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="NORMAL">正常</option>
                <option value="ABNORMAL">异常</option>
                <option value="BANNED">封禁</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>设备信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">设备型号</label>
              <Input value={form.device?.model || ''} onChange={(e) => setForm({ ...form, device: { ...form.device, model: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMEI</label>
              <Input value={form.device?.imei || ''} onChange={(e) => setForm({ ...form, device: { ...form.device, imei: e.target.value } })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/accounts')}>取消</Button>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />保存</Button>
      </div>
    </div>
  )
}
