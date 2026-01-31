import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/leadsApi'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  User,
  Tag,
  Trash2,
  Calendar,
} from 'lucide-react'
import { formatDate, formatCurrency, formatDateTime } from '@/shared/lib/utils'
import { LEAD_STATUSES } from '@/shared/constants'
import { ConvertLeadDialog } from '../components/ConvertLeadDialog'
import { LogActivityDialog } from '@/features/activities/components/LogActivityDialog'
import { ActivitiesList } from '@/features/activities/components/ActivitiesList'   

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [noteContent, setNoteContent] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getLeadById(id!),
    enabled: !!id,
  })

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => leadsApi.addNote(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
      setNoteContent('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => leadsApi.deleteLead(id!),
    onSuccess: () => {
      navigate('/leads')
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    )
  }

  const lead = data?.data

  if (!lead) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Lead not found</p>
          <Button className="mt-4" onClick={() => navigate('/leads')}>
            Back to Leads
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = LEAD_STATUSES.find((s) => s.value === lead.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.fullName}</h1>
            <p className="text-muted-foreground">{lead.leadNumber}</p>
          </div>
          <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
        </div>
        <div className="flex gap-2">
          {lead.status !== 'converted' && (
            <ConvertLeadDialog 
              leadId={lead.id} 
              leadName={lead.fullName} 
            />
          )}
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to delete this lead?')) {
                deleteMutation.mutate()
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{lead.email}</p>
                    </div>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{lead.phone}</p>
                    </div>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{lead.company}</p>
                    </div>
                  </div>
                )}
                {lead.title && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">{lead.title}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{lead.source.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stage</p>
                  <p className="font-medium capitalize">{lead.stage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                  <p className="font-medium">{formatCurrency(lead.value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">
                    {lead.assignedTo ? lead.assignedTo.fullName : 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(lead.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(lead.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="notes">
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write a note about this lead..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={() => addNoteMutation.mutate(noteContent)}
                    disabled={!noteContent.trim() || addNoteMutation.isPending}
                  >
                    {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                  </Button>
                </CardContent>
              </Card>

              {lead.notes && lead.notes.length > 0 ? (
                <div className="space-y-4">
                  {lead.notes.map((note: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <p className="text-sm">{note.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{note.createdBy?.fullName}</span>
                          <span>•</span>
                          <span>{formatDateTime(note.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activities">
  <ActivitiesList relatedType="Lead" relatedId={lead.id} />
</TabsContent>


            <TabsContent value="tasks">
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Quick Actions */}
        {/* Right Column - Quick Actions */}
<div className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <LogActivityDialog 
        type="email" 
        relatedType="Lead" 
        relatedId={lead.id} 
      />
      <LogActivityDialog 
        type="call" 
        relatedType="Lead" 
        relatedId={lead.id} 
      />
      <LogActivityDialog 
        type="meeting" 
        relatedType="Lead" 
        relatedId={lead.id} 
      />
    </CardContent>
  </Card>

  {lead.tags && lead.tags.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {lead.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )}
</div>
      </div>
    </div>
  )
}
