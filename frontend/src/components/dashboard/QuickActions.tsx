import { useState } from 'react'
import { Baby, Moon, Droplets, Thermometer, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ActivityModal } from '@/components/activity/ActivityModal'

interface QuickActionsProps {
  babyId?: string
  onSaved?: () => void
}

const actions = [
  { label: 'Menyusu', type: 'feeding' as const, icon: Baby, color: 'bg-soft-pink text-pink-600' },
  { label: 'Tidur', type: 'sleep' as const, icon: Moon, color: 'bg-soft-blue text-blue-600' },
  { label: 'Popok', type: 'diaper' as const, icon: Droplets, color: 'bg-soft-green text-green-600' },
  { label: 'Suhu', type: 'temperature' as const, icon: Thermometer, color: 'bg-soft-yellow text-yellow-600' },
  { label: 'Catatan', type: 'note' as const, icon: FileText, color: 'bg-soft-purple text-purple-600' },
]

export function QuickActions({ babyId, onSaved }: QuickActionsProps) {
  const [openType, setOpenType] = useState<string | null>(null)

  return (
    <>
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Cepat Catat</h3>
        <div className="grid grid-cols-5 gap-2">
          {actions.map((action) => (
            <button
              key={action.type}
              onClick={() => setOpenType(action.type)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-bg transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-text-light text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {openType && babyId && (
        <ActivityModal
          type={openType as 'feeding' | 'sleep' | 'diaper' | 'temperature' | 'note'}
          babyId={babyId}
          open={true}
          onClose={() => setOpenType(null)}
          onSaved={onSaved}
        />
      )}
    </>
  )
}
