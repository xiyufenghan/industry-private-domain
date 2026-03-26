import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { useFormBuilderStore } from '../../store'
import type { FormField, FieldType } from '../../types'
import FieldEditor from '../../components/field-types/FieldEditor'
import CollectStrategyPanel from '../../components/field-types/CollectStrategyPanel'
import TencentDocPanel from '../../components/field-types/TencentDocPanel'
import './index.scss'

type TabKey = 'fields' | 'settings' | 'doc'

const FIELD_GROUPS = [
  {
    title: '基础题型',
    items: [
      { type: 'text' as FieldType, icon: '📝', label: '单行文本' },
      { type: 'textarea' as FieldType, icon: '📄', label: '多行文本' },
      { type: 'radio' as FieldType, icon: '🔘', label: '单选题' },
      { type: 'checkbox' as FieldType, icon: '☑️', label: '多选题' },
      { type: 'select' as FieldType, icon: '📋', label: '下拉选择' },
      { type: 'rating' as FieldType, icon: '⭐', label: '评分' }
    ]
  },
  {
    title: '高级字段',
    items: [
      { type: 'image' as FieldType, icon: '🔍', label: '图片/OCR' },
      { type: 'date' as FieldType, icon: '📅', label: '日期' },
      { type: 'time' as FieldType, icon: '⏰', label: '时间' },
      { type: 'location' as FieldType, icon: '📍', label: '位置' },
      { type: 'signature' as FieldType, icon: '✍️', label: '签名' },
      { type: 'file' as FieldType, icon: '📎', label: '文件' }
    ]
  },
  {
    title: '辅助元素',
    items: [
      { type: 'description' as FieldType, icon: '💬', label: '说明文字' },
      { type: 'divider' as FieldType, icon: '➖', label: '分割线' }
    ]
  }
]

