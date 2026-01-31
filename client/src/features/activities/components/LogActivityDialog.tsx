import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Phone, Mail, Calendar } from 'lucide-react'

interface LogActivityDialogProps {
  type: 'call' | 'email' | 'meeting'
  relatedType?: 'Lead' | 'Contact' | 'Deal' | 'Account'
  relatedId?: string
  triggerButton?: React.ReactNode
}

export function LogActivityDialog({ 
  type, 
  relatedType, 
  relatedId, 
  triggerButton 
}: LogActivityDialogProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(0)
  const [outcome, setOutcome] = useState('')
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/activities', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (relatedType && relatedId) {
        queryClient.invalidateQueries({ queryKey: ['activities', relatedType.toLowerCase(), relatedId] })
      }
      alert('Activity logged successfully!')
      setOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      alert('Failed to log activity: ' + (error?.response?.data?.message || error.message))
    }
  })

  const resetForm = () => {
    setSubject('')
    setDescription('')
    setDuration(0)
    setOutcome('')
  }

  const handleSubmit = () => {
    const data: any = {
      type,
      subject,
      description: description || undefined,
      duration: duration || undefined,
      outcome: outcome || undefined,
    }

    if (relatedType && relatedId) {
      data.relatedTo = {
        type: relatedType,
        id: relatedId,
      }
    }

    console.log('Logging activity:', data)
    createMutation.mutate(data)
  }

  const getIcon = () => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'call': return 'Log Call'
      case 'email': return 'Log Email'
      case 'meeting': return 'Schedule Meeting'
    }
  }

  const getPlaceholder = () => {
    switch (type) {
      case 'call': return 'e.g., Follow-up call about pricing'
      case 'email': return 'e.g., Sent proposal document'
      case 'meeting': return 'e.g., Product demo meeting'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="w-full">
            {getIcon()}
            <span className="ml-2">{getTitle()}</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Record this activity in the system
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder={getPlaceholder()}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this activity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Duration & Outcome */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Input
                id="outcome"
                placeholder="e.g., Scheduled demo"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {createMutation.isError && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-600">Failed to log activity</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
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
            onClick={handleSubmit}
            disabled={!subject || createMutation.isPending}
          >
            {createMutation.isPending ? 'Logging...' : 'Log Activity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
