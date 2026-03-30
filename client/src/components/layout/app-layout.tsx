import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './sidebar'
import Header from './header'
import { useAuth } from '../../hooks/use-auth'
import { useIndustry } from '../../hooks/use-industry'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { selectedIndustry, selectIndustry } = useIndustry()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Sidebar userRole={user.role} />
      <div className="ml-[240px] transition-all duration-300">
        <Header
          user={user}
          selectedIndustry={selectedIndustry}
          onSelectIndustry={selectIndustry}
          onLogout={logout}
        />
        <main className="p-6">
          <Outlet context={{ user, selectedIndustry, selectIndustry }} />
        </main>
      </div>
    </div>
  )
}