export default function FormBuilderPage() {
  const router = useRouter()
  const {
    currentForm, isDirty, selectedFieldId,
    initForm, updateFormMeta, addField, removeField,
    reorderFields, selectField, setStatus, saveForm
  } = useFormBuilderStore()

  const [activeTab, setActiveTab] = useState<TabKey>('fields')
  const [showFieldPicker, setShowFieldPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  useLoad((params) => {
    if (params.mode === 'create') {
      initForm()
    } else if (params.mode === 'edit' && params.id) {
      const forms = JSON.parse(Taro.getStorageSync('sf_forms') || '[]')
      const form = forms.find((f: { id: string }) => f.id === params.id)
      if (form) initForm(form)
      else initForm()
    }
  })

  const handleSave = async () => {
    if (!currentForm?.title.trim()) {
      Taro.showToast({ title: '请输入表单标题', icon: 'none' })
      return
    }
    setSaving(true)
    await saveForm()
    setSaving(false)
    Taro.showToast({ title: '保存成功', icon: 'success' })
  }

  const handlePublish = async () => {
    if (!currentForm?.title.trim()) {
      Taro.showToast({ title: '请输入表单标题', icon: 'none' })
      return
    }
    if (currentForm!.fields.length === 0) {
      Taro.showToast({ title: '请至少添加一个字段', icon: 'none' })
      return
    }
    setStatus('published')
    await saveForm()
    Taro.showToast({ title: '发布成功！', icon: 'success' })
  }

  const handlePreview = () => {
    if (!currentForm) return
    Taro.navigateTo({ url: `/pages/form-fill/index?id=${currentForm.id}&preview=1` })
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= (currentForm?.fields.length || 0)) return
    reorderFields(index, targetIndex)
  }

  if (!currentForm) {
    return <View className='builder-loading'><Text>加载中...</Text></View>
  }

  return (
    <View className='builder-page'>
      {/* 顶部操作栏 */}
      <View className='builder-header'>
        <View className='builder-header__back' onClick={() => Taro.navigateBack()}>
          <Text className='back-icon'>‹</Text>
        </View>
        <View className='builder-header__title'>
          <Text className='builder-title'>{currentForm.title || '未命名表单'}</Text>
          {isDirty && <Text className='dirty-dot' />}
        </View>
        <View className='builder-header__actions'>
          <View className='hdr-btn hdr-btn--ghost' onClick={handlePreview}>
            <Text>预览</Text>
          </View>
          <View className={`hdr-btn hdr-btn--primary ${saving ? 'hdr-btn--disabled' : ''}`} onClick={handleSave}>
            <Text>{saving ? '保存中' : '保存'}</Text>
          </View>
          {currentForm.status !== 'published' && (
            <View className='hdr-btn hdr-btn--publish' onClick={handlePublish}>
              <Text>发布</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tab 切换 */}
      <View className='builder-tabs'>
        {(['fields', 'settings', 'doc'] as TabKey[]).map(tab => (
          <View
            key={tab}
            className={`builder-tab ${activeTab === tab ? 'builder-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <Text>{tab === 'fields' ? '字段设计' : tab === 'settings' ? '回收设置' : '腾讯文档'}</Text>
          </View>
        ))}
      </View>

      {/* 字段设计 Tab */}
      {activeTab === 'fields' && (
        <ScrollView scrollY className='builder-content'>
          {/* 表单基本信息 */}
          <View className='form-meta-card'>
            <Input
              className='meta-title-input'
              value={currentForm.title}
              placeholder='点击输入表单标题...'
              onInput={(e) => updateFormMeta({ title: e.detail.value })}
            />
            <Textarea
              className='meta-desc-input'
              value={currentForm.description || ''}
              placeholder='添加表单说明（可选）...'
              onInput={(e) => updateFormMeta({ description: e.detail.value })}
              autoHeight
            />
          </View>

          {/* 字段列表 */}
          <View className='fields-list'>
            {currentForm.fields.length === 0 && (
              <View className='fields-empty'>
                <Text className='fields-empty__icon'>🧩</Text>
                <Text className='fields-empty__text'>点击下方「+ 添加字段」开始设计表单</Text>
              </View>
            )}
            {currentForm.fields.map((field, index) => (
              <View
                key={field.id}
                className={`field-item ${selectedFieldId === field.id ? 'field-item--selected' : ''}`}
                onClick={() => selectField(field.id)}
              >
                <View className='field-item__header'>
                  <Text className='field-item__label'>
                    {field.required && <Text className='required-star'>*</Text>}
                    {field.label}
                  </Text>
                  <View className='field-item__ops'>
                    <View className='op-btn' onClick={(e) => { e.stopPropagation(); moveField(index, 'up') }}>
                      <Text>↑</Text>
                    </View>
                    <View className='op-btn' onClick={(e) => { e.stopPropagation(); moveField(index, 'down') }}>
                      <Text>↓</Text>
                    </View>
                    <View className='op-btn op-btn--danger' onClick={(e) => { e.stopPropagation(); removeField(field.id) }}>
                      <Text>✕</Text>
                    </View>
                  </View>
                </View>
                <FieldEditor field={field} />
              </View>
            ))}
          </View>

          {/* 添加字段按钮 */}
          <View className='add-field-btn' onClick={() => setShowFieldPicker(true)}>
            <Text className='add-field-btn__icon'>+</Text>
            <Text className='add-field-btn__text'>添加字段</Text>
          </View>
        </ScrollView>
      )}

      {/* 回收设置 Tab */}
      {activeTab === 'settings' && (
        <ScrollView scrollY className='builder-content'>
          <CollectStrategyPanel />
        </ScrollView>
      )}

      {/* 腾讯文档 Tab */}
      {activeTab === 'doc' && (
        <ScrollView scrollY className='builder-content'>
          <TencentDocPanel />
        </ScrollView>
      )}

      {/* 字段选择弹窗 */}
      {showFieldPicker && (
        <View className='picker-overlay' onClick={() => setShowFieldPicker(false)}>
          <View className='picker-panel' onClick={(e) => e.stopPropagation()}>
            <View className='picker-header'>
              <Text className='picker-title'>选择字段类型</Text>
              <Text className='picker-close' onClick={() => setShowFieldPicker(false)}>✕</Text>
            </View>
            <ScrollView scrollY className='picker-body'>
              {FIELD_GROUPS.map(group => (
                <View key={group.title} className='field-group'>
                  <Text className='field-group__title'>{group.title}</Text>
                  <View className='field-group__grid'>
                    {group.items.map(item => (
                      <View
                        key={item.type}
                        className='field-picker-item'
                        onClick={() => {
                          addField(item.type)
                          setShowFieldPicker(false)
                          setActiveTab('fields')
                        }}
                      >
                        <Text className='fpi-icon'>{item.icon}</Text>
                        <Text className='fpi-label'>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
}
