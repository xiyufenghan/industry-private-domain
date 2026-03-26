import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useFormListStore } from '../../store'
import { formatTime } from '../../utils/helpers'
import './index.scss'

export default function IndexPage() {
  const { forms, loading, loadForms, deleteForm, duplicateForm } = useFormListStore()

  useDidShow(() => {
    loadForms()
  })

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/form-builder/index?mode=create' })
  }

  const handleEdit = (id: string) => {
    Taro.navigateTo({ url: `/pages/form-builder/index?mode=edit&id=${id}` })
  }

  const handleView = (id: string) => {
    Taro.navigateTo({ url: `/pages/dashboard/index?id=${id}` })
  }

  const handleDelete = (id: string, title: string) => {
    Taro.showModal({
      title: '确认删除',
      content: `确认删除「${title}」？删除后不可恢复`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          deleteForm(id)
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }

  const handleMore = (id: string, title: string) => {
    Taro.showActionSheet({
      itemList: ['复制表单', '查看数据', '删除表单'],
      success: (res) => {
        if (res.tapIndex === 0) {
          duplicateForm(id)
          Taro.showToast({ title: '复制成功', icon: 'success' })
        } else if (res.tapIndex === 1) {
          handleView(id)
        } else if (res.tapIndex === 2) {
          handleDelete(id, title)
        }
      }
    })
  }

  const statusConfig = {
    draft: { label: '草稿', color: '#9CA3AF' },
    published: { label: '收集中', color: '#10B981' },
    closed: { label: '已关闭', color: '#F59E0B' }
  }

  return (
    <View className='index-page'>
      {/* 顶部标题栏 */}
      <View className='header'>
        <View className='header__left'>
          <Text className='header__title'>超级表单</Text>
          <Text className='header__sub'>自动化 · 智能收集</Text>
        </View>
        <View className='header__avatar'>
          <Text className='avatar-text'>SF</Text>
        </View>
      </View>

      {/* 统计卡片 */}
      <View className='stats-row'>
        <View className='stat-card'>
          <Text className='stat-num'>{forms.length}</Text>
          <Text className='stat-label'>表单总数</Text>
        </View>
        <View className='stat-card'>
          <Text className='stat-num'>{forms.filter(f => f.status === 'published').length}</Text>
          <Text className='stat-label'>收集中</Text>
        </View>
        <View className='stat-card'>
          <Text className='stat-num'>{forms.reduce((s, f) => s + f.submissionCount, 0)}</Text>
          <Text className='stat-label'>总回收</Text>
        </View>
      </View>

      {/* 表单列表 */}
      <View className='section'>
        <View className='section__header'>
          <Text className='section__title'>我的表单</Text>
          <View className='create-btn' onClick={handleCreate}>
            <Text className='create-btn__icon'>+</Text>
            <Text className='create-btn__text'>新建</Text>
          </View>
        </View>

        {loading && (
          <View className='empty-state'>
            <Text className='empty-state__text'>加载中...</Text>
          </View>
        )}

        {!loading && forms.length === 0 && (
          <View className='empty-state' onClick={handleCreate}>
            <Text className='empty-state__icon'>📋</Text>
            <Text className='empty-state__text'>还没有表单，点击创建第一个</Text>
            <Text className='empty-state__hint'>支持 OCR · 自动回收 · 数据追踪</Text>
          </View>
        )}

        {forms.map(form => (
          <View key={form.id} className='form-card' onClick={() => handleEdit(form.id)}>
            <View className='form-card__main'>
              <View className='form-card__title-row'>
                <Text className='form-card__title'>{form.title}</Text>
                <View
                  className='status-badge'
                  style={{ color: statusConfig[form.status].color, borderColor: statusConfig[form.status].color }}
                >
                  <Text>{statusConfig[form.status].label}</Text>
                </View>
              </View>
              <Text className='form-card__meta'>
                {form.fields.length} 个字段 · 已回收 {form.submissionCount} 份
              </Text>
              <Text className='form-card__time'>更新于 {formatTime(form.updatedAt)}</Text>
              <View className='form-card__tags'>
                {form.collectStrategy.requireLogin && (
                  <Text className='tag tag--info'>身份追踪</Text>
                )}
                {form.fields.some(f => f.ocr?.enabled) && (
                  <Text className='tag tag--purple'>OCR</Text>
                )}
                {form.tencentDocConfig.enabled && (
                  <Text className='tag tag--success'>腾讯文档</Text>
                )}
              </View>
            </View>
            <View className='form-card__actions'>
              <View className='action-btn action-btn--view' onClick={(e) => { e.stopPropagation(); handleView(form.id) }}>
                <Text>数据</Text>
              </View>
              <View className='action-btn action-btn--more' onClick={(e) => { e.stopPropagation(); handleMore(form.id, form.title) }}>
                <Text>···</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
