import { View, Text, Input, Textarea, Switch } from '@tarojs/components'
import { useState } from 'react'
import { useFormBuilderStore } from '../../store'
import type { FormField, FieldOption } from '../../types'
import { generateId } from '../../utils/helpers'
import OcrConfig from '../ocr/OcrConfig'
import './FieldEditor.scss'

interface Props {
  field: FormField
}

export default function FieldEditor({ field }: Props) {
  const { updateField } = useFormBuilderStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const update = (updates: Partial<FormField>) => updateField(field.id, updates)

  const addOption = () => {
    const opts = [...(field.options || [])]
    opts.push({ label: `选项${opts.length + 1}`, value: `opt${opts.length + 1}` })
    update({ options: opts })
  }

  const updateOption = (index: number, label: string) => {
    const opts = [...(field.options || [])]
    opts[index] = { ...opts[index], label, value: opts[index].value }
    update({ options: opts })
  }

  const removeOption = (index: number) => {
    const opts = field.options?.filter((_, i) => i !== index) || []
    update({ options: opts })
  }

  return (
    <View className='field-editor'>
      {/* 字段标题编辑 */}
      <View className='fe-row'>
        <Text className='fe-label'>标题</Text>
        <Input
          className='fe-input'
          value={field.label}
          placeholder='输入字段标题'
          onInput={(e) => update({ label: e.detail.value })}
        />
      </View>

      {/* 占位提示 */}
      {['text', 'textarea'].includes(field.type) && (
        <View className='fe-row'>
          <Text className='fe-label'>提示</Text>
          <Input
            className='fe-input'
            value={field.placeholder || ''}
            placeholder='占位提示文字（可选）'
            onInput={(e) => update({ placeholder: e.detail.value })}
          />
        </View>
      )}

      {/* 选项编辑（radio/checkbox/select）*/}
      {['radio', 'checkbox', 'select'].includes(field.type) && (
        <View className='fe-options'>
          <Text className='fe-label'>选项</Text>
          {(field.options || []).map((opt, index) => (
            <View key={index} className='option-row'>
              <View className='option-dot' />
              <Input
                className='option-input'
                value={opt.label}
                placeholder={`选项 ${index + 1}`}
                onInput={(e) => updateOption(index, e.detail.value)}
              />
              {(field.options?.length || 0) > 1 && (
                <Text className='option-remove' onClick={() => removeOption(index)}>✕</Text>
              )}
            </View>
          ))}
          <View className='add-option-btn' onClick={addOption}>
            <Text className='add-option-btn__text'>+ 添加选项</Text>
          </View>
        </View>
      )}

      {/* 说明文字内容 */}
      {field.type === 'description' && (
        <View className='fe-row'>
          <Textarea
            className='fe-textarea'
            value={field.description || ''}
            placeholder='输入说明文字内容...'
            onInput={(e) => update({ description: e.detail.value })}
            autoHeight
          />
        </View>
      )}

      {/* OCR 配置（图片字段）*/}
      {field.type === 'image' && (
        <OcrConfig field={field} onUpdate={update} />
      )}

      {/* 基础设置行 */}
      <View className='fe-switches'>
        <View className='fe-switch-row'>
          <Text className='fe-switch-label'>必填</Text>
          <Switch
            checked={field.required}
            color='#4F46E5'
            onChange={(e) => update({ required: e.detail.value })}
          />
        </View>
      </View>

      {/* 高级设置 */}
      <View className='fe-advanced-toggle' onClick={() => setShowAdvanced(!showAdvanced)}>
        <Text className='fe-advanced-toggle__text'>{showAdvanced ? '收起' : '高级设置'}</Text>
        <Text className='fe-advanced-toggle__arrow'>{showAdvanced ? '∧' : '∨'}</Text>
      </View>

      {showAdvanced && (
        <View className='fe-advanced'>
          <View className='fe-row'>
            <Text className='fe-label'>字段说明</Text>
            <Input
              className='fe-input'
              value={field.description || ''}
              placeholder='字段辅助说明（可选）'
              onInput={(e) => update({ description: e.detail.value })}
            />
          </View>
          {['text', 'textarea'].includes(field.type) && (
            <>
              <View className='fe-row'>
                <Text className='fe-label'>最小长度</Text>
                <Input
                  className='fe-input fe-input--sm'
                  type='number'
                  value={String(field.validation?.minLength || '')}
                  placeholder='不限'
                  onInput={(e) => update({ validation: { ...field.validation, minLength: parseInt(e.detail.value) || undefined } })}
                />
              </View>
              <View className='fe-row'>
                <Text className='fe-label'>最大长度</Text>
                <Input
                  className='fe-input fe-input--sm'
                  type='number'
                  value={String(field.validation?.maxLength || '')}
                  placeholder='不限'
                  onInput={(e) => update({ validation: { ...field.validation, maxLength: parseInt(e.detail.value) || undefined } })}
                />
              </View>
            </>
          )}
        </View>
      )}
    </View>
  )
}
