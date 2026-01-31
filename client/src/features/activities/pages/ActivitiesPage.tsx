import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { activitiesApi } from '../api/activitiesApi'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { formatDateTime } from '@/shared/lib/utils'
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const ACTIVITY_TYPES = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
  { value: 'note', label: 'Note', icon: FileText },
  { value: 'status_change', label: 'Status Change', icon: TrendingUp },
  { value: 'stage_change', label: 'Stage Change', icon: TrendingUp },
]

export function ActivitiesPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['activities', page, typeFilter],
    queryFn: () =>
      activitiesApi.getActivities({
        page,
        limit: 20,
        type: typeFilter || undefined,
      }),
  })

  const activities = data?.data || []
  const pagination = data?.pagination

  const getActivityIcon = (type: string) => {
    const activityType = ACTIVITY_TYPES.find((t) => t.value === type)
    const Icon = activityType?.icon || FileText
    return <Icon className="h-5 w-5" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">
            Track all interactions and changes across your CRM
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Activity Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity Types</SelectItem>
            {ACTIVITY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activities Timeline */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading activities...</p>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">No activities found</p>
              <p className="text-sm text-muted-foreground">
                Activities will appear here as you interact with your CRM
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <Card key={activity.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">
                            {activity.subject || activity.type}
                          </h3>
                          {activity.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{activity.createdBy?.fullName}</span>
                        <span>•</span>
                        <span>{formatDateTime(activity.createdAt)}</span>
                        {activity.relatedTo && (
                          <>
                            <span>•</span>
                            <span className="capitalize">
                              {activity.relatedTo.type}
                            </span>
                          </>
                        )}
                        {activity.duration && (
                          <>
                            <span>•</span>
                            <span>{activity.duration} minutes</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
