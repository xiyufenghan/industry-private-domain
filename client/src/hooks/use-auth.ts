import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import { Role } from '../lib/constants'

export interface User {
  id: string
  username: string
  name: string
  role: Role
  industries: Array<{ id: string; name: string; code: string }>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    const res: any = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    setLoading(false)
    return res.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }, [])

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    const res: any = await api.get('/auth/me')
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && !user) {
      fetchUser()
    }
  }, [])

  return { user, loading, login, logout, fetchUser }
}
