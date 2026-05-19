import { Baby, Moon, Droplets, Thermometer, FileText } from 'lucide-react'

interface EmptyStateProps {
  onAddActivity: () => void
}

export function EmptyState({ onAddActivity }: EmptyStateProps) {
  const items = [
    { icon: Baby, label: 'Menyusu', color: 'text-pink-500', bg: 'bg-soft-pink' },
    { icon: Moon, label: 'Tidur', color: 'text-blue-500', bg: 'bg-soft-blue' },
    { icon: Droplets, label: 'Popok', color: 'text-green-500', bg: 'bg-soft-green' },
    { icon: Thermometer, label: 'Suhu', color: 'text-yellow-500', bg: 'bg-soft-yellow' },
    { icon: FileText, label: 'Catatan', color: 'text-purple-500', bg: 'bg-soft-purple' },
  ]

  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold mb-2">Belum Ada Aktivitas</h3>
      <p className="text-sm text-muted mb-8">
        Mulai catat aktivitas bayi Anda hari ini
      </p>
      <div className="flex justify-center gap-4 mb-8">
        {items.slice(0, 3).map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <span className="text-xs text-muted">{item.label}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onAddActivity}
        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all shadow-sm"
      >
        Catat Aktivitas Pertama
      </button>
    </div>
  )
}
