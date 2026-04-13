import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, BarChart3, Briefcase, Settings, FileText,
  PenTool, ChevronLeft, ChevronRight, Megaphone, FileSpreadsheet
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import { Role } from '../../lib/constants'

interface SidebarProps {
  userRole: Role
}

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '工作台首页', roles: [Role.ADMIN, Role.MANAGER, Role.OPERATOR] },
  { path: '/accounts', icon: Users, label: '账号管理', roles: [Role.ADMIN, Role.OPERATOR] },
  { path: '/promotions', icon: Megaphone, label: '宣推任务', roles: [Role.ADMIN, Role.OPERATOR] },
  { path: '/promotions/report', icon: FileSpreadsheet, label: '宣发报表', roles: [Role.ADMIN, Role.MANAGER] },
  { path: '/dashboard', icon: BarChart3, label: '数据看板', roles: [Role.ADMIN, Role.MANAGER] },
  { path: '/dashboard/import', icon: FileText, label: '数据导入', roles: [Role.ADMIN, Role.OPERATOR] },
  { path: '/workspace/orders', icon: Briefcase, label: '需求工单', roles: [Role.ADMIN, Role.OPERATOR] },
  { path: '/workspace/editor', icon: PenTool, label: '排版编辑器', roles: [Role.ADMIN, Role.OPERATOR] },
  { path: '/workspace/copywriter', icon: FileText, label: '文案生成', roles: [Role.ADMIN, Role.OPERATOR] },
  { path: '/settings', icon: Settings, label: '系统设置', roles: [Role.ADMIN] },
]

export default function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const filtered = menuItems.filter((item) => item.roles.includes(userRole))

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 shadow-sm',
      collapsed ? 'w-[68px]' : 'w-[240px]'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">私</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-semibold text-[15px] text-gray-900 whitespace-nowrap">行业私域工作间</h1>
              <p className="text-[10px] text-gray-400 whitespace-nowrap">腾讯广告市场团队</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filtered.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
