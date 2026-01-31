import { apiClient } from '@/shared/lib/api'
import { ApiResponse, PaginatedResponse, Deal } from '@/shared/types'

export interface CreateDealData {
  name: string
  value: number
  probability: number
  expectedCloseDate?: string
  stage: string
  pipeline?: string
  accountId?: string
  contactId?: string
  assignedTo?: string
  products?: Array<{
    name: string
    quantity: number
    price: number
    discount: number
  }>
}

export const dealsApi = {
  getDeals: async (params?: {
    page?: number
    limit?: number
    search?: string
    stage?: string
    pipeline?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.stage) queryParams.append('stage', params.stage)
    if (params?.pipeline) queryParams.append('pipeline', params.pipeline)

    return apiClient.get<PaginatedResponse<Deal[]>>(`/deals?${queryParams.toString()}`)
  },

  getDealById: async (id: string) => {
    return apiClient.get<ApiResponse<Deal>>(`/deals/${id}`)
  },

  createDeal: async (data: CreateDealData) => {
    return apiClient.post<ApiResponse<Deal>>('/deals', data)
  },

  updateDeal: async (id: string, data: Partial<CreateDealData>) => {
    return apiClient.put<ApiResponse<Deal>>(`/deals/${id}`, data)
  },

  deleteDeal: async (id: string) => {
    return apiClient.delete(`/deals/${id}`)
  },

  addNote: async (id: string, content: string) => {
    return apiClient.post<ApiResponse<Deal>>(`/deals/${id}/notes`, { content })
  },

  updateStage: async (id: string, stage: string) => {
    return apiClient.patch<ApiResponse<Deal>>(`/deals/${id}/stage`, { stage })
  },
}
