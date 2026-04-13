export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
}

export const RoleLabel: Record<Role, string> = {
  [Role.ADMIN]: '管理员',
  [Role.MANAGER]: '市场经理',
  [Role.OPERATOR]: '运营人员',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待处理',
  [OrderStatus.IN_PROGRESS]: '进行中',
  [OrderStatus.DONE]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
}

export const OrderStatusColor: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [OrderStatus.DONE]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-500',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const PriorityLabel: Record<Priority, string> = {
  [Priority.LOW]: '低',
  [Priority.MEDIUM]: '中',
  [Priority.HIGH]: '高',
  [Priority.URGENT]: '紧急',
}

export const PriorityColor: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-100 text-gray-600',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-700',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700',
  [Priority.URGENT]: 'bg-red-100 text-red-700',
}

export enum AccountStatus {
  NORMAL = 'NORMAL',
  ABNORMAL = 'ABNORMAL',
  BANNED = 'BANNED',
}

export const AccountStatusLabel: Record<AccountStatus, string> = {
  [AccountStatus.NORMAL]: '正常',
  [AccountStatus.ABNORMAL]: '异常',
  [AccountStatus.BANNED]: '封禁',
}

export const AccountStatusColor: Record<AccountStatus, string> = {
  [AccountStatus.NORMAL]: 'bg-green-100 text-green-700',
  [AccountStatus.ABNORMAL]: 'bg-yellow-100 text-yellow-700',
  [AccountStatus.BANNED]: 'bg-red-100 text-red-700',
}

export enum ImportCategory {
  OA = 'OA',
  CUSTOMER = 'CUSTOMER',
  IDENTITY = 'IDENTITY',
  ACTIVITY = 'ACTIVITY',
  ACCOUNT = 'ACCOUNT',
}

export const ImportCategoryLabel: Record<ImportCategory, string> = {
  [ImportCategory.OA]: '公众号数据',
  [ImportCategory.CUSTOMER]: '客户数据',
  [ImportCategory.IDENTITY]: '身份识别数据',
  [ImportCategory.ACTIVITY]: '活动数据',
  [ImportCategory.ACCOUNT]: '账号数据',
}

export const OrderTypes = [
  '公众号排版',
  '数据清洗',
  '文案撰写',
  '活动资料处理',
  '问卷数据清洗',
  '建联需求',
  '信息分发',
  '标签设置',
  '其他',
]

// ==================== 宣推系统 ====================

export enum PromotionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const PromotionStatusLabel: Record<PromotionStatus, string> = {
  [PromotionStatus.DRAFT]: '草稿',
  [PromotionStatus.PUBLISHED]: '已发布',
  [PromotionStatus.COMPLETED]: '已完成',
  [PromotionStatus.CANCELLED]: '已取消',
}

export const PromotionStatusColor: Record<PromotionStatus, string> = {
  [PromotionStatus.DRAFT]: 'bg-gray-100 text-gray-600',
  [PromotionStatus.PUBLISHED]: 'bg-blue-100 text-blue-700',
  [PromotionStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [PromotionStatus.CANCELLED]: 'bg-gray-100 text-gray-500',
}

export const ContentTypes = ['产品推广', '活动宣传', '品牌种草', '其他']

export enum Touchpoint {
  ONE_ON_ONE = '1V1',
  MOMENTS = 'MOMENTS',
  GROUP = 'GROUP',
}

export const TouchpointLabel: Record<string, string> = {
  '1V1': '1V1 私聊',
  'MOMENTS': '朋友圈',
  'GROUP': '社群',
}

export const TouchpointColor: Record<string, string> = {
  '1V1': 'bg-purple-100 text-purple-700',
  'MOMENTS': 'bg-orange-100 text-orange-700',
  'GROUP': 'bg-teal-100 text-teal-700',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export const ExecutionStatusLabel: Record<ExecutionStatus, string> = {
  [ExecutionStatus.PENDING]: '待执行',
  [ExecutionStatus.IN_PROGRESS]: '执行中',
  [ExecutionStatus.DONE]: '已完成',
}
