import { useState, useEffect } from 'react'
import { Sparkles, Copy, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import api from '../../lib/api'

export default function CopywriterPage() {
  const [industries, setIndustries] = useState<any[]>([])
  const [industry, setIndustry] = useState('')
  const [keywords, setKeywords] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => { api.get('/industries').then((res: any) => setIndustries(res.data)) }, [])

  const generate = async () => {
    if (!industry) return
    setLoading(true)
    const res: any = await api.post('/copywriter/generate', { industry, keywords })
    setResults(res.data)
    setLoading(false)
  }

  const copyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">推广文案生成</h1>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">生成配置</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择行业 *</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">请选择行业</option>
                {industries.map((ind) => <option key={ind.id} value={ind.name}>{ind.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">关键词</label>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="输入产品名、活动名等关键词" />
            </div>
          </div>
          <Button onClick={generate} disabled={loading || !industry} className="w-full">
            {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />生成中...</> : <><Sparkles className="w-4 h-4 mr-2" />生成文案</>}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">生成结果</h2>
          {results.map((r) => (
            <Card key={r.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-3 inline-block">方案 {r.id}</span>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mt-2">{r.content}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyText(r.content, r.id)} className="shrink-0">
                    <Copy className="w-4 h-4 mr-1" />{copiedId === r.id ? '已复制' : '复制'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
