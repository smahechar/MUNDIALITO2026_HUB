import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '@/services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession())

  const user            = session?.user  ?? null
  const isAuthenticated = !!session
  const isAdmin         = user?.role === 'admin'

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials)
    setSession(result)
    return result
  }, [])

  const register = useCallback(async (fields) => {
    const result = await authService.register(fields)
    setSession(result)
    return result
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setSession(null)
  }, [])

  const updateUser = useCallback(async (patch) => {
    const updated = await authService.updateProfile(patch)
    setSession(prev => ({ ...prev, user: updated }))
    return updated
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
