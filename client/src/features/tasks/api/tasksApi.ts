import { apiClient } from '@/shared/lib/api'
import { ApiResponse, PaginatedResponse, Task } from '@/shared/types'

export interface CreateTaskData {
  title: string
  description?: string
  type: string
  status?: string
  priority: string
  dueDate?: string
  assignedTo?: string
  relatedTo?: {
    type: string
    id: string
  }
  reminder?: {
    enabled: boolean
    time?: string
  }
}

export const tasksApi = {
  getTasks: async (params?: {
    page?: number
    limit?: number
    status?: string
    priority?: string
    assignedTo?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.priority) queryParams.append('priority', params.priority)
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo)

    return apiClient.get<PaginatedResponse<Task[]>>(`/tasks?${queryParams.toString()}`)
  },

  getTaskById: async (id: string) => {
    return apiClient.get<ApiResponse<Task>>(`/tasks/${id}`)
  },

  createTask: async (data: CreateTaskData) => {
    return apiClient.post<ApiResponse<Task>>('/tasks', data)
  },

  updateTask: async (id: string, data: Partial<CreateTaskData>) => {
    return apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data)
  },

  deleteTask: async (id: string) => {
    return apiClient.delete(`/tasks/${id}`)
  },

  completeTask: async (id: string) => {
    return apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/complete`)
  },

  getMyTasks: async () => {
    return apiClient.get<ApiResponse<Task[]>>('/tasks/my-tasks')
  },

  getOverdueTasks: async () => {
    return apiClient.get<ApiResponse<Task[]>>('/tasks/overdue')
  },
}
