/** 生成唯一 ID */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/** 格式化时间 */
export const formatTime = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 格式化秒数为 mm:ss */
export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}分${pad(s)}秒` : `${s}秒`
}

/** 深拷贝 */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

/** 获取平台信息 */
export const getPlatform = (): 'weapp' | 'h5' => {
  if (typeof wx !== 'undefined' && wx.miniProgram) return 'weapp'
  return 'h5'
}

/** 文件大小格式化 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

/** 验证手机号 */
export const isPhone = (val: string): boolean => /^1[3-9]\d{9}$/.test(val)

/** 验证邮箱 */
export const isEmail = (val: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

/** 构建表单分享链接 */
export const buildShareUrl = (formId: string): string => {
  // H5 分享链接
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
  return `${base}/form-fill?id=${formId}`
}

/** 颜色工具：判断文字应该用深色还是浅色 */
export const getContrastText = (hex: string): '#fff' | '#000' => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000' : '#fff'
}
