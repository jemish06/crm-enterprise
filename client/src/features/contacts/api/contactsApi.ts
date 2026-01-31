import { apiClient } from '@/shared/lib/api'
import { ApiResponse, PaginatedResponse, Contact } from '@/shared/types'

export interface CreateContactData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  mobile?: string
  title?: string
  department?: string
  accountId?: string
  assignedTo?: string
}

export const contactsApi = {
  getContacts: async (params?: {
    page?: number
    limit?: number
    search?: string
    accountId?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.accountId) queryParams.append('accountId', params.accountId)

    return apiClient.get<PaginatedResponse<Contact[]>>(`/contacts?${queryParams.toString()}`)
  },

  getContactById: async (id: string) => {
    return apiClient.get<ApiResponse<Contact>>(`/contacts/${id}`)
  },

  createContact: async (data: CreateContactData) => {
    return apiClient.post<ApiResponse<Contact>>('/contacts', data)
  },

  updateContact: async (id: string, data: Partial<CreateContactData>) => {
    return apiClient.put<ApiResponse<Contact>>(`/contacts/${id}`, data)
  },

  deleteContact: async (id: string) => {
    return apiClient.delete(`/contacts/${id}`)
  },

  addNote: async (id: string, content: string) => {
    return apiClient.post<ApiResponse<Contact>>(`/contacts/${id}/notes`, { content })
  },
}
