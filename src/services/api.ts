import Taro from '@tarojs/taro'
import type { Form, Submission } from '../types'

const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api'
  : 'https://your-api-domain.com/api'

/** 统一请求封装 */
const request = <T>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
}): Promise<T> => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Taro.getStorageSync('token') || ''}`
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
        } else {
          reject(new Error(res.data?.message || '请求失败'))
        }
      },
      fail: reject
    })
  })
}

// ==================== 表单 API ====================
export const formApi = {
  list: () => request<Form[]>({ url: '/forms' }),
  get: (id: string) => request<Form>({ url: `/forms/${id}` }),
  create: (form: Form) => request<Form>({ url: '/forms', method: 'POST', data: form as unknown as Record<string, unknown> }),
  update: (id: string, form: Partial<Form>) => request<Form>({ url: `/forms/${id}`, method: 'PUT', data: form as unknown as Record<string, unknown> }),
  delete: (id: string) => request<void>({ url: `/forms/${id}`, method: 'DELETE' }),
  publish: (id: string) => request<Form>({ url: `/forms/${id}/publish`, method: 'POST' }),
  close: (id: string) => request<Form>({ url: `/forms/${id}/close`, method: 'POST' })
}

// ==================== 答卷 API ====================
export const submissionApi = {
  submit: (submission: Submission) => request<{ id: string }>({
    url: '/submissions',
    method: 'POST',
    data: submission as unknown as Record<string, unknown>
  }),
  list: (formId: string, page = 1, pageSize = 20) => request<{
    list: Submission[];
    total: number;
    page: number;
  }>({ url: `/submissions?formId=${formId}&page=${page}&pageSize=${pageSize}` }),
  getAnalysis: (formId: string) => request<{
    totalSubmissions: number;
    avgDuration: number;
    trend: { date: string; count: number }[];
  }>({ url: `/submissions/${formId}/analysis` })
}

// ==================== OCR API ====================
export const ocrApi = {
  /**
   * 上传图片进行 OCR 识别
   * @param imageBase64 图片 base64
   * @param type OCR 类型
   */
  recognize: (imageBase64: string, type: 'general' | 'id_card' | 'business_license' | 'invoice' = 'general') =>
    request<{
      text: string;
      fields?: Record<string, string>;
      confidence: number;
    }>({
      url: '/ocr/recognize',
      method: 'POST',
      data: { imageBase64, type }
    })
}

// ==================== 腾讯文档 API ====================
export const tencentDocApi = {
  /**
   * 获取授权 URL
   */
  getAuthUrl: () => request<{ url: string }>({ url: '/tencent-doc/auth-url' }),

  /**
   * 导出数据到腾讯文档
   */
  export: (params: {
    formId: string;
    docId?: string;
    sheetName?: string;
    includeUserInfo: boolean;
  }) => request<{ docUrl: string; exportedCount: number }>({
    url: '/tencent-doc/export',
    method: 'POST',
    data: params
  }),

  /**
   * 配置实时同步
   */
  setupSync: (params: {
    formId: string;
    docId: string;
    sheetName: string;
    interval?: number;
  }) => request<{ syncId: string }>({
    url: '/tencent-doc/sync',
    method: 'POST',
    data: params
  })
}

// ==================== 微信登录 API ====================
export const authApi = {
  /**
   * 微信小程序登录，换取 openid/unionid
   */
  wxLogin: (code: string) => request<{
    token: string;
    openid: string;
    unionid?: string;
    sessionKey: string;
  }>({
    url: '/auth/wx-login',
    method: 'POST',
    data: { code }
  }),

  /**
   * H5 静默获取 openid
   */
  h5Login: (code: string) => request<{
    token: string;
    openid: string;
    unionid?: string;
  }>({
    url: '/auth/h5-login',
    method: 'POST',
    data: { code }
  })
}
