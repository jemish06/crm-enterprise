import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasksApi'
import { CreateTaskDialog } from '../components/CreateTaskDialog'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { TASK_STATUSES, TASK_PRIORITIES } from '@/shared/constants'
import { formatDateTime } from '@/shared/lib/utils'
import { Calendar, AlertCircle } from 'lucide-react'

export function TasksPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter, priorityFilter],
    queryFn: () =>
      tasksApi.getTasks({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
  })

  const completeMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const tasks = data?.data || []

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = TASK_PRIORITIES.find((p) => p.value === priority)
    return (
      <Badge className={priorityConfig?.color}>
        {priorityConfig?.label || priority}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = TASK_STATUSES.find((s) => s.value === status)
    return (
      <Badge className={statusConfig?.color}>{statusConfig?.label || status}</Badge>
    )
  }

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your to-do list and activities</p>
        </div>
        <CreateTaskDialog />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter || "all"} onValueChange={(value) => setPriorityFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {TASK_PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">No tasks found</p>
              <p className="text-sm text-muted-foreground">
                Get started by creating your first task
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task: any) => (
            <Card key={task.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={(checked) => {
                      if (checked && task.status !== 'completed') {
                        completeMutation.mutate(task.id)
                      }
                    }}
                    disabled={completeMutation.isPending}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            task.status === 'completed'
                              ? 'line-through text-muted-foreground'
                              : ''
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {task.type && (
                        <span className="capitalize">{task.type.replace('-', ' ')}</span>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          {isOverdue(task.dueDate) && task.status !== 'completed' ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="text-destructive">
                                Overdue: {formatDateTime(task.dueDate)}
                              </span>
                            </>
                          ) : (
                            <>
                              <Calendar className="h-4 w-4" />
                              <span>Due: {formatDateTime(task.dueDate)}</span>
                            </>
                          )}
                        </div>
                      )}
                      {task.assignedTo && (
                        <span>Assigned to: {task.assignedTo.fullName}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
