import { useState, useEffect } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowLeft, UserCheck, MessageSquare, Send } from 'lucide-react'
import api from '../../lib/api'
import { formatDateTime } from '../../lib/utils'
import {
  Role, PromotionStatusLabel, PromotionStatusColor, PromotionStatus,
  PriorityLabel, PriorityColor, TouchpointLabel, TouchpointColor,
  ExecutionStatusLabel,
} from '../../lib/constants'

const TOUCHPOINT_OPTIONS = [
  { value: '1V1', label: '1V1 私聊' },
  { value: 'MOMENTS', label: '朋友圈' },
  { value: 'GROUP', label: '社群' },
]

export default function PromotionDetailPage() {
  const { id } = useParams()
  const { user } = useOutletContext<any>()
  const navigate = useNavigate()
  const [task, setTask] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 承接表单
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [acceptForm, setAcceptForm] = useState({
    accountId: '',
    hasContactedManager: false,
    contactNote: '',
    touchpoints: [] as string[],
  })

  // 触点数据登记
  const [showDataForm, setShowDataForm] = useState<{ executionId: string; touchpoint: string; accountId: string } | null>(null)
  const [dataForm, setDataForm] = useState<any>({})
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchTask = async () => {
    setLoading(true)
    try {
      const res: any = await api.get(`/promotions/${id}`)
      setTask(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTask()
    api.get('/accounts', { params: { limit: 200 } }).then((res: any) => setAccounts(res.data.accounts))
  }, [id])

  const handleAccept = async () => {
    if (!acceptForm.accountId) return alert('请选择执行账号')
    if (acceptForm.touchpoints.length === 0) return alert('请至少选择一个触点')
    setSubmitLoading(true)
    try {
      await api.post(`/promotions/${id}/executions`, acceptForm)
      setShowAcceptForm(false)
      setAcceptForm({ accountId: '', hasContactedManager: false, contactNote: '', touchpoints: [] })
      fetchTask()
    } catch (err: any) {
      alert(err.response?.data?.error || '承接失败')
    } finally {
      setSubmitLoading(false)
    }
  }

  const toggleTouchpoint = (tp: string) => {
    setAcceptForm((prev) => ({
      ...prev,
      touchpoints: prev.touchpoints.includes(tp)
        ? prev.touchpoints.filter((t) => t !== tp)
        : [...prev.touchpoints, tp],
    }))
  }

  const handleSubmitData = async () => {
    if (!showDataForm) return
    setSubmitLoading(true)
    try {
      await api.post('/promotions/touchpoint-data', {
        executionId: showDataForm.executionId,
        touchpoint: showDataForm.touchpoint,
        metrics: dataForm,
        executeDate: new Date().toISOString(),
      })
      setShowDataForm(null)
      setDataForm({})
      fetchTask()
    } catch (err: any) {
      alert(err.response?.data?.error || '提交失败')
    } finally {
      setSubmitLoading(false)
    }
  }

  const renderMetricsForm = (touchpoint: string) => {
    if (touchpoint === '1V1') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'sendCount', label: '发送人数' },
            { key: 'replyCount', label: '回复人数' },
            { key: 'addFriendCount', label: '新增好友数' },
            { key: 'deleteCount', label: '删除/拉黑数' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type="number"
                min="0"
                value={dataForm[key] || ''}
                onChange={(e) => setDataForm({ ...dataForm, [key]: Number(e.target.value) })}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ))}
        </div>
      )
    }
    if (touchpoint === 'MOMENTS') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'publishCount', label: '发布条数' },
            { key: 'viewCount', label: '浏览量' },
            { key: 'likeCount', label: '点赞数' },
            { key: 'commentCount', label: '评论数' },
            { key: 'clickCount', label: '链接点击数' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type="number"
                min="0"
                value={dataForm[key] || ''}
                onChange={(e) => setDataForm({ ...dataForm, [key]: Number(e.target.value) })}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ))}
        </div>
      )
    }
    // GROUP
    return (
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'groupCount', label: '群发群数' },
          { key: 'sendCount', label: '群发人数' },
          { key: 'readCount', label: '阅读人数' },
          { key: 'interactCount', label: '互动人数' },
          { key: 'newMemberCount', label: '新入群人数' },
          { key: 'exitCount', label: '退群人数' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input
              type="number"
              min="0"
              value={dataForm[key] || ''}
              onChange={(e) => setDataForm({ ...dataForm, [key]: Number(e.target.value) })}
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!task) return <div className="text-center py-16 text-gray-400">任务不存在</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/promotions')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${PromotionStatusColor[task.status as PromotionStatus] || ''}`}>
              {PromotionStatusLabel[task.status as PromotionStatus]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1 flex-wrap">
            <span>{task.taskNo}</span> · 
            {(task.industryNames || []).map((name: string, i: number) => (
              <span key={i} className="inline-flex px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{name}</span>
            ))}
            · <span>{task.contentType}</span> · 
            <span className={`inline-flex px-1.5 py-0.5 rounded text-xs ${PriorityColor[task.priority as keyof typeof PriorityColor]}`}>
              {PriorityLabel[task.priority as keyof typeof PriorityLabel]}
            </span>
          </p>
        </div>
        {user.role === Role.OPERATOR && task.status === 'PUBLISHED' && (
          <button
            onClick={() => setShowAcceptForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            承接任务
          </button>
        )}
      </div>

      {/* 任务描述 */}
      {task.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">任务描述</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
          {task.deadline && (
            <p className="text-xs text-gray-400 mt-3">截止时间：{formatDateTime(task.deadline)}</p>
          )}
        </div>
      )}

      {/* 承接表单弹层 */}
      {showAcceptForm && (
        <div className="bg-white rounded-xl border-2 border-primary/20 p-6 space-y-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            承接宣推任务
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">选择执行账号 *</label>
            <select
              value={acceptForm.accountId}
              onChange={(e) => setAcceptForm({ ...acceptForm, accountId: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">请选择账号</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.wechatId} - {acc.realName || '未知'} ({acc.industry?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">是否已与市场经理沟通？ *</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contacted"
                  checked={acceptForm.hasContactedManager}
                  onChange={() => setAcceptForm({ ...acceptForm, hasContactedManager: true })}
                  className="w-4 h-4 text-primary cursor-pointer"
                />
                <span className="text-sm text-gray-700">是</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contacted"
                  checked={!acceptForm.hasContactedManager}
                  onChange={() => setAcceptForm({ ...acceptForm, hasContactedManager: false })}
                  className="w-4 h-4 text-primary cursor-pointer"
                />
                <span className="text-sm text-gray-700">否</span>
              </label>
            </div>
          </div>

          {acceptForm.hasContactedManager && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">沟通备注</label>
              <input
                type="text"
                value={acceptForm.contactNote}
                onChange={(e) => setAcceptForm({ ...acceptForm, contactNote: e.target.value })}
                placeholder="记录沟通要点..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择宣推触点（可多选）*</label>
            <div className="flex items-center gap-3">
              {TOUCHPOINT_OPTIONS.map((tp) => (
                <button
                  key={tp.value}
                  type="button"
                  onClick={() => toggleTouchpoint(tp.value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer ${
                    acceptForm.touchpoints.includes(tp.value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {tp.value === '1V1' ? '📱' : tp.value === 'MOMENTS' ? '📸' : '👥'} {tp.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowAcceptForm(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleAccept}
              disabled={submitLoading}
              className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
            >
              {submitLoading ? '提交中...' : '确认承接'}
            </button>
          </div>
        </div>
      )}

      {/* 承接记录列表 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">承接记录 ({task.executions?.length || 0})</h2>
        {(!task.executions || task.executions.length === 0) ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            暂无承接记录
          </div>
        ) : (
          <div className="space-y-4">
            {task.executions.map((exec: any) => {
              const touchpoints: string[] = JSON.parse(exec.touchpoints || '[]')
              return (
                <div key={exec.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{exec.operator?.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{exec.operator?.name}</p>
                        <p className="text-xs text-gray-400">
                          账号：{exec.account?.wechatId} ({exec.account?.realName}) · {formatDateTime(exec.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${exec.hasContactedManager ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        <MessageSquare className="w-3 h-3" />
                        {exec.hasContactedManager ? '已沟通' : '未沟通'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ExecutionStatusLabel[exec.status as keyof typeof ExecutionStatusLabel] || exec.status}
                      </span>
                    </div>
                  </div>

                  {exec.contactNote && (
                    <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">沟通备注：{exec.contactNote}</p>
                  )}

                  {/* 触点标签 & 数据 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {touchpoints.map((tp) => (
                        <span key={tp} className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${TouchpointColor[tp] || 'bg-gray-100'}`}>
                          {TouchpointLabel[tp] || tp}
                        </span>
                      ))}
                    </div>

                    {/* 已登记的触点数据 */}
                    {exec.touchpointData && exec.touchpointData.length > 0 && (
                      <div className="space-y-2">
                        {exec.touchpointData.map((td: any) => {
                          const m = JSON.parse(td.metrics)
                          return (
                            <div key={td.id} className="bg-gray-50 rounded-lg px-4 py-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${TouchpointColor[td.touchpoint] || ''}`}>
                                  {TouchpointLabel[td.touchpoint]}
                                </span>
                                <span className="text-xs text-gray-400">{td.executeDate?.split('T')[0]}</span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                                {Object.entries(m).map(([k, v]) => (
                                  <span key={k}>{k}: <strong className="text-gray-900">{String(v)}</strong></span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* 登记数据按钮 */}
                    {user.role === Role.OPERATOR && (
                      <div className="flex items-center gap-2">
                        {touchpoints.map((tp) => (
                          <button
                            key={tp}
                            onClick={() => {
                              setShowDataForm({ executionId: exec.id, touchpoint: tp, accountId: exec.accountId })
                              setDataForm({})
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            登记{TouchpointLabel[tp]}数据
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 触点数据登记表单弹层 */}
      {showDataForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              登记{TouchpointLabel[showDataForm.touchpoint]}数据
            </h3>
            {renderMetricsForm(showDataForm.touchpoint)}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => { setShowDataForm(null); setDataForm({}) }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSubmitData}
                disabled={submitLoading}
                className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
              >
                {submitLoading ? '提交中...' : '提交数据'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
