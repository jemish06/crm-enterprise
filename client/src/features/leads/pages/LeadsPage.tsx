import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { leadsApi } from '../api/leadsApi'
import { CreateLeadDialog } from '../components/CreateLeadDialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { LEAD_STATUSES, LEAD_SOURCES } from '@/shared/constants'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, formatCurrency } from '@/shared/lib/utils'

export function LeadsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')


  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, search, statusFilter, sourceFilter],
    queryFn: () =>
      leadsApi.getLeads({
        page,
        limit: 20,
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
source: sourceFilter === 'all' ? undefined : sourceFilter,

      }),
  })

  const leads = data?.data || []
  const pagination = data?.pagination

  const getStatusBadge = (status: string) => {
    const statusConfig = LEAD_STATUSES.find((s) => s.value === status)
    return (
      <Badge className={statusConfig?.color}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <CreateLeadDialog />
      </div>

      {/* Filters */}
      {/* Filters */}
<div className="flex gap-4">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      placeholder="Search leads by name, email, company..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="pl-10"
    />
  </div>
  <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="All Statuses" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Statuses</SelectItem>
      {LEAD_STATUSES.map((status) => (
        <SelectItem key={status.value} value={status.value}>
          {status.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <Select value={sourceFilter || "all"} onValueChange={(value) => setSourceFilter(value === "all" ? "" : value)}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="All Sources" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Sources</SelectItem>
      {LEAD_SOURCES.map((source) => (
        <SelectItem key={source.value} value={source.value}>
          {source.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading leads...</p>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">No leads found</p>
              <p className="text-sm text-muted-foreground">
                Get started by creating your first lead
              </p>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead: any) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.fullName}</p>
                        <p className="text-sm text-muted-foreground">{lead.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.company || '-'}</TableCell>
                    <TableCell>{lead.email || '-'}</TableCell>
                    <TableCell>{lead.phone || '-'}</TableCell>
                    <TableCell className="capitalize">
                      {lead.source.replace('-', ' ')}
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{formatCurrency(lead.value)}</TableCell>
                    <TableCell>
                      {lead.assignedTo ? lead.assignedTo.fullName : '-'}
                    </TableCell>
                    <TableCell>{formatDate(lead.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalItems)}{' '}
                  of {pagination.totalItems} results
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
    </div>
  )
}
