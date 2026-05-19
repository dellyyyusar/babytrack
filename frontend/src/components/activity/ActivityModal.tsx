import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeedingForm } from './FeedingForm'
import { SleepForm } from './SleepForm'
import { DiaperForm } from './DiaperForm'
import { TemperatureForm } from './TemperatureForm'
import { NoteForm } from './NoteForm'

interface ActivityModalProps {
  type: 'feeding' | 'sleep' | 'diaper' | 'temperature' | 'note'
  babyId: string
  open: boolean
  onClose: () => void
  activity?: any
  onSaved?: () => void
}

const titles: Record<string, string> = {
  feeding: 'Catat Menyusu',
  sleep: 'Catat Tidur',
  diaper: 'Catat Popok',
  temperature: 'Catat Suhu Tubuh',
  note: 'Buat Catatan',
}

export function ActivityModal({ type, babyId, open, onClose, activity, onSaved }: ActivityModalProps) {
  const handleSaved = () => {
    onClose()
    onSaved?.()
  }

  const renderForm = () => {
    const formProps = {
      babyId,
      activity,
      onSaved: handleSaved,
      onCancel: onClose,
    }

    switch (type) {
      case 'feeding':
        return <FeedingForm {...formProps} />
      case 'sleep':
        return <SleepForm {...formProps} />
      case 'diaper':
        return <DiaperForm {...formProps} />
      case 'temperature':
        return <TemperatureForm {...formProps} />
      case 'note':
        return <NoteForm {...formProps} />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titles[type] || 'Catat Aktivitas'}</DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  )
}
