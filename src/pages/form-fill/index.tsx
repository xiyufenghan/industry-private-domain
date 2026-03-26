import { View, Text, Input, Textarea, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter, useLoad } from '@tarojs/taro'
import { useState, useRef } from 'react'
import type { Form, FieldAnswer, Submission, UserIdentity } from '../../types'
import { generateId, getPlatform } from '../../utils/helpers'
import { useSubmissionStore } from '../../store'
import OcrUploader from '../../components/ocr/OcrUploader'
import './index.scss'

export default function FormFillPage() {
  const router = useRouter()
  const { addSubmission } = useSubmissionStore()

  const [form, setForm] = useState<Form | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const isPreview = router.params.preview === '1'
  const startTime = useRef(Date.now())

  useLoad((params) => {
    if (!params.id) return
    const forms = JSON.parse(Taro.getStorageSync('sf_forms') || '[]') as Form[]
    const found = forms.find((f: Form) => f.id === params.id)
    if (found) setForm(found)
  })

  const setAnswer = (fieldId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n })
  }

  const toggleCheckbox = (fieldId: string, value: string) => {
    const current = (answers[fieldId] as string[]) || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    setAnswer(fieldId, updated)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    form?.fields.forEach(field => {
      if (field.type === 'divider' || field.type === 'description') return
      const val = answers[field.id]
      if (field.required) {
        if (!val || (Array.isArray(val) ? val.length === 0 : val.trim() === '')) {
          errs[field.id] = '此项为必填'
        }
      }
      if (field.validation && typeof val === 'string' && val) {
        if (field.validation.minLength && val.length < field.validation.minLength) {
          errs[field.id] = `最少输入 ${field.validation.minLength} 个字符`
        }
        if (field.validation.maxLength && val.length > field.validation.maxLength) {
          errs[field.id] = `最多输入 ${field.validation.maxLength} 个字符`
        }
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!form || isPreview) return
    if (!validate()) {
      Taro.showToast({ title: '请检查必填项', icon: 'none' })
      return
    }
    setSubmitting(true)

    // 构建答卷
    const fieldAnswers: FieldAnswer[] = form.fields
      .filter(f => f.type !== 'divider' && f.type !== 'description')
      .map(f => ({
        fieldId: f.id,
        fieldLabel: f.label,
        value: answers[f.id] || ''
      }))

    // 构建用户身份（实际项目需要微信登录获取）
    const identity: UserIdentity = {
      platform: getPlatform(),
      // openid 和 unionid 需要通过后端微信登录接口获取
    }

    const submission: Submission = {
      id: generateId(),
      formId: form.id,
      answers: fieldAnswers,
      userIdentity: identity,
      submittedAt: new Date().toISOString(),
      duration: Math.floor((Date.now() - startTime.current) / 1000)
    }

    addSubmission(submission)
    setSubmitting(false)
    Taro.navigateTo({ url: `/pages/form-result/index?formId=${form.id}` })
  }

  if (!form) {
    return <View className='fill-loading'><Text>加载中...</Text></View>
  }

  // 判断表单状态
  if (!isPreview && form.status === 'draft') {
    return (
      <View className='fill-closed'>
        <Text className='fill-closed__icon'>⚠️</Text>
        <Text className='fill-closed__title'>表单未发布</Text>
        <Text className='fill-closed__desc'>该表单还在草稿状态，尚未对外开放</Text>
      </View>
    )
  }

  if (!isPreview && form.status === 'closed') {
    return (
      <View className='fill-closed'>
        <Text className='fill-closed__icon'>🔒</Text>
        <Text className='fill-closed__title'>表单已关闭</Text>
        <Text className='fill-closed__desc'>该表单已停止收集，感谢您的关注</Text>
      </View>
    )
  }

  return (
    <View className='fill-page'>
      {isPreview && (
        <View className='preview-banner'>
          <Text>👁 预览模式，不会提交数据</Text>
        </View>
      )}

      <ScrollView scrollY className='fill-scroll'>
        {/* 表单头部 */}
        <View className='fill-header'>
          <Text className='fill-title'>{form.title}</Text>
          {form.description && (
            <Text className='fill-desc'>{form.description}</Text>
          )}
        </View>

        {/* 字段渲染 */}
        <View className='fill-fields'>
          {form.fields.map(field => (
            <View key={field.id} className='fill-field'>
              {/* 分割线 */}
              {field.type === 'divider' && <View className='field-divider' />}

              {/* 说明文字 */}
              {field.type === 'description' && (
                <View className='field-desc-block'>
                  <Text>{field.description || field.label}</Text>
                </View>
              )}

              {/* 普通字段 */}
              {field.type !== 'divider' && field.type !== 'description' && (
                <>
                  <View className='fill-field__label'>
                    {field.required && <Text className='required-star'>*</Text>}
                    <Text>{field.label}</Text>
                  </View>
                  {field.description && (
                    <Text className='fill-field__hint'>{field.description}</Text>
                  )}

                  {/* 单行文本 */}
                  {field.type === 'text' && (
                    <Input
                      className={`fill-input ${errors[field.id] ? 'fill-input--error' : ''}`}
                      value={(answers[field.id] as string) || ''}
                      placeholder={field.placeholder || `请输入${field.label}`}
                      onInput={(e) => setAnswer(field.id, e.detail.value)}
                    />
                  )}

                  {/* 多行文本 */}
                  {field.type === 'textarea' && (
                    <Textarea
                      className={`fill-textarea ${errors[field.id] ? 'fill-textarea--error' : ''}`}
                      value={(answers[field.id] as string) || ''}
                      placeholder={field.placeholder || `请输入${field.label}`}
                      onInput={(e) => setAnswer(field.id, e.detail.value)}
                      autoHeight
                    />
                  )}

                  {/* 单选 */}
                  {field.type === 'radio' && (
                    <View className='fill-options'>
                      {(field.options || []).map(opt => (
                        <View
                          key={opt.value}
                          className={`fill-option ${answers[field.id] === opt.value ? 'fill-option--selected' : ''}`}
                          onClick={() => setAnswer(field.id, opt.value)}
                        >
                          <View className='option-radio'>
                            {answers[field.id] === opt.value && <View className='option-radio__dot' />}
                          </View>
                          <Text className='option-label'>{opt.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 多选 */}
                  {field.type === 'checkbox' && (
                    <View className='fill-options'>
                      {(field.options || []).map(opt => {
                        const checked = ((answers[field.id] as string[]) || []).includes(opt.value)
                        return (
                          <View
                            key={opt.value}
                            className={`fill-option ${checked ? 'fill-option--selected' : ''}`}
                            onClick={() => toggleCheckbox(field.id, opt.value)}
                          >
                            <View className={`option-checkbox ${checked ? 'option-checkbox--checked' : ''}`}>
                              {checked && <Text className='checkbox-check'>✓</Text>}
                            </View>
                            <Text className='option-label'>{opt.label}</Text>
                          </View>
                        )
                      })}
                    </View>
                  )}

                  {/* 评分 */}
                  {field.type === 'rating' && (
                    <View className='fill-rating'>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Text
                          key={star}
                          className={`rating-star ${Number(answers[field.id]) >= star ? 'rating-star--active' : ''}`}
                          onClick={() => setAnswer(field.id, String(star))}
                        >★</Text>
                      ))}
                      {answers[field.id] && (
                        <Text className='rating-label'>{answers[field.id]} 分</Text>
                      )}
                    </View>
                  )}

                  {/* 图片/OCR */}
                  {field.type === 'image' && (
                    <OcrUploader
                      field={field}
                      value={(answers[field.id] as string) || ''}
                      onChange={(val) => setAnswer(field.id, val)}
                    />
                  )}

                  {/* 错误提示 */}
                  {errors[field.id] && (
                    <Text className='fill-error'>{errors[field.id]}</Text>
                  )}
                </>
              )}
            </View>
          ))}
        </View>

        {/* 提交按钮 */}
        <View
          className={`submit-btn ${submitting ? 'submit-btn--loading' : ''}`}
          onClick={handleSubmit}
        >
          <Text>{submitting ? '提交中...' : isPreview ? '预览模式' : '提交'}</Text>
        </View>
      </ScrollView>
    </View>
  )
}
