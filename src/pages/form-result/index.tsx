import { View, Text, Image } from '@tarojs/components'
import Taro, { useRouter, useLoad } from '@tarojs/taro'
import './index.scss'

export default function FormResultPage() {
  const router = useRouter()

  useLoad(() => {
    // 触发微信小程序分享
    Taro.showShareMenu?.({ withShareTicket: true })
  })

  return (
    <View className='result-page'>
      <View className='result-card'>
        <View className='result-icon'>
          <Text className='result-check'>✓</Text>
        </View>
        <Text className='result-title'>提交成功！</Text>
        <Text className='result-desc'>感谢您的填写，您的答卷已收到</Text>

        <View className='result-divider' />

        <View className='result-actions'>
          <View className='result-btn result-btn--primary' onClick={() => Taro.navigateBack()}>
            <Text>返回首页</Text>
          </View>
          <View
            className='result-btn result-btn--ghost'
            onClick={() => {
              const formId = router.params.formId
              if (formId) Taro.navigateTo({ url: `/pages/form-fill/index?id=${formId}` })
            }}
          >
            <Text>再填一份</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
