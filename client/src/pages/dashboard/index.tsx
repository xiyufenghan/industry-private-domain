import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Upload, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../lib/api'
import { formatDate } from '../../lib/utils'

export default function DashboardPage() {
  const { selectedIndustry } = useOutletContext<any>()
  const [timeRange, setTimeRange] = useState('30')
  const [oaData, setOaData] = useState<any[]>([])
  const [customerData, setCustomerData] = useState<any[]>([])
  const [identityData, setIdentityData] = useState<any[]>([])

  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - Number(timeRange))

    const params: any = { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }
    if (selectedIndustry !== 'all') params.industryId = selectedIndustry

    api.get('/dashboard', { params: { ...params, category: 'OA' } }).then((res: any) => setOaData(res.data))
    api.get('/dashboard', { params: { ...params, category: 'CUSTOMER' } }).then((res: any) => setCustomerData(res.data))
    api.get('/dashboard', { params: { ...params, category: 'IDENTITY' } }).then((res: any) => setIdentityData(res.data))
  }, [selectedIndustry, timeRange])

  const latestOa = oaData.length > 0 ? oaData[oaData.length - 1]?.metrics : {}
  const prevOa = oaData.length > 1 ? oaData[oaData.length - 2]?.metrics : {}
  const latestCust = customerData.length > 0 ? customerData[customerData.length - 1]?.metrics : {}

  const identified = identityData.length > 0 ? identityData[identityData.length - 1]?.metrics?.identified || 0 : 0
  const unidentified = identityData.length > 0 ? identityData[identityData.length - 1]?.metrics?.unidentified || 0 : 0
  const pieData = [
    { name: '已识别', value: identified, color: '#0052D9' },
    { name: '未识别', value: unidentified, color: '#10B981' },
  ]

  const oaChartData = oaData.map((d) => ({
    date: formatDate(d.date),
    粉丝数: d.metrics.followers,
    阅读量: d.metrics.reads,
    互动数: d.metrics.interactions,
  }))

  const custChartData = customerData.map((d) => ({
    date: formatDate(d.date),
    客户总量: d.metrics.total,
    新增: d.metrics.newAdded,
    活跃: d.metrics.active,
  }))

  const Stat = ({ label, value, prev, suffix = '' }: { label: string; value: number; prev?: number; suffix?: string }) => {
    const change = prev ? Math.round(((value - prev) / prev) * 100) : 0
    return (
      <div className="text-center p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value.toLocaleString()}{suffix}</p>
        {prev !== undefined && (
          <div className="flex items-center justify-center gap-1 mt-1">
            {change >= 0 ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
            <span className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[{ label: '近7天', val: '7' }, { label: '近30天', val: '30' }, { label: '近90天', val: '90' }].map((t) => (
              <button key={t.val} onClick={() => setTimeRange(t.val)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${timeRange === t.val ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <Link to="/dashboard/import"><Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />导入数据</Button></Link>
        </div>
      </div>

      {/* OA Data */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">公众号数据</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-4 bg-gray-50 rounded-lg py-2">
            <Stat label="粉丝数" value={latestOa.followers || 0} prev={prevOa.followers} />
            <Stat label="新增粉丝" value={latestOa.newFollowers || 0} prev={prevOa.newFollowers} />
            <Stat label="阅读量" value={latestOa.reads || 0} prev={prevOa.reads} />
            <Stat label="互动数" value={latestOa.interactions || 0} prev={prevOa.interactions} />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={oaChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="阅读量" stroke="#0052D9" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="互动数" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Data */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">客户数据</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg py-2">
              <Stat label="客户总量" value={latestCust.total || 0} />
              <Stat label="新增" value={latestCust.newAdded || 0} />
              <Stat label="活跃" value={latestCust.active || 0} />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={custChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="新增" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="活跃" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Identity Data */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">身份识别数据</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">已识别</p>
                  <p className="text-2xl font-bold text-primary">{identified.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{identified + unidentified > 0 ? ((identified / (identified + unidentified)) * 100).toFixed(1) : 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">未识别</p>
                  <p className="text-2xl font-bold text-emerald-600">{unidentified.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{identified + unidentified > 0 ? ((unidentified / (identified + unidentified)) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
