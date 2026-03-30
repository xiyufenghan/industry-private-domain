import { useState, useEffect } from 'react'
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import api from '../../lib/api'
import { ImportCategoryLabel } from '../../lib/constants'
import { formatDateTime } from '../../lib/utils'

const templates = [
  { name: '公众号数据导入模板', category: 'OA', desc: '粉丝数、新增粉丝、阅读量、互动数', icon: '📊' },
  { name: '客户数据导入模板', category: 'CUSTOMER', desc: '客户总量、新增客户、活跃客户', icon: '👥' },
  { name: '身份识别数据导入模板', category: 'IDENTITY', desc: '已识别数、未识别数', icon: '🔍' },
  { name: '活动数据导入模板', category: 'ACTIVITY', desc: '活动名称、参与人数、转化数、转化率', icon: '🎯' },
]

export default function ImportPage() {
  const [industries, setIndustries] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [category, setCategory] = useState('OA')
  const [industryId, setIndustryId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    api.get('/industries').then((res: any) => setIndustries(res.data))
    api.get('/import/logs').then((res: any) => setLogs(res.data.logs))
  }, [])

  const handleUpload = async () => {
    if (!file || !industryId) return
    setUploading(true)
    setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    formData.append('industryId', industryId)

    const res: any = await api.post('/import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).catch((err: any) => {
      setResult({ error: err.response?.data?.error || '导入失败' })
      return null
    })
    if (res) setResult(res.data)
    setUploading(false)
    setFile(null)
    api.get('/import/logs').then((r: any) => setLogs(r.data.logs))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">数据导入</h1>

      {/* Template downloads */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">下载导入模板</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((t) => (
            <Card key={t.category} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-5 text-center">
                <span className="text-3xl">{t.icon}</span>
                <p className="font-medium text-sm text-gray-800 mt-2">{t.name}</p>
                <p className="text-xs text-gray-400 mt-1">{t.desc}</p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <Download className="w-3.5 h-3.5 mr-1.5" />下载模板
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload area */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">上传数据文件</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数据类别</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                {Object.entries(ImportCategoryLabel).filter(([k]) => k !== 'ACCOUNT').map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属行业</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={industryId} onChange={(e) => setIndustryId(e.target.value)}>
                <option value="">请选择行业</option>
                {industries.map((ind) => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
              </select>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">
              {file ? file.name : '拖拽文件到此处，或点击选择文件'}
            </p>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" id="file-upload" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                选择文件
              </Button>
            </label>
          </div>

          <Button onClick={handleUpload} disabled={uploading || !file || !industryId} className="w-full">
            <Upload className="w-4 h-4 mr-2" />{uploading ? '导入中...' : '开始导入'}
          </Button>

          {result && (
            <div className={`rounded-lg p-4 ${result.error ? 'bg-red-50' : result.failRows > 0 ? 'bg-yellow-50' : 'bg-green-50'} animate-fade-in`}>
              {result.error ? (
                <div className="flex items-center gap-2 text-red-600"><XCircle className="w-5 h-5" /><span>{result.error}</span></div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {result.failRows === 0 ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />}
                    <span className="font-medium">导入完成：成功 {result.successRows} 条，失败 {result.failRows} 条</span>
                  </div>
                  {result.errors?.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {result.errors.map((err: any, i: number) => (
                        <p key={i} className="text-xs text-red-600">第 {err.row} 行 - {err.field}: {err.message}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import history */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">导入历史</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 font-medium text-gray-500">时间</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">操作人</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">文件</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">类别</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">行业</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">条数</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">状态</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 text-gray-600">{formatDateTime(log.createdAt)}</td>
                  <td className="py-2.5 px-3 text-gray-600">{log.user?.name}</td>
                  <td className="py-2.5 px-3 text-gray-700 max-w-[200px] truncate">{log.fileName}</td>
                  <td className="py-2.5 px-3">{ImportCategoryLabel[log.category as keyof typeof ImportCategoryLabel]}</td>
                  <td className="py-2.5 px-3">{log.industry?.name}</td>
                  <td className="py-2.5 px-3">{log.successRows}/{log.totalRows}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={log.status === 'SUCCESS' ? 'default' : log.status === 'PARTIAL' ? 'secondary' : 'destructive'}>
                      {log.status === 'SUCCESS' ? '成功' : log.status === 'PARTIAL' ? '部分成功' : '失败'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-center text-gray-400 py-8">暂无导入记录</p>}
        </CardContent>
      </Card>
    </div>
  )
}
