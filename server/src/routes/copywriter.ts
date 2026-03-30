import { Router } from 'express'
import { success } from '../utils/response'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  const { industry, type, keywords, tone } = req.body

  const templates: Record<string, string[]> = {
    '本地生活': [
      `🏡 【限时福利】${keywords || '本地好店'}推荐！探索身边的宝藏生活方式，${tone === 'formal' ? '诚邀您体验' : '快来打卡'}！\n\n✨ 精选优质商户，为您的品质生活保驾护航\n📍 就在您身边，触手可及的美好\n\n#本地生活 #品质推荐`,
      `📣 ${keywords || '本地生活'}焕新计划启动！\n\n🎯 精准匹配您的生活需求\n💡 专属优惠等您来解锁\n🤝 连接优质服务商\n\n立即了解详情 →`,
    ],
    '3C数码': [
      `🚀 【新品速递】${keywords || '数码好物'}强势来袭！科技改变生活，${tone === 'formal' ? '为您带来全新体验' : '黑科技玩家必看'}！\n\n💎 旗舰性能，匠心品质\n⚡ 限时优惠，先到先得\n\n#3C数码 #科技生活`,
      `🔥 ${keywords || '数码'}爆款清单 TOP5\n\n1️⃣ 性能之王 - 畅玩无界\n2️⃣ 颜值担当 - 时尚出圈\n3️⃣ 性价比王 - 品质之选\n\n🛒 点击了解更多 →`,
    ],
    '服饰': [
      `👗 【穿搭灵感】${keywords || '时尚新品'}上新！${tone === 'formal' ? '引领潮流风尚' : '穿出你的范儿'}！\n\n🌟 设计师联名系列\n🎨 多色可选，百搭必备\n💝 新品首发特惠\n\n#时尚穿搭 #新品推荐`,
      `✨ ${keywords || '服饰'}穿搭公式来了！\n\n春季必备 = 基础款 + 亮色点缀 + 配饰加分\n\n📸 跟着穿，回头率翻倍\n🛍️ 同款直达 →`,
    ],
    '珠宝': [
      `💎 【臻品鉴赏】${keywords || '珠宝'}系列新作绽放！${tone === 'formal' ? '匠心独运，璀璨夺目' : '闪耀你的每一刻'}！\n\n🌹 每一件都值得珍藏\n✨ 限量发售，尊享品质\n💌 预约品鉴\n\n#珠宝 #奢华生活`,
      `🌟 ${keywords || '珠宝'}甄选指南\n\n💍 投资首选：经典款保值\n💎 送礼必看：定制刻字服务\n✨ 日常佩戴：轻奢百搭系列\n\n📞 专属顾问一对一服务 →`,
    ],
  }

  const industryTemplates = templates[industry] || templates['本地生活']
  const results = industryTemplates.map((t, i) => ({ id: i + 1, content: t, type: type || '推广文案' }))

  success(res, results)
})

export default router
