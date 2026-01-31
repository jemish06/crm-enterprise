export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: 'admin' | 'manager' | 'staff'
  permissions: string[]
  avatar?: string
  phone?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  subdomain: string
  plan: string
  settings: CompanySettings
  createdAt: string
  updatedAt: string
}

export interface CompanySettings {
  timezone: string
  currency: string
  dateFormat: string
  timeFormat: string
  leadStages: string[]
  dealStages: string[]
  leadSources: string[]
}

export interface Lead {
  id: string
  leadNumber: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  company?: string
  title?: string
  source: string
  status: string
  stage: string
  value: number
  assignedTo?: User
  tags: string[]
  notes: Note[]
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  contactNumber: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  mobile?: string
  title?: string
  department?: string
  account?: Account
  assignedTo?: User
  tags: string[]
  notes: Note[]
  isActive: boolean
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: string
  accountNumber: string
  name: string
  website?: string
  industry?: string
  type: string
  employees?: number
  annualRevenue?: number
  phone?: string
  email?: string
  assignedTo?: User
  tags: string[]
  notes: Note[]
  isActive: boolean
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  dealNumber: string
  name: string
  value: number
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  stage: string
  pipeline: string
  account?: Account
  contact?: Contact
  assignedTo: User
  products: Product[]
  tags: string[]
  notes: Note[]
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  _id?: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  dueDate?: string
  assignedTo?: User
  relatedTo?: {
    type: string
    id: string
  }
  reminder?: {
    enabled: boolean
    time?: string
    sent?: boolean
  }
  completedAt?: string
  completedBy?: User
  createdBy: User
  tenantId: string
  createdAt: string
  updatedAt: string
}


export interface Activity {
  id: string
  type: string
  subject?: string
  description?: string
  relatedTo: {
    type: string
    id: string
  }
  duration?: number
  outcome?: string
  metadata?: Record<string, any>
  createdBy: User
  createdAt: string
}

export interface Note {
  content: string
  createdBy: User
  createdAt: string
}

export interface Product {
  name: string
  quantity: number
  price: number
  discount: number
  total: number
}

export interface PaginationMeta {
  page: number
  limit: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationMeta
}

export interface AuthResponse {
  user: User
  company: Company
  accessToken: string
}

export interface DashboardOverview {
  overview: {
    totalLeads: number
    totalContacts: number
    totalDeals: number
    totalTasks: number
    myPendingTasks: number
    overdueTasksCount: number
  }
  trends: {
    leads: {
      current: number
      previous: number
      growth: number
    }
    deals: {
      current: number
      previous: number
      growth: number
    }
    wonDeals: {
      current: number
      previous: number
      growth: number
    }
  }
}
