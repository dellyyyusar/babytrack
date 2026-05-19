import { create } from 'zustand'
import { clearTokens, setTokens, getAccessToken, api } from '@/lib/api'

interface User {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!getAccessToken(),
  isLoading: true,
  login: async (email, password) => {
    const data = await api<{ user: User; access_token: string; refresh_token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
    setTokens(data.access_token, data.refresh_token)
    set({ user: data.user, isAuthenticated: true })
  },
  register: async (fullName, email, password) => {
    const data = await api<{ user: User; access_token: string; refresh_token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName, email, password }),
      }
    )
    setTokens(data.access_token, data.refresh_token)
    set({ user: data.user, isAuthenticated: true })
  },
  logout: () => {
    api('/auth/logout', { method: 'POST' }).catch(() => {})
    clearTokens()
    set({ user: null, isAuthenticated: false })
  },
  checkAuth: async () => {
    try {
      const data = await api<{ user: User }>('/auth/me')
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch {
      clearTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
