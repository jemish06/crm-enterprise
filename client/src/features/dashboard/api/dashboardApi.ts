import { apiClient } from '@/shared/lib/api'
import { ApiResponse, DashboardOverview, Activity, Task } from '@/shared/types'

export const dashboardApi = {
  getOverview: async () => {
    return apiClient.get<ApiResponse<DashboardOverview>>('/dashboard/overview')
  },

  getSalesMetrics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return apiClient.get(`/dashboard/sales-metrics?${params.toString()}`)
  },

  getLeadMetrics: async () => {
    return apiClient.get('/dashboard/lead-metrics')
  },

  getRecentActivities: async (limit = 10) => {
    return apiClient.get<ApiResponse<Activity[]>>(`/dashboard/recent-activities?limit=${limit}`)
  },

  getUpcomingTasks: async (days = 7) => {
    return apiClient.get<ApiResponse<Task[]>>(`/dashboard/upcoming-tasks?days=${days}`)
  },
}
