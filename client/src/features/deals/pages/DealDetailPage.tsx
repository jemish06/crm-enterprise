import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealsApi } from '../api/dealsApi'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  User,
  Building2,
  Trash2,
} from 'lucide-react'
import { DEAL_STAGES } from '@/shared/constants'
import { formatDate, formatCurrency, formatDateTime } from '@/shared/lib/utils'

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [noteContent, setNoteContent] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => dealsApi.getDealById(id!),
    enabled: !!id,
  })

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => dealsApi.addNote(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] })
      setNoteContent('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => dealsApi.deleteDeal(id!),
    onSuccess: () => {
      navigate('/deals')
    },
  })

  const updateStageMutation = useMutation({
    mutationFn: (stage: string) => dealsApi.updateStage(id!, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading deal...</p>
        </div>
      </div>
    )
  }

  const deal = data?.data

  if (!deal) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Deal not found</p>
          <Button className="mt-4" onClick={() => navigate('/deals')}>
            Back to Deals
          </Button>
        </div>
      </div>
    )
  }

  const stageConfig = DEAL_STAGES.find((s) => s.value === deal.stage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/deals')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{deal.name}</h1>
            <p className="text-muted-foreground">{deal.dealNumber}</p>
          </div>
          <Badge className={stageConfig?.color}>{stageConfig?.label}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to delete this deal?')) {
                deleteMutation.mutate()
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-bold">{formatCurrency(deal.value)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Probability</p>
                <p className="text-2xl font-bold">{deal.probability}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weighted Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency((deal.value * deal.probability) / 100)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expected Close</p>
                <p className="text-sm font-bold">
                  {deal.expectedCloseDate
                    ? formatDate(deal.expectedCloseDate)
                    : 'Not set'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account</p>
                    <p className="font-medium">
                      {deal.account ? deal.account.name : 'No account'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">
                      {deal.contact ? deal.contact.fullName : 'No contact'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline</p>
                  <p className="font-medium capitalize">{deal.pipeline}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium">{deal.assignedTo?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(deal.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(deal.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          {deal.products && deal.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deal.products.map((product: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {product.quantity} × {formatCurrency(product.price)}
                          {product.discount > 0 && ` (-${product.discount}%)`}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(product.total)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                    placeholder="Write a note about this deal..."
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

              {deal.notes && deal.notes.length > 0 ? (
                <div className="space-y-4">
                  {deal.notes.map((note: any, index: number) => (
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
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No activities yet</p>
                </CardContent>
              </Card>
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

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEAL_STAGES.map((stage) => (
                <Button
                  key={stage.value}
                  variant={deal.stage === stage.value ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => updateStageMutation.mutate(stage.value)}
                  disabled={updateStageMutation.isPending}
                >
                  {stage.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
