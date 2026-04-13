import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Download, Search, BarChart3 } from 'lucide-react'
import api from '../../lib/api'
import { TouchpointLabel, TouchpointColor } from '../../lib/constants'

export default function PromotionReportPage() {
  const { selectedIndustry } = useOutletContext<any>()
  const [accounts, setAccounts] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    accountId: '',
    touchpoint: 'all',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    api.get('/accounts', { params: { limit: 500 } }).then((res: any) => setAccounts(res.data.accounts))
  }, [])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/promotions/report/summary', {
        params: { industryId: selectedIndustry, ...filters },
      })
      setReportData(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport() }, [selectedIndustry])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (selectedIndustry && selectedIndustry !== 'all') params.set('industryId', selectedIndustry)
    if (filters.accountId) params.set('accountId', filters.accountId)
    if (filters.touchpoint !== 'all') params.set('touchpoint', filters.touchpoint)
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)

    const token = localStorage.getItem('token')
    const url = `/api/promotions/report/export?${params.toString()}`
    
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `宣发数据报表_${new Date().toISOString().split('T')[0]}.xlsx`
        a.click()
        URL.revokeObjectURL(a.href)
      })
  }

  // 聚合统计
  const aggregateMetrics = (touchpoint: string) => {
    if (!reportData?.touchpointData) return null
    const items = reportData.touchpointData.filter((d: any) => d.touchpoint === touchpoint)
    if (items.length === 0) return null

    const totals: any = {}
    items.forEach((item: any) => {
      const m = JSON.parse(item.metrics)
      Object.entries(m).forEach(([k, v]) => {
        totals[k] = (totals[k] || 0) + (Number(v) || 0)
      })
    })
    return { count: items.length, totals }
  }

  const metricLabels: Record<string, Record<string, string>> = {
    '1V1': { sendCount: '发送人数', replyCount: '回复人数', addFriendCount: '新增好友', deleteCount: '删除/拉黑' },
    'MOMENTS': { publishCount: '发布条数', viewCount: '浏览量', likeCount: '点赞数', commentCount: '评论数', clickCount: '链接点击' },
    'GROUP': { groupCount: '群发群数', sendCount: '群发人数', readCount: '阅读人数', interactCount: '互动人数', newMemberCount: '新入群', exitCount: '退群' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">宣发报表</h1>
          <p className="text-sm text-gray-500 mt-1">查看宣推数据汇总，支持按账号/触点/日期筛选与导出</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer"
        >
          <Download className="w-4 h-4" />
          一键导出 Excel
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">宣推账号</label>
            <select
              value={filters.accountId}
              onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">全部账号</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.wechatId} - {acc.realName || '未知'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">触点类型</label>
            <select
              value={filters.touchpoint}
              onChange={(e) => setFilters({ ...filters, touchpoint: e.target.value })}
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">全部触点</option>
              <option value="1V1">1V1 私聊</option>
              <option value="MOMENTS">朋友圈</option>
              <option value="GROUP">社群</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">开始日期</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">结束日期</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm cursor-pointer w-full justify-center"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>
        </div>
      </div>

      {/* 汇总卡片 */}
      {reportData && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">宣推任务总数</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{reportData.taskCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">承接记录总数</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{reportData.executionCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">触点数据条数</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{reportData.touchpointData?.length || 0}</p>
          </div>
        </div>
      )}

      {/* 各触点汇总 */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['1V1', 'MOMENTS', 'GROUP'].map((tp) => {
            const agg = aggregateMetrics(tp)
            if (!agg && filters.touchpoint !== 'all' && filters.touchpoint !== tp) return null
            return (
              <div key={tp} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${TouchpointColor[tp]}`}>
                    {TouchpointLabel[tp]}
                  </span>
                  <span className="text-xs text-gray-400">{agg ? `${agg.count} 条记录` : '无数据'}</span>
                </div>
                {agg ? (
                  <div className="space-y-2">
                    {Object.entries(agg.totals).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{metricLabels[tp]?.[k] || k}</span>
                        <span className="font-semibold text-gray-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">暂无数据</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 明细表格 */}
      {reportData && reportData.touchpointData?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700">数据明细</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">任务</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">账号</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">运营</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">触点</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">执行日期</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">数据摘要</th>
                </tr>
              </thead>
              <tbody>
                {reportData.touchpointData.slice(0, 50).map((td: any) => {
                  const m = JSON.parse(td.metrics)
                  return (
                    <tr key={td.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 text-sm text-gray-700">{td.execution?.task?.title}</td>
                      <td className="py-2.5 px-4 text-sm text-gray-600">{td.account?.wechatId} ({td.account?.realName})</td>
                      <td className="py-2.5 px-4 text-sm text-gray-600">{td.execution?.operator?.name}</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TouchpointColor[td.touchpoint]}`}>
                          {TouchpointLabel[td.touchpoint]}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-sm text-gray-500">{td.executeDate?.split('T')[0]}</td>
                      <td className="py-2.5 px-4 text-xs text-gray-500">
                        {Object.entries(m).map(([k, v]) => `${metricLabels[td.touchpoint]?.[k] || k}:${v}`).join(' | ')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
