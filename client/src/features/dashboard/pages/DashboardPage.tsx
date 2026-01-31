import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboardApi'
import { StatCard } from '../components/StatCard'
import {
  Users,
  UserPlus,
  Briefcase,
  CheckSquare,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Activity, Task } from '@/shared/types'

export function DashboardPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.getOverview(),
  })

  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => dashboardApi.getRecentActivities(5),
  })

  const { data: upcomingTasks } = useQuery({
    queryKey: ['upcoming-tasks'],
    queryFn: () => dashboardApi.getUpcomingTasks(7),
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = overview?.data
  const activities = recentActivities?.data || []
  const tasks = upcomingTasks?.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={stats?.overview.totalLeads || 0}
          icon={UserPlus}
          trend={{
            value: stats?.trends.leads.growth || 0,
            isPositive: (stats?.trends.leads.growth || 0) >= 0,
          }}
        />
        <StatCard
          title="Total Contacts"
          value={stats?.overview.totalContacts || 0}
          icon={Users}
        />
        <StatCard
          title="Active Deals"
          value={stats?.overview.totalDeals || 0}
          icon={Briefcase}
          trend={{
            value: stats?.trends.deals.growth || 0,
            isPositive: (stats?.trends.deals.growth || 0) >= 0,
          }}
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.overview.myPendingTasks || 0}
          icon={CheckSquare}
          description={`${stats?.overview.overdueTasksCount || 0} overdue`}
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity: Activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.subject || activity.type}</p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activities</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task: Task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                      <CheckSquare className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming tasks</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">New Leads This Month</p>
              <p className="text-2xl font-bold">{stats?.trends.leads.current || 0}</p>
              <p className="text-xs text-muted-foreground">
                <span className={(stats?.trends.leads.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {(stats?.trends.leads.growth ?? 0) >= 0 ? '+' : ''}{stats?.trends.leads.growth ?? 0}%
                </span>{' '}
                vs last month
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">New Deals This Month</p>
              <p className="text-2xl font-bold">{stats?.trends.deals.current || 0}</p>
              <p className="text-xs text-muted-foreground">
                <span className={(stats?.trends.deals.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {(stats?.trends.deals.growth ?? 0) >= 0 ? '+' : ''}{stats?.trends.deals.growth ?? 0}%
                </span>{' '}
                vs last month
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Won Deals This Month</p>
              <p className="text-2xl font-bold">{stats?.trends.wonDeals.current || 0}</p>
              <p className="text-xs text-muted-foreground">
                <span className={(stats?.trends.wonDeals.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {(stats?.trends.wonDeals.growth ?? 0) >= 0 ? '+' : ''}{stats?.trends.wonDeals.growth ?? 0}%
                </span>{' '}
                vs last month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
