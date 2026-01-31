import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { leadsApi } from '../api/leadsApi'
import { apiClient } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { RefreshCw } from 'lucide-react'
import { DEAL_STAGES } from '@/shared/constants'

interface ConvertLeadDialogProps {
  leadId: string
  leadName: string
}

export function ConvertLeadDialog({ leadId, leadName }: ConvertLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [createDeal, setCreateDeal] = useState(false)
  const [dealName, setDealName] = useState('')
  const [dealValue, setDealValue] = useState(0)
  const [probability, setProbability] = useState(10)
  const [dealStage, setDealStage] = useState('prospecting')
  const [expectedCloseDate, setExpectedCloseDate] = useState('')
  const [pipeline, setPipeline] = useState('sales')
  const [assignedTo, setAssignedTo] = useState('')
  
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Fetch users for assignment dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users'),
    enabled: open,
  })

  // Fetch accounts for account dropdown
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiClient.get('/accounts'),
    enabled: open && createDeal,
  })

  const convertMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('Converting lead with data:', data)
      return leadsApi.convertLead(leadId, data)
    },
    onSuccess: (response) => {
      console.log('Conversion SUCCESS:', response)
      alert('Lead converted successfully!')
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['deals'] })
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
      setOpen(false)
      resetForm()
      navigate('/contacts')
    },
    onError: (error: any) => {
      console.error('Conversion ERROR:', error)
      alert('Failed to convert lead: ' + (error?.response?.data?.message || error.message))
    }
  })

  const resetForm = () => {
    setCreateDeal(false)
    setDealName('')
    setDealValue(0)
    setProbability(10)
    setDealStage('prospecting')
    setExpectedCloseDate('')
    setPipeline('sales')
    setAssignedTo('')
  }

  const handleConvert = () => {
    console.log('Convert button clicked!')

    const data: any = {
      createContact: true,
      createDeal: createDeal,
    }

    if (createDeal) {
      data.dealName = dealName
      data.dealValue = dealValue
      data.dealStage = dealStage
      data.probability = probability
      data.expectedCloseDate = expectedCloseDate || undefined
      data.pipeline = pipeline
      data.assignedTo = assignedTo || undefined
    }

    console.log('Sending conversion data:', data)
    convertMutation.mutate(data)
  }

  const users = usersData?.data?.data || []
  const accounts = accountsData?.data?.data || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default"
          onClick={() => setOpen(true)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Convert Lead
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Lead to Contact</DialogTitle>
          <DialogDescription>
            Convert {leadName} to a contact and optionally create a deal
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Create Contact - Always Checked */}
          <div className="flex items-center space-x-2">
            <Checkbox id="createContact" checked disabled />
            <Label htmlFor="createContact" className="font-normal">
              Create Contact (Required)
            </Label>
          </div>

          {/* Create Deal - Optional */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="createDeal"
              checked={createDeal}
              onCheckedChange={(checked) => {
                setCreateDeal(checked as boolean)
              }}
            />
            <Label htmlFor="createDeal" className="font-normal">
              Also Create Deal
            </Label>
          </div>

          {/* Deal Fields - Show only if createDeal is true */}
          {createDeal && (
            <div className="space-y-4 border-l-2 border-primary pl-4 ml-6">
              {/* Deal Name */}
              <div className="space-y-2">
                <Label htmlFor="dealName">
                  Deal Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dealName"
                  placeholder="e.g., Enterprise License - Acme Corp"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                />
              </div>

              {/* Deal Value & Probability */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealValue">
                    Deal Value <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dealValue"
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={dealValue}
                    onChange={(e) => setDealValue(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Stage */}
              <div className="space-y-2">
                <Label htmlFor="stage">
                  Stage <span className="text-red-500">*</span>
                </Label>
                <Select value={dealStage} onValueChange={setDealStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expected Close Date */}
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                />
              </div>

              {/* Pipeline */}
              <div className="space-y-2">
                <Label htmlFor="pipeline">Pipeline</Label>
                <Input
                  id="pipeline"
                  placeholder="sales"
                  value={pipeline}
                  onChange={(e) => setPipeline(e.target.value)}
                />
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName || `${user.firstName} ${user.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {convertMutation.isError && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-600">
              Failed to convert lead. Please try again.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setOpen(false)
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConvert}
            disabled={convertMutation.isPending || (createDeal && !dealName)}
          >
            {convertMutation.isPending ? 'Converting...' : 'Convert Lead'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
