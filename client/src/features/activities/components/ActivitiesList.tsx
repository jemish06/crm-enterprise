import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/lib/api'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Phone, Mail, Calendar, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/utils'

interface ActivitiesListProps {
  relatedType?: string
  relatedId?: string
}

export function ActivitiesList({ relatedType, relatedId }: ActivitiesListProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['activities', relatedType?.toLowerCase(), relatedId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (relatedType) params.append('relatedType', relatedType)
      if (relatedId) params.append('relatedId', relatedId)
      return apiClient.get(`/activities?${params.toString()}`)
    },
    enabled: !!relatedType && !!relatedId,
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading activities...</p>
        </CardContent>
      </Card>
    )
  }

  const activities = data?.data?.data || []

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No activities yet</p>
        </CardContent>
      </Card>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      case 'lead_created': return <RefreshCw className="h-4 w-4" />
      case 'lead_converted': return <CheckCircle className="h-4 w-4" />
      case 'contact_created': return <CheckCircle className="h-4 w-4" />
      case 'deal_created': return <CheckCircle className="h-4 w-4" />
      case 'deal_won': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'deal_lost': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800'
      case 'email': return 'bg-purple-100 text-purple-800'
      case 'meeting': return 'bg-green-100 text-green-800'
      case 'lead_converted': return 'bg-yellow-100 text-yellow-800'
      case 'deal_won': return 'bg-green-100 text-green-800'
      case 'deal_lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: any) => (
        <Card key={activity.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{activity.subject}</p>
                    {activity.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{activity.createdBy?.fullName || 'System'}</span>
                  <span>•</span>
                  <span>{formatDateTime(activity.createdAt)}</span>
                  {activity.duration && (
                    <>
                      <span>•</span>
                      <span>{activity.duration} min</span>
                    </>
                  )}
                  {activity.outcome && (
                    <>
                      <span>•</span>
                      <span className="font-medium">{activity.outcome}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
