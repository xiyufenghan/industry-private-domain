import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create industries
  const industries = await Promise.all([
    prisma.industry.upsert({
      where: { code: 'LOCAL' },
      update: {},
      create: { name: '本地生活', code: 'LOCAL', description: '本地生活服务行业' },
    }),
    prisma.industry.upsert({
      where: { code: '3C' },
      update: {},
      create: { name: '3C数码', code: '3C', description: '3C数码电子产品行业' },
    }),
    prisma.industry.upsert({
      where: { code: 'FASHION' },
      update: {},
      create: { name: '服饰', code: 'FASHION', description: '服饰鞋帽行业' },
    }),
    prisma.industry.upsert({
      where: { code: 'JEWELRY' },
      update: {},
      create: { name: '珠宝', code: 'JEWELRY', description: '珠宝饰品行业' },
    }),
  ])

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: '运营负责人',
      role: 'ADMIN',
    },
  })

  // Associate admin with all industries
  for (const industry of industries) {
    await prisma.userIndustry.upsert({
      where: { userId_industryId: { userId: admin.id, industryId: industry.id } },
      update: {},
      create: { userId: admin.id, industryId: industry.id },
    })
  }

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10)
  const manager = await prisma.user.upsert({
    where: { username: 'manager_local' },
    update: {},
    create: {
      username: 'manager_local',
      password: managerPassword,
      name: '本地行业经理',
      role: 'MANAGER',
    },
  })
  await prisma.userIndustry.upsert({
    where: { userId_industryId: { userId: manager.id, industryId: industries[0].id } },
    update: {},
    create: { userId: manager.id, industryId: industries[0].id },
  })

  // Create operator user
  const operatorPassword = await bcrypt.hash('operator123', 10)
  const operator = await prisma.user.upsert({
    where: { username: 'operator01' },
    update: {},
    create: {
      username: 'operator01',
      password: operatorPassword,
      name: '运营小张',
      role: 'OPERATOR',
    },
  })
  for (const industry of industries) {
    await prisma.userIndustry.upsert({
      where: { userId_industryId: { userId: operator.id, industryId: industry.id } },
      update: {},
      create: { userId: operator.id, industryId: industry.id },
    })
  }

  // Seed sample dashboard data for local industry (last 30 days)
  const localId = industries[0].id
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const baseFollowers = 12000 + Math.floor(Math.random() * 500)
    await prisma.dashboardData.create({
      data: {
        date,
        category: 'OA',
        industryId: localId,
        metrics: JSON.stringify({
          followers: baseFollowers,
          newFollowers: 30 + Math.floor(Math.random() * 40),
          reads: 800 + Math.floor(Math.random() * 400),
          interactions: 50 + Math.floor(Math.random() * 60),
        }),
      },
    })

    await prisma.dashboardData.create({
      data: {
        date,
        category: 'CUSTOMER',
        industryId: localId,
        metrics: JSON.stringify({
          total: 3500 + i * 5 + Math.floor(Math.random() * 20),
          newAdded: 8 + Math.floor(Math.random() * 15),
          active: 200 + Math.floor(Math.random() * 100),
        }),
      },
    })

    await prisma.dashboardData.create({
      data: {
        date,
        category: 'IDENTITY',
        industryId: localId,
        metrics: JSON.stringify({
          identified: 2800 + Math.floor(Math.random() * 100),
          unidentified: 700 + Math.floor(Math.random() * 50),
        }),
      },
    })
  }

  // Sample accounts
  const sampleAccounts = [
    { wechatId: 'wx_local_01', realName: '张明', phone: '13800001001', status: 'NORMAL' },
    { wechatId: 'wx_local_02', realName: '李芳', phone: '13800001002', status: 'NORMAL' },
    { wechatId: 'wx_3c_01', realName: '王强', phone: '13800002001', status: 'NORMAL' },
    { wechatId: 'wx_fashion_01', realName: '赵雪', phone: '13800003001', status: 'ABNORMAL' },
  ]

  for (let i = 0; i < sampleAccounts.length; i++) {
    const acc = sampleAccounts[i]
    const indIdx = i < 2 ? 0 : i === 2 ? 1 : 2
    const account = await prisma.account.create({
      data: {
        ...acc,
        industryId: industries[indIdx].id,
      },
    })
    await prisma.device.create({
      data: {
        model: ['iPhone 15', 'iPhone 14 Pro', 'Huawei P60', 'OPPO Find X6'][i],
        imei: `8600${String(i + 1).padStart(11, '0')}`,
        status: 'IN_USE',
        accountId: account.id,
      },
    })
  }

  // Sample work orders
  const orderTypes = ['公众号排版', '数据清洗', '活动资料处理', '建联需求']
  const statuses = ['PENDING', 'IN_PROGRESS', 'DONE', 'PENDING']
  const priorities = ['HIGH', 'MEDIUM', 'URGENT', 'LOW']

  for (let i = 0; i < 4; i++) {
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + (i + 1) * 3)
    await prisma.workOrder.create({
      data: {
        orderNo: `WO2026033${i + 1}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        title: `${industries[i % industries.length].name} - ${orderTypes[i]}需求`,
        description: `${industries[i % industries.length].name}行业的${orderTypes[i]}相关工作需求`,
        type: orderTypes[i],
        status: statuses[i],
        priority: priorities[i],
        deadline,
        industryId: industries[i % industries.length].id,
        creatorId: operator.id,
      },
    })
  }

  // Sample todos
  await prisma.todo.createMany({
    data: [
      { title: '整理本地行业本周公众号数据', userId: operator.id, dueDate: new Date() },
      { title: '处理3C数码行业活动资料PDF', userId: operator.id, dueDate: new Date(Date.now() + 86400000) },
      { title: '登记本双周加友识别数据', userId: operator.id, dueDate: new Date(Date.now() + 172800000) },
      { title: '检查珠宝行业推送内容打开率', userId: admin.id, dueDate: new Date() },
    ],
  })

  console.log('✅ Seed completed!')
  console.log('  管理员账号: admin / admin123')
  console.log('  经理账号: manager_local / manager123')
  console.log('  运营账号: operator01 / operator123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
