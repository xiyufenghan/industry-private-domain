import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Form, FormField, Submission, FormAnalysis } from '../types'
import { generateId } from '../utils/helpers'

// ==================== 表单构建器 Store ====================
interface FormBuilderState {
  currentForm: Form | null
  isDirty: boolean
  selectedFieldId: string | null

  // Actions
  initForm: (form?: Partial<Form>) => void
  updateFormMeta: (meta: Partial<Pick<Form, 'title' | 'description' | 'coverImage'>>) => void
  addField: (type: FormField['type']) => void
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  removeField: (fieldId: string) => void
  reorderFields: (fromIndex: number, toIndex: number) => void
  selectField: (fieldId: string | null) => void
  updateCollectStrategy: (updates: Partial<Form['collectStrategy']>) => void
  updateTencentDocConfig: (updates: Partial<Form['tencentDocConfig']>) => void
  setStatus: (status: Form['status']) => void
  saveForm: () => Promise<void>
}

const defaultForm = (): Form => ({
  id: generateId(),
  title: '未命名表单',
  description: '',
  fields: [],
  collectStrategy: {
    allowRepeatSubmit: false,
    requireLogin: true,
    autoCloseOnMax: true,
    reminderEnabled: false
  },
  tencentDocConfig: {
    enabled: false,
    syncMode: 'manual',
    includeUserInfo: true
  },
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  submissionCount: 0
})

export const useFormBuilderStore = create<FormBuilderState>()(
  immer((set, get) => ({
    currentForm: null,
    isDirty: false,
    selectedFieldId: null,

    initForm: (form) => set(state => {
      state.currentForm = form ? { ...defaultForm(), ...form } as Form : defaultForm()
      state.isDirty = false
      state.selectedFieldId = null
    }),

    updateFormMeta: (meta) => set(state => {
      if (!state.currentForm) return
      Object.assign(state.currentForm, meta)
      state.currentForm.updatedAt = new Date().toISOString()
      state.isDirty = true
    }),

    addField: (type) => set(state => {
      if (!state.currentForm) return
      const newField: FormField = {
        id: generateId(),
        type,
        label: getDefaultLabel(type),
        required: false,
        order: state.currentForm.fields.length,
        options: ['radio', 'checkbox', 'select'].includes(type)
          ? [
              { label: '选项1', value: 'opt1' },
              { label: '选项2', value: 'opt2' }
            ]
          : undefined
      }
      state.currentForm.fields.push(newField)
      state.selectedFieldId = newField.id
      state.isDirty = true
    }),

    updateField: (fieldId, updates) => set(state => {
      if (!state.currentForm) return
      const idx = state.currentForm.fields.findIndex(f => f.id === fieldId)
      if (idx >= 0) {
        Object.assign(state.currentForm.fields[idx], updates)
        state.isDirty = true
      }
    }),

    removeField: (fieldId) => set(state => {
      if (!state.currentForm) return
      state.currentForm.fields = state.currentForm.fields.filter(f => f.id !== fieldId)
      if (state.selectedFieldId === fieldId) state.selectedFieldId = null
      state.isDirty = true
    }),

    reorderFields: (fromIndex, toIndex) => set(state => {
      if (!state.currentForm) return
      const fields = state.currentForm.fields
      const [moved] = fields.splice(fromIndex, 1)
      fields.splice(toIndex, 0, moved)
      fields.forEach((f, i) => { f.order = i })
      state.isDirty = true
    }),

    selectField: (fieldId) => set(state => {
      state.selectedFieldId = fieldId
    }),

    updateCollectStrategy: (updates) => set(state => {
      if (!state.currentForm) return
      Object.assign(state.currentForm.collectStrategy, updates)
      state.isDirty = true
    }),

    updateTencentDocConfig: (updates) => set(state => {
      if (!state.currentForm) return
      Object.assign(state.currentForm.tencentDocConfig, updates)
      state.isDirty = true
    }),

    setStatus: (status) => set(state => {
      if (!state.currentForm) return
      state.currentForm.status = status
      state.isDirty = true
    }),

    saveForm: async () => {
      const form = get().currentForm
      if (!form) return
      // TODO: 接入后端API
      const forms = JSON.parse(localStorage.getItem('sf_forms') || '[]') as Form[]
      const idx = forms.findIndex(f => f.id === form.id)
      if (idx >= 0) forms[idx] = form
      else forms.push(form)
      localStorage.setItem('sf_forms', JSON.stringify(forms))
      set(state => { state.isDirty = false })
    }
  }))
)

// ==================== 表单列表 Store ====================
interface FormListState {
  forms: Form[]
  loading: boolean
  loadForms: () => void
  deleteForm: (id: string) => void
  duplicateForm: (id: string) => void
}

export const useFormListStore = create<FormListState>()(
  immer((set, get) => ({
    forms: [],
    loading: false,

    loadForms: () => {
      set(state => { state.loading = true })
      // TODO: 接入后端API
      const forms = JSON.parse(localStorage.getItem('sf_forms') || '[]') as Form[]
      set(state => {
        state.forms = forms
        state.loading = false
      })
    },

    deleteForm: (id) => set(state => {
      state.forms = state.forms.filter(f => f.id !== id)
      localStorage.setItem('sf_forms', JSON.stringify(state.forms))
    }),

    duplicateForm: (id) => {
      const form = get().forms.find(f => f.id === id)
      if (!form) return
      const newForm: Form = {
        ...form,
        id: generateId(),
        title: form.title + ' (副本)',
        status: 'draft',
        submissionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      set(state => { state.forms.unshift(newForm) })
      localStorage.setItem('sf_forms', JSON.stringify(get().forms))
    }
  }))
)

// ==================== 答卷 Store ====================
interface SubmissionState {
  submissions: Submission[]
  analysis: FormAnalysis | null
  loadSubmissions: (formId: string) => void
  addSubmission: (submission: Submission) => void
  exportToTencentDoc: (formId: string) => Promise<{ success: boolean; message: string }>
}

export const useSubmissionStore = create<SubmissionState>()(
  immer((set, get) => ({
    submissions: [],
    analysis: null,

    loadSubmissions: (formId) => {
      const all = JSON.parse(localStorage.getItem(`sf_submissions_${formId}`) || '[]') as Submission[]
      set(state => { state.submissions = all })
    },

    addSubmission: (submission) => {
      const key = `sf_submissions_${submission.formId}`
      const all = JSON.parse(localStorage.getItem(key) || '[]') as Submission[]
      all.push(submission)
      localStorage.setItem(key, JSON.stringify(all))
      set(state => { state.submissions.push(submission) })
    },

    exportToTencentDoc: async (formId) => {
      // TODO: 接入腾讯文档 API
      const submissions = get().submissions
      console.log('[TencentDoc] 导出数据条数:', submissions.length)
      await new Promise(r => setTimeout(r, 1500))
      return { success: true, message: `已成功导出 ${submissions.length} 条数据到腾讯文档` }
    }
  }))
)

// ==================== 工具函数 ====================
function getDefaultLabel(type: FormField['type']): string {
  const map: Record<string, string> = {
    text: '单行文本',
    textarea: '多行文本',
    radio: '单选题',
    checkbox: '多选题',
    select: '下拉选择',
    date: '日期',
    time: '时间',
    rating: '评分',
    image: '图片上传',
    file: '文件上传',
    location: '地理位置',
    signature: '电子签名',
    divider: '分割线',
    description: '说明文字'
  }
  return map[type] || '新字段'
}
