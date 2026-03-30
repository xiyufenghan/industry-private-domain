import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { Role, RoleLabel } from '../../lib/constants'
import type { User } from '../../hooks/use-auth'
import type { Industry } from '../../hooks/use-industry'

interface HeaderProps {
  user: User
  selectedIndustry: string
  onSelectIndustry: (id: string) => void
  onLogout: () => void
}

export default function Header({ user, selectedIndustry, onSelectIndustry, onLogout }: HeaderProps) {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    api.get('/industries').then((res: any) => setIndustries(res.data))
  }, [])

  const currentIndustry = selectedIndustry === 'all'
    ? '全部行业'
    : industries.find((i) => i.id === selectedIndustry)?.name || '全部行业'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">私域运营管理</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Industry Selector */}
        <div className="relative">
          <button
            onClick={() => { setShowDropdown(!showDropdown); setShowUserMenu(false) }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors cursor-pointer"
          >
            <span>{currentIndustry}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in z-50">
              <button
                onClick={() => { onSelectIndustry('all'); setShowDropdown(false) }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
              >
                全部行业
              </button>
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => { onSelectIndustry(ind.id); setShowDropdown(false) }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {ind.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowDropdown(false) }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <span className="text-white text-sm font-medium">{user.name[0]}</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-400">{RoleLabel[user.role]}</p>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in z-50">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
