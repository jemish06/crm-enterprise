import { apiClient } from '@/shared/lib/api'
import { ApiResponse, PaginatedResponse, Activity } from '@/shared/types'

export const activitiesApi = {
  getActivities: async (params?: {
    page?: number
    limit?: number
    type?: string
    relatedType?: string
    relatedId?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.relatedType) queryParams.append('relatedType', params.relatedType)
    if (params?.relatedId) queryParams.append('relatedId', params.relatedId)

    return apiClient.get<PaginatedResponse<Activity[]>>(
      `/activities?${queryParams.toString()}`
    )
  },

  getActivityById: async (id: string) => {
    return apiClient.get<ApiResponse<Activity>>(`/activities/${id}`)
  },

  getMyActivities: async () => {
    return apiClient.get<ApiResponse<Activity[]>>('/activities/my-activities')
  },
}
