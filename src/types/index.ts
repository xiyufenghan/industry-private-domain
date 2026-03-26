// ==================== 表单相关类型 ====================

/** 表单字段类型 */
export type FieldType =
  | 'text'        // 单行文本
  | 'textarea'    // 多行文本
  | 'radio'       // 单选
  | 'checkbox'    // 多选
  | 'select'      // 下拉选择
  | 'date'        // 日期
  | 'time'        // 时间
  | 'rating'      // 评分
  | 'image'       // 图片上传（支持OCR）
  | 'file'        // 文件上传
  | 'location'    // 地理位置
  | 'signature'   // 电子签名
  | 'divider'     // 分割线
  | 'description' // 说明文字

/** 表单字段选项 */
export interface FieldOption {
  label: string
  value: string
  score?: number // 用于分析时的分值
}

/** OCR 配置 */
export interface OcrConfig {
  enabled: boolean
  mode: 'auto' | 'manual'           // 自动识别 or 手动触发
  targetFields: string[]             // 识别结果填入哪些字段
  ocrType: 'general' | 'id_card' | 'business_license' | 'invoice' // OCR类型
}

/** 表单字段定义 */
export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  description?: string
  options?: FieldOption[]
  defaultValue?: string | string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    patternMsg?: string
    min?: number
    max?: number
  }
  ocr?: OcrConfig
  visible?: boolean
  order: number
}

/** 表单回收策略 */
export interface CollectStrategy {
  maxSubmissions?: number          // 最大提交数量
  deadlineTime?: string            // 截止时间 ISO8601
  allowRepeatSubmit: boolean       // 是否允许重复提交
  requireLogin: boolean            // 是否需要微信登录（获取 openid）
  autoCloseOnMax: boolean          // 达到上限自动关闭
  reminderEnabled: boolean         // 开启提交提醒
  reminderInterval?: number        // 提醒间隔（分钟）
}

/** 腾讯文档同步配置 */
export interface TencentDocConfig {
  enabled: boolean
  docUrl?: string                  // 腾讯文档链接
  docId?: string                   // 文档ID
  sheetName?: string               // 工作表名
  syncMode: 'realtime' | 'scheduled' | 'manual'
  scheduleInterval?: number        // 定时间隔（分钟）
  lastSyncTime?: string
  includeUserInfo: boolean         // 是否包含用户身份信息
}

/** 表单主体 */
export interface Form {
  id: string
  title: string
  description?: string
  coverImage?: string
  fields: FormField[]
  collectStrategy: CollectStrategy
  tencentDocConfig: TencentDocConfig
  status: 'draft' | 'published' | 'closed'
  createdAt: string
  updatedAt: string
  submissionCount: number
  shareUrl?: string
}

// ==================== 答卷相关类型 ====================

/** 用户身份信息（微信）*/
export interface UserIdentity {
  openid?: string
  unionid?: string
  nickName?: string
  avatarUrl?: string
  platform: 'weapp' | 'h5'
  sessionId?: string
  ip?: string
  userAgent?: string
}

/** 字段答案 */
export interface FieldAnswer {
  fieldId: string
  fieldLabel: string
  value: string | string[]
  ocrRawText?: string             // OCR 原始识别文本
}

/** 答卷 */
export interface Submission {
  id: string
  formId: string
  answers: FieldAnswer[]
  userIdentity: UserIdentity
  submittedAt: string
  duration: number               // 填写耗时（秒）
  deviceInfo?: {
    platform: string
    brand?: string
    model?: string
    system?: string
  }
}

// ==================== 分析相关类型 ====================

/** 单字段统计 */
export interface FieldStats {
  fieldId: string
  fieldLabel: string
  fieldType: FieldType
  totalAnswers: number
  optionStats?: { label: string; count: number; percentage: number }[]
  avgScore?: number              // 评分题平均分
  textSamples?: string[]        // 文本题样本
}

/** 表单分析报告 */
export interface FormAnalysis {
  formId: string
  totalSubmissions: number
  validSubmissions: number
  avgDuration: number
  submissionTrend: { date: string; count: number }[]
  fieldStats: FieldStats[]
  platformStats: { platform: string; count: number }[]
  generatedAt: string
}
