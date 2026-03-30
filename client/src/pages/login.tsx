import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = await login(username, password).catch((err: any) => {
      setError(err.response?.data?.error || '登录失败')
      return null
    })
    if (user) navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand area */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0052D9] to-[#0034B5] relative overflow-hidden items-center justify-center">
        {/* Geometric decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-white/5 rounded-2xl rotate-45" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-lg rotate-12" />
          <div className="absolute bottom-20 left-40 w-20 h-20 bg-white/10 rounded-full" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <span className="text-white text-3xl font-bold">私</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">行业私域工作间</h1>
          <p className="text-xl text-white/80 mb-2">腾讯广告市场团队</p>
          <p className="text-sm text-white/60 max-w-md mx-auto mt-6 leading-relaxed">
            统一管理私域账号资产、行业数据看板与运营工作流，提升多行业私域运营效率
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0052D9] to-[#0034B5] flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">私</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">行业私域工作间</h1>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-gray-900">欢迎回来</h2>
            <p className="text-gray-500 mt-2">请登录您的账号以继续</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 animate-fade-in">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? '登录中...' : '登 录'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              默认账号：admin / admin123 · manager_local / manager123 · operator01 / operator123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
