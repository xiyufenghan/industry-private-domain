import { View, Text, Switch, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useFormBuilderStore } from '../../store'
import { tencentDocApi } from '../../services/api'
import './Panel.scss'

export default function TencentDocPanel() {
  const { currentForm, updateTencentDocConfig, saveForm } = useFormBuilderStore()
  const [exporting, setExporting] = useState(false)

  if (!currentForm) return null
  const cfg = currentForm.tencentDocConfig

  const handleExportNow = async () => {
    if (!cfg.docId) {
      Taro.showToast({ title: '请先填写文档ID', icon: 'none' })
      return
    }
    setExporting(true)
    try {
      const result = await tencentDocApi.export({
        formId: currentForm.id,
        docId: cfg.docId,
        sheetName: cfg.sheetName,
        includeUserInfo: cfg.includeUserInfo
      })
      Taro.showToast({ title: `导出成功！共 ${result.exportedCount} 条`, icon: 'success' })
    } catch {
      Taro.showToast({ title: '导出失败，请检查配置', icon: 'error' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <View className='panel'>
      {/* 总开关 */}
      <View className='panel-section'>
        <View className='panel-row'>
          <View className='panel-row__info'>
            <Text className='panel-row__title'>启用腾讯文档输出</Text>
            <Text className='panel-row__desc'>将表单数据自动汇总到腾讯文档表格</Text>
          </View>
          <Switch
            checked={cfg.enabled}
            color='#4F46E5'
            onChange={(e) => updateTencentDocConfig({ enabled: e.detail.value })}
          />
        </View>
      </View>

      {cfg.enabled && (
        <>
          {/* 文档配置 */}
          <View className='panel-section'>
            <Text className='panel-section__title'>文档配置</Text>

            <View className='panel-form-row'>
              <Text className='panel-form-label'>文档 ID</Text>
              <Input
                className='panel-input panel-input--wide'
                value={cfg.docId || ''}
                placeholder='粘贴腾讯文档链接或文档ID'
                onInput={(e) => updateTencentDocConfig({ docId: e.detail.value })}
              />
            </View>

            <View className='panel-form-row'>
              <Text className='panel-form-label'>工作表名</Text>
              <Input
                className='panel-input panel-input--wide'
                value={cfg.sheetName || ''}
                placeholder='默认：Sheet1'
                onInput={(e) => updateTencentDocConfig({ sheetName: e.detail.value || undefined })}
              />
            </View>

            <View className='panel-tip panel-tip--info'>
              <Text>📌 获取文档ID：打开腾讯文档 → 分享链接中 /d/ 后的字符串即为文档ID</Text>
            </View>
          </View>

          {/* 同步模式 */}
          <View className='panel-section'>
            <Text className='panel-section__title'>同步方式</Text>
            <View className='sync-mode-grid'>
              {([
                { value: 'realtime', icon: '⚡', title: '实时同步', desc: '每次提交立即写入' },
                { value: 'scheduled', icon: '⏱', title: '定时同步', desc: '按设定间隔批量' },
                { value: 'manual', icon: '👆', title: '手动导出', desc: '点击按钮触发' }
              ] as const).map(mode => (
                <View
                  key={mode.value}
                  className={`sync-mode-item ${cfg.syncMode === mode.value ? 'sync-mode-item--active' : ''}`}
                  onClick={() => updateTencentDocConfig({ syncMode: mode.value })}
                >
                  <Text className='sync-mode-item__icon'>{mode.icon}</Text>
                  <Text className='sync-mode-item__title'>{mode.title}</Text>
                  <Text className='sync-mode-item__desc'>{mode.desc}</Text>
                </View>
              ))}
            </View>

            {cfg.syncMode === 'scheduled' && (
              <View className='panel-form-row' style={{ marginTop: '12px' }}>
                <Text className='panel-form-label'>间隔（分钟）</Text>
                <Input
                  className='panel-input'
                  type='number'
                  value={String(cfg.scheduleInterval || '')}
                  placeholder='如 30'
                  onInput={(e) => updateTencentDocConfig({ scheduleInterval: parseInt(e.detail.value) || undefined })}
                />
              </View>
            )}
          </View>

          {/* 数据配置 */}
          <View className='panel-section'>
            <Text className='panel-section__title'>导出内容</Text>
            <View className='panel-row'>
              <View className='panel-row__info'>
                <Text className='panel-row__title'>包含用户身份信息</Text>
                <Text className='panel-row__desc'>openid、unionid、昵称等列将导出到文档</Text>
              </View>
              <Switch
                checked={cfg.includeUserInfo}
                color='#4F46E5'
                onChange={(e) => updateTencentDocConfig({ includeUserInfo: e.detail.value })}
              />
            </View>
          </View>

          {/* 立即导出 */}
          {cfg.syncMode === 'manual' && (
            <View className='panel-section'>
              <View
                className={`export-btn ${exporting ? 'export-btn--loading' : ''}`}
                onClick={handleExportNow}
              >
                <Text>{exporting ? '导出中...' : '立即导出到腾讯文档'}</Text>
              </View>
              {cfg.lastSyncTime && (
                <Text className='last-sync-time'>上次导出：{cfg.lastSyncTime}</Text>
              )}
            </View>
          )}
        </>
      )}
    </View>
  )
}
