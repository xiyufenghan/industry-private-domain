import { View, Text, Switch, Input } from '@tarojs/components'
import { useFormBuilderStore } from '../../store'
import './Panel.scss'

export default function CollectStrategyPanel() {
  const { currentForm, updateCollectStrategy } = useFormBuilderStore()
  if (!currentForm) return null
  const s = currentForm.collectStrategy

  return (
    <View className='panel'>
      <View className='panel-section'>
        <Text className='panel-section__title'>身份追踪</Text>

        <View className='panel-row'>
          <View className='panel-row__info'>
            <Text className='panel-row__title'>需要微信登录</Text>
            <Text className='panel-row__desc'>填写时获取用户 openid / unionid，用于身份识别与去重</Text>
          </View>
          <Switch
            checked={s.requireLogin}
            color='#4F46E5'
            onChange={(e) => updateCollectStrategy({ requireLogin: e.detail.value })}
          />
        </View>

        {s.requireLogin && (
          <View className='panel-tip panel-tip--info'>
            <Text>✅ 将记录：openid、unionid、昵称、来源平台、IP、设备信息</Text>
          </View>
        )}
      </View>

      <View className='panel-section'>
        <Text className='panel-section__title'>提交限制</Text>

        <View className='panel-row'>
          <View className='panel-row__info'>
            <Text className='panel-row__title'>禁止重复提交</Text>
            <Text className='panel-row__desc'>每个用户只能提交一次</Text>
          </View>
          <Switch
            checked={!s.allowRepeatSubmit}
            color='#4F46E5'
            onChange={(e) => updateCollectStrategy({ allowRepeatSubmit: !e.detail.value })}
          />
        </View>

        <View className='panel-row'>
          <View className='panel-row__info'>
            <Text className='panel-row__title'>最大回收数量</Text>
            <Text className='panel-row__desc'>达到上限后自动关闭表单</Text>
          </View>
          <Input
            className='panel-input'
            type='number'
            value={String(s.maxSubmissions || '')}
            placeholder='不限'
            onInput={(e) => updateCollectStrategy({
              maxSubmissions: parseInt(e.detail.value) || undefined,
              autoCloseOnMax: true
            })}
          />
        </View>
      </View>

      <View className='panel-section'>
        <Text className='panel-section__title'>截止时间</Text>
        <View className='panel-row'>
          <Input
            className='panel-input panel-input--wide'
            type='text'
            value={s.deadlineTime || ''}
            placeholder='如：2026-06-30 23:59'
            onInput={(e) => updateCollectStrategy({ deadlineTime: e.detail.value || undefined })}
          />
        </View>
        {s.deadlineTime && (
          <View className='panel-tip panel-tip--warning'>
            <Text>⏰ 截止后自动停止收集，用户将看到「已截止」提示</Text>
          </View>
        )}
      </View>

      <View className='panel-section'>
        <Text className='panel-section__title'>提交提醒</Text>
        <View className='panel-row'>
          <View className='panel-row__info'>
            <Text className='panel-row__title'>开启提醒推送</Text>
            <Text className='panel-row__desc'>有新提交时推送通知（需配置消息模板）</Text>
          </View>
          <Switch
            checked={s.reminderEnabled}
            color='#4F46E5'
            onChange={(e) => updateCollectStrategy({ reminderEnabled: e.detail.value })}
          />
        </View>
        {s.reminderEnabled && (
          <View className='panel-row'>
            <View className='panel-row__info'>
              <Text className='panel-row__title'>提醒间隔</Text>
            </View>
            <Input
              className='panel-input'
              type='number'
              value={String(s.reminderInterval || '')}
              placeholder='分钟'
              onInput={(e) => updateCollectStrategy({ reminderInterval: parseInt(e.detail.value) || undefined })}
            />
          </View>
        )}
      </View>
    </View>
  )
}
