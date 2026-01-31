import { apiClient } from '@/shared/lib/api'
import { ApiResponse, AuthResponse } from '@/shared/types'

export interface RegisterData {
  companyName: string
  subdomain: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginData {
  email: string
  password: string
  subdomain: string
}

export const authApi = {
  register: async (data: RegisterData) => {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
  },

  login: async (data: LoginData) => {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
  },

  logout: async () => {
    return apiClient.post('/auth/logout')
  },

  getCurrentUser: async () => {
    return apiClient.get<ApiResponse<{ user: any; company: any }>>('/auth/me')
  },

  forgotPassword: async (email: string, subdomain: string) => {
    return apiClient.post('/auth/forgot-password', { email, subdomain })
  },

  resetPassword: async (token: string, password: string, subdomain: string) => {
    return apiClient.post('/auth/reset-password', { token, password, subdomain })
  },
}
