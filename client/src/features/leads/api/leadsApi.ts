import { apiClient } from '@/shared/lib/api'
import { ApiResponse, PaginatedResponse, Lead } from '@/shared/types'

export interface CreateLeadData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  title?: string
  source: string
  status?: string
  value?: number
  assignedTo?: string
}

// ADD THIS NEW INTERFACE
export interface ConvertLeadData {
  createContact: boolean
  createDeal: boolean
  dealName?: string
  dealValue?: number
  dealStage?: string
}

export const leadsApi = {
  getLeads: async (params?: {
    page?: number
    limit?: number
    status?: string
    source?: string
    search?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.source) queryParams.append('source', params.source)
    if (params?.search) queryParams.append('search', params.search)

    return apiClient.get<PaginatedResponse<Lead[]>>(`/leads?${queryParams.toString()}`)
  },

  getLeadById: async (id: string) => {
    return apiClient.get<ApiResponse<Lead>>(`/leads/${id}`)
  },

  createLead: async (data: CreateLeadData) => {
    return apiClient.post<ApiResponse<Lead>>('/leads', data)
  },

  updateLead: async (id: string, data: Partial<CreateLeadData>) => {
    return apiClient.put<ApiResponse<Lead>>(`/leads/${id}`, data)
  },

  deleteLead: async (id: string) => {
    return apiClient.delete(`/leads/${id}`)
  },

  addNote: async (id: string, content: string) => {
    return apiClient.post<ApiResponse<Lead>>(`/leads/${id}/notes`, { content })
  },

  // UPDATE THIS FUNCTION - make it accept ConvertLeadData
  convertLead: async (id: string, data: ConvertLeadData) => {
    return apiClient.post(`/leads/${id}/convert`, data)
  },
}
