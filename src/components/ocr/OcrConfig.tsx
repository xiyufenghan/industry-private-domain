import { View, Text, Switch, Input } from '@tarojs/components'
import type { FormField, OcrConfig as OcrConfigType } from '../../types'
import './OcrConfig.scss'

interface Props {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

const OCR_TYPES = [
  { value: 'general', label: '通用识别', desc: '识别图片中所有文字' },
  { value: 'id_card', label: '身份证', desc: '识别姓名、身份证号' },
  { value: 'business_license', label: '营业执照', desc: '识别企业名称、统一社会信用代码' },
  { value: 'invoice', label: '发票', desc: '识别发票金额、日期、发票号码' }
] as const

export default function OcrConfig({ field, onUpdate }: Props) {
  const ocr = field.ocr || {
    enabled: false,
    mode: 'auto',
    targetFields: [],
    ocrType: 'general'
  }

  const update = (updates: Partial<OcrConfigType>) => {
    onUpdate({ ocr: { ...ocr, ...updates } })
  }

  return (
    <View className='ocr-config'>
      {/* 总开关 */}
      <View className='ocr-row ocr-row--main'>
        <View className='ocr-row__info'>
          <Text className='ocr-row__title'>🔍 启用 OCR 识别</Text>
          <Text className='ocr-row__desc'>用户上传图片后自动识别文字内容</Text>
        </View>
        <Switch
          checked={ocr.enabled}
          color='#4F46E5'
          onChange={(e) => update({ enabled: e.detail.value })}
        />
      </View>

      {ocr.enabled && (
        <>
          {/* OCR 类型选择 */}
          <View className='ocr-section'>
            <Text className='ocr-section__title'>识别类型</Text>
            <View className='ocr-type-grid'>
              {OCR_TYPES.map(t => (
                <View
                  key={t.value}
                  className={`ocr-type-item ${ocr.ocrType === t.value ? 'ocr-type-item--active' : ''}`}
                  onClick={() => update({ ocrType: t.value })}
                >
                  <Text className='ocr-type-item__label'>{t.label}</Text>
                  <Text className='ocr-type-item__desc'>{t.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 触发方式 */}
          <View className='ocr-section'>
            <Text className='ocr-section__title'>触发方式</Text>
            <View className='ocr-mode-row'>
              {(['auto', 'manual'] as const).map(mode => (
                <View
                  key={mode}
                  className={`ocr-mode-btn ${ocr.mode === mode ? 'ocr-mode-btn--active' : ''}`}
                  onClick={() => update({ mode })}
                >
                  <Text>{mode === 'auto' ? '自动识别' : '手动触发'}</Text>
                </View>
              ))}
            </View>
            <Text className='ocr-hint'>
              {ocr.mode === 'auto' ? '图片上传完成后立即识别' : '用户点击「识别」按钮后触发'}
            </Text>
          </View>

          {/* 结果填入字段 */}
          <View className='ocr-section'>
            <Text className='ocr-section__title'>识别结果填入</Text>
            <Input
              className='ocr-field-input'
              value={(ocr.targetFields || []).join(',')}
              placeholder='输入目标字段ID（多个用逗号分隔）'
              onInput={(e) => update({ targetFields: e.detail.value.split(',').map(s => s.trim()).filter(Boolean) })}
            />
            <Text className='ocr-hint'>留空则在本字段内显示识别结果</Text>
          </View>
        </>
      )}
    </View>
  )
}
