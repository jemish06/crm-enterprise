import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Company } from '@/shared/types'

interface AuthState {
  user: User | null
  company: Company | null
  isAuthenticated: boolean
  accessToken: string | null
  setAuth: (user: User, company: Company, accessToken: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      isAuthenticated: false,
      accessToken: null,

      setAuth: (user, company, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({
          user,
          company,
          isAuthenticated: true,
          accessToken,
        })
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        set({
          user: null,
          company: null,
          isAuthenticated: false,
          accessToken: null,
        })
      },

      updateUser: (user) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
