import { Baby, Moon, Droplets } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatsCardsProps {
  feedingCount: number
  sleepMinutes: number
  diaperCount: number
  feedingMinutes: number
}

export function StatsCards({ feedingCount, sleepMinutes, diaperCount, feedingMinutes }: StatsCardsProps) {
  const stats = [
    {
      label: 'Menyusu',
      value: `${feedingCount}x`,
      sub: `${feedingMinutes} mnt`,
      icon: Baby,
      bg: 'bg-soft-pink',
      iconColor: 'text-pink-500',
    },
    {
      label: 'Tidur',
      value: `${Math.round(sleepMinutes / 60)}j ${sleepMinutes % 60}m`,
      icon: Moon,
      bg: 'bg-soft-blue',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Popok',
      value: `${diaperCount}x`,
      icon: Droplets,
      bg: 'bg-soft-green',
      iconColor: 'text-green-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
            {stat.sub && <p className="text-xs text-muted">{stat.sub}</p>}
          </div>
        </Card>
      ))}
    </div>
  )
}
