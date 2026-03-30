import { Link } from 'react-router-dom'
import { Building2, Users, Settings } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'

const settingItems = [
  { path: '/settings/industries', icon: Building2, label: '行业管理', desc: '新增、编辑、停用行业分类' },
  { path: '/settings/users', icon: Users, label: '用户管理', desc: '管理团队成员，分配角色和行业' },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
        {settingItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
