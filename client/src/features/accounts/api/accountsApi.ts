import { apiClient } from '@/shared/lib/api'
import { ApiResponse, PaginatedResponse, Account } from '@/shared/types'

export interface CreateAccountData {
  name: string
  website?: string
  industry?: string
  type: string
  employees?: number
  annualRevenue?: number
  phone?: string
  email?: string
  assignedTo?: string
}

export const accountsApi = {
  getAccounts: async (params?: {
    page?: number
    limit?: number
    search?: string
    type?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.type) queryParams.append('type', params.type)

    return apiClient.get<PaginatedResponse<Account[]>>(`/companies?${queryParams.toString()}`)
  },

  getAccountById: async (id: string) => {
    return apiClient.get<ApiResponse<Account>>(`/companies/${id}`)
  },

  createAccount: async (data: CreateAccountData) => {
    return apiClient.post<ApiResponse<Account>>('/companies', data)
  },

  updateAccount: async (id: string, data: Partial<CreateAccountData>) => {
    return apiClient.put<ApiResponse<Account>>(`/companies/${id}`, data)
  },

  deleteAccount: async (id: string) => {
    return apiClient.delete(`/companies/${id}`)
  },

  addNote: async (id: string, content: string) => {
    return apiClient.post<ApiResponse<Account>>(`/companies/${id}/notes`, { content })
  },
}
