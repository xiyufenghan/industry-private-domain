import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Plus, Search, Download, Upload } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { AccountStatusLabel, AccountStatusColor } from '../../lib/constants'
import api from '../../lib/api'

export default function AccountsPage() {
  const { selectedIndustry } = useOutletContext<any>()
  const [accounts, setAccounts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const fetchAccounts = () => {
    const params: any = { page, limit: 20 }
    if (selectedIndustry !== 'all') params.industryId = selectedIndustry
    if (statusFilter !== 'all') params.status = statusFilter
    if (search) params.search = search
    api.get('/accounts', { params }).then((res: any) => {
      setAccounts(res.data.accounts)
      setTotal(res.data.total)
    })
  }

  useEffect(() => { fetchAccounts() }, [selectedIndustry, statusFilter, page])

  const statuses = ['all', 'NORMAL', 'ABNORMAL', 'BANNED']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">账号管理</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />批量导入</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />导出</Button>
          <Link to="/accounts/new"><Button size="sm"><Plus className="w-4 h-4 mr-2" />新增账号</Button></Link>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索微信号、姓名、手机号..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAccounts()}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${statusFilter === s ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {s === 'all' ? '全部' : AccountStatusLabel[s as keyof typeof AccountStatusLabel]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">微信号</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">实名</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">手机号</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">绑定设备</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">行业</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{acc.wechatId || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{acc.realName || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{acc.phone || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{acc.device?.model || '-'}</td>
                    <td className="py-3 px-4"><Badge variant="secondary">{acc.industry?.name}</Badge></td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AccountStatusColor[acc.status as keyof typeof AccountStatusColor] || ''}`}>
                        {AccountStatusLabel[acc.status as keyof typeof AccountStatusLabel] || acc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/accounts/${acc.id}`} className="text-primary text-sm hover:underline">详情</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {accounts.length === 0 && (
            <p className="text-center text-gray-400 py-12">暂无账号数据</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">共 {total} 条记录</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
              <Button variant="outline" size="sm" disabled={accounts.length < 20} onClick={() => setPage(page + 1)}>下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
