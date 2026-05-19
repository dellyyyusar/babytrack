import { Baby, Moon, Droplets } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Activity } from '@/features/activities/use-activities'
import { formatTime } from '@/lib/utils'

interface LastActivityCardsProps {
  lastFeeding: Activity | null
  lastSleep: Activity | null
  lastDiaper: Activity | null
}

export function LastActivityCards({ lastFeeding, lastSleep, lastDiaper }: LastActivityCardsProps) {
  const items = [
    {
      label: 'Terakhir Menyusu',
      time: lastFeeding ? formatTime(lastFeeding.started_at) : 'Belum ada',
      icon: Baby,
      bg: 'bg-soft-pink',
      active: !!lastFeeding,
    },
    {
      label: 'Terakhir Tidur',
      time: lastSleep ? formatTime(lastSleep.started_at) : 'Belum ada',
      icon: Moon,
      bg: 'bg-soft-blue',
      active: !!lastSleep,
    },
    {
      label: 'Terakhir Popok',
      time: lastDiaper ? formatTime(lastDiaper.started_at) : 'Belum ada',
      icon: Droplets,
      bg: 'bg-soft-green',
      active: !!lastDiaper,
    },
  ]

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Terakhir</h3>
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-2`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted">{item.label}</p>
            <p className={`text-sm font-semibold ${item.active ? '' : 'text-muted'}`}>
              {item.time}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
