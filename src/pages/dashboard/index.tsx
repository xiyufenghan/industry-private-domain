import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { useSubmissionStore } from '../../store'
import type { Form, Submission } from '../../types'
import { formatTime, formatDuration } from '../../utils/helpers'
import './index.scss'

type TabKey = 'overview' | 'detail' | 'users'

export default function DashboardPage() {
  const router = useRouter()
  const { submissions, loadSubmissions, exportToTencentDoc } = useSubmissionStore()
  const [form, setForm] = useState<Form | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [exporting, setExporting] = useState(false)

  useLoad((params) => {
    if (!params.id) return
    const forms = JSON.parse(Taro.getStorageSync('sf_forms') || '[]') as Form[]
    const found = forms.find((f: Form) => f.id === params.id)
    if (found) {
      setForm(found)
      loadSubmissions(found.id)
    }
  })

  const handleExport = async () => {
    if (!form) return
    setExporting(true)
    const result = await exportToTencentDoc(form.id)
    setExporting(false)
    Taro.showToast({
      title: result.success ? result.message : '导出失败',
      icon: result.success ? 'success' : 'error',
      duration: 3000
    })
  }

  // 计算统计数据
  const totalCount = submissions.length
  const avgDuration = totalCount > 0
    ? Math.floor(submissions.reduce((s, sub) => s + sub.duration, 0) / totalCount)
    : 0

  const platformStats = submissions.reduce<Record<string, number>>((acc, sub) => {
    const p = sub.userIdentity.platform
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {})

  // 按日期统计趋势（最近7天）
  const trendMap = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    trendMap.set(d.toISOString().slice(0, 10), 0)
  }
  submissions.forEach(sub => {
    const day = sub.submittedAt.slice(0, 10)
    if (trendMap.has(day)) trendMap.set(day, (trendMap.get(day) || 0) + 1)
  })
  const trend = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }))
  const maxTrendCount = Math.max(...trend.map(t => t.count), 1)

  // 字段统计
  const fieldStatsMap: Record<string, { label: string; optMap: Record<string, number>; textSamples: string[] }> = {}
  form?.fields.forEach(f => {
    if (f.type === 'divider' || f.type === 'description') return
    fieldStatsMap[f.id] = { label: f.label, optMap: {}, textSamples: [] }
  })
  submissions.forEach(sub => {
    sub.answers.forEach(ans => {
      if (!fieldStatsMap[ans.fieldId]) return
      const val = ans.value
      if (Array.isArray(val)) {
        val.forEach(v => {
          fieldStatsMap[ans.fieldId].optMap[v] = (fieldStatsMap[ans.fieldId].optMap[v] || 0) + 1
        })
      } else if (val) {
        fieldStatsMap[ans.fieldId].textSamples.push(val)
        fieldStatsMap[ans.fieldId].optMap[val] = (fieldStatsMap[ans.fieldId].optMap[val] || 0) + 1
      }
    })
  })

  if (!form) return <View className='dash-loading'><Text>加载中...</Text></View>

  return (
    <View className='dash-page'>
      {/* 顶部 */}
      <View className='dash-header'>
        <View className='dash-header__back' onClick={() => Taro.navigateBack()}>
          <Text className='back-icon'>‹</Text>
        </View>
        <View className='dash-header__title'>
          <Text className='dash-title'>{form.title}</Text>
          <Text className='dash-subtitle'>数据分析</Text>
        </View>
        <View
          className={`export-hdr-btn ${exporting ? 'export-hdr-btn--loading' : ''}`}
          onClick={handleExport}
        >
          <Text>{exporting ? '导出中' : '导出'}</Text>
        </View>
      </View>

      {/* Tab */}
      <View className='dash-tabs'>
        {(['overview', 'detail', 'users'] as TabKey[]).map(tab => (
          <View
            key={tab}
            className={`dash-tab ${activeTab === tab ? 'dash-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <Text>{tab === 'overview' ? '概览' : tab === 'detail' ? '数据详情' : '用户追踪'}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className='dash-content'>
        {/* 概览 Tab */}
        {activeTab === 'overview' && (
          <>
            {/* 核心指标 */}
            <View className='metrics-grid'>
              <View className='metric-card metric-card--primary'>
                <Text className='metric-num'>{totalCount}</Text>
                <Text className='metric-label'>总回收</Text>
              </View>
              <View className='metric-card'>
                <Text className='metric-num'>{formatDuration(avgDuration)}</Text>
                <Text className='metric-label'>平均耗时</Text>
              </View>
              <View className='metric-card'>
                <Text className='metric-num'>{platformStats.weapp || 0}</Text>
                <Text className='metric-label'>小程序</Text>
              </View>
              <View className='metric-card'>
                <Text className='metric-num'>{platformStats.h5 || 0}</Text>
                <Text className='metric-label'>H5</Text>
              </View>
            </View>

            {/* 7天趋势 */}
            <View className='chart-card'>
              <Text className='chart-card__title'>7天提交趋势</Text>
              {totalCount === 0 ? (
                <View className='chart-empty'><Text>暂无数据</Text></View>
              ) : (
                <View className='bar-chart'>
                  {trend.map(({ date, count }) => (
                    <View key={date} className='bar-col'>
                      <Text className='bar-count'>{count > 0 ? count : ''}</Text>
                      <View className='bar-wrap'>
                        <View
                          className='bar-fill'
                          style={{ height: `${(count / maxTrendCount) * 60}px` }}
                        />
                      </View>
                      <Text className='bar-date'>{date.slice(5)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 字段统计 */}
            {Object.entries(fieldStatsMap).map(([fieldId, stat]) => {
              const field = form.fields.find(f => f.id === fieldId)
              if (!field) return null
              const isChoice = ['radio', 'checkbox', 'select'].includes(field.type)
              if (!isChoice) return null
              const total = Object.values(stat.optMap).reduce((s, c) => s + c, 0) || 1
              return (
                <View key={fieldId} className='stat-card'>
                  <Text className='stat-card__title'>{stat.label}</Text>
                  {(field.options || []).map(opt => {
                    const count = stat.optMap[opt.value] || 0
                    const pct = Math.round((count / total) * 100)
                    return (
                      <View key={opt.value} className='stat-row'>
                        <Text className='stat-row__label'>{opt.label}</Text>
                        <View className='stat-bar-wrap'>
                          <View className='stat-bar' style={{ width: `${pct}%` }} />
                        </View>
                        <Text className='stat-row__count'>{count} ({pct}%)</Text>
                      </View>
                    )
                  })}
                </View>
              )
            })}
          </>
        )}

        {/* 数据详情 Tab */}
        {activeTab === 'detail' && (
          <>
            {submissions.length === 0 ? (
              <View className='empty-box'><Text>暂无答卷数据</Text></View>
            ) : (
              submissions.map((sub, idx) => (
                <View key={sub.id} className='submission-card'>
                  <View className='submission-card__header'>
                    <Text className='submission-idx'>#{totalCount - idx}</Text>
                    <Text className='submission-time'>{formatTime(sub.submittedAt)}</Text>
                    <Text className='submission-duration'>{formatDuration(sub.duration)}</Text>
                  </View>
                  {sub.answers.map(ans => (
                    <View key={ans.fieldId} className='ans-row'>
                      <Text className='ans-label'>{ans.fieldLabel}</Text>
                      <Text className='ans-value'>
                        {Array.isArray(ans.value) ? ans.value.join('、') : ans.value || '未填写'}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </>
        )}

        {/* 用户追踪 Tab */}
        {activeTab === 'users' && (
          <>
            <View className='user-tip'>
              <Text className='user-tip__icon'>🔐</Text>
              <Text className='user-tip__text'>以下信息为用户授权后的身份数据，请遵守隐私保护规定</Text>
            </View>
            {submissions.length === 0 ? (
              <View className='empty-box'><Text>暂无用户数据</Text></View>
            ) : (
              submissions.map((sub, idx) => (
                <View key={sub.id} className='user-card'>
                  <View className='user-card__header'>
                    <Text className='user-card__idx'>#{totalCount - idx}</Text>
                    <Text className='user-card__time'>{formatTime(sub.submittedAt)}</Text>
                    <View className={`platform-badge platform-badge--${sub.userIdentity.platform}`}>
                      <Text>{sub.userIdentity.platform === 'weapp' ? '小程序' : 'H5'}</Text>
                    </View>
                  </View>
                  <View className='user-info-grid'>
                    <View className='user-info-item'>
                      <Text className='user-info-item__key'>OpenID</Text>
                      <Text className='user-info-item__val' selectable>
                        {sub.userIdentity.openid || '未获取（需微信登录）'}
                      </Text>
                    </View>
                    <View className='user-info-item'>
                      <Text className='user-info-item__key'>UnionID</Text>
                      <Text className='user-info-item__val' selectable>
                        {sub.userIdentity.unionid || '未获取'}
                      </Text>
                    </View>
                    <View className='user-info-item'>
                      <Text className='user-info-item__key'>昵称</Text>
                      <Text className='user-info-item__val'>
                        {sub.userIdentity.nickName || '未授权'}
                      </Text>
                    </View>
                    <View className='user-info-item'>
                      <Text className='user-info-item__key'>填写耗时</Text>
                      <Text className='user-info-item__val'>{formatDuration(sub.duration)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}
