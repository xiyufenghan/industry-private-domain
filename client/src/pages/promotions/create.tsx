import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../lib/api'
import { ContentTypes, PriorityLabel } from '../../lib/constants'

export default function PromotionCreatePage() {
  const navigate = useNavigate()
  const [industries, setIndustries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    contentType: '产品推广',
    priority: 'MEDIUM',
    deadline: '',
    industryIds: [] as string[],
  })

  useEffect(() => {
    api.get('/industries').then((res: any) => setIndustries(res.data))
  }, [])

  const toggleIndustry = (id: string) => {
    setForm((prev) => ({
      ...prev,
      industryIds: prev.industryIds.includes(id)
        ? prev.industryIds.filter((i) => i !== id)
        : [...prev.industryIds, id],
    }))
  }

  const selectAll = () => {
    if (form.industryIds.length === industries.length) {
      setForm({ ...form, industryIds: [] })
    } else {
      setForm({ ...form, industryIds: industries.map((i) => i.id) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return alert('请输入任务标题')
    if (form.industryIds.length === 0) return alert('请至少选择一个行业')
    setLoading(true)
    try {
      await api.post('/promotions', form)
      navigate('/promotions')
    } catch (err: any) {
      alert(err.response?.data?.error || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">下发宣推需求</h1>
          <p className="text-sm text-gray-500 mt-0.5">创建新的推送宣发任务，发布后运营人员可见</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">任务标题 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="例：4月第二周品牌种草推送"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">任务描述</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="详细描述宣推需求、内容要求、注意事项等"
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        {/* 行业多选 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              所属行业（可多选）*
              {form.industryIds.length > 0 && (
                <span className="ml-2 text-xs text-primary font-normal">已选 {form.industryIds.length} 个</span>
              )}
            </label>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-primary hover:text-primary-dark cursor-pointer"
            >
              {form.industryIds.length === industries.length ? '取消全选' : '全选'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {industries.map((ind) => (
              <button
                key={ind.id}
                type="button"
                onClick={() => toggleIndustry(ind.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer ${
                  form.industryIds.includes(ind.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {ind.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">内容类型</label>
            <select
              value={form.contentType}
              onChange={(e) => setForm({ ...form, contentType: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
            >
              {ContentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">优先级</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
            >
              {Object.entries(PriorityLabel).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">截止时间</label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? '发布中...' : '立即发布'}
          </button>
        </div>
      </form>
    </div>
  )
}
