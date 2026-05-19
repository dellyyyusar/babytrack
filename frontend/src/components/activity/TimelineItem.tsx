import { useState } from 'react'
import { Baby, Moon, Droplets, Thermometer, FileText, Scale, Pill } from 'lucide-react'
import { formatTime, getActivityLabel } from '@/lib/utils'
import type { Activity } from '@/features/activities/use-activities'
import { deleteActivity } from '@/features/activities/use-activities'
import { ActivityModal } from './ActivityModal'

interface TimelineItemProps {
  activity: Activity
  onDeleted?: () => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  feeding: Baby,
  sleep: Moon,
  diaper: Droplets,
  temperature: Thermometer,
  note: FileText,
  growth: Scale,
  medicine: Pill,
}

const colorMap: Record<string, string> = {
  feeding: 'bg-soft-pink text-pink-600',
  sleep: 'bg-soft-blue text-blue-600',
  diaper: 'bg-soft-green text-green-600',
  temperature: 'bg-soft-yellow text-yellow-600',
  note: 'bg-soft-purple text-purple-600',
  growth: 'bg-soft-purple text-purple-600',
  medicine: 'bg-red-50 text-red-500',
}

export function TimelineItem({ activity, onDeleted }: TimelineItemProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const Icon = iconMap[activity.type] || FileText
  const date = new Date(activity.started_at)

  const getSummary = (): React.ReactNode => {
    switch (activity.type) {
      case 'feeding': {
        const ft = activity.metadata?.feeding_type
        const side = activity.metadata?.breast_side
        const vol = activity.metadata?.volume_ml
        const types: Record<string, string> = {
          breastfeeding: 'ASI',
          bottle_asi: 'Botol ASI',
          formula: 'Formula',
          mpasi: 'MPASI',
        }
        let s = types[ft as string] || 'Menyusu'
        if (side === 'left') s += ' (kiri)'
        else if (side === 'right') s += ' (kanan)'
        else if (side === 'both') s += ' (kedua sisi)'
        if (vol) s += ` - ${vol}ml`
        if (activity.duration_minutes) s += ` - ${activity.duration_minutes}mnt`
        return s
      }
      case 'sleep': {
        const quality: Record<string, string> = { good: 'Nyenyak', restless: 'Sering bangun', fussy: 'Rewel' }
        let s = quality[activity.metadata?.sleep_quality as string] || 'Tidur'
        if (activity.duration_minutes) {
          const h = Math.floor(activity.duration_minutes / 60)
          const m = activity.duration_minutes % 60
          s += ` - ${h}j ${m}m`
        }
        return s
      }
      case 'diaper': {
        const types: Record<string, string> = {
          wet: 'Basah',
          dirty: 'Pup',
          wet_and_dirty: 'Basah + Pup',
          dry: 'Kering',
        }
        return types[activity.metadata?.diaper_type as string] || 'Ganti popok'
      }
      case 'temperature':
        return `${activity.metadata?.temperature}°C`
      case 'note':
        return (activity.metadata?.title as string) || 'Catatan'
      default:
        return ''
    }
  }

  const handleDelete = async () => {
    try {
      await deleteActivity(activity.id)
      onDeleted?.()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className="flex items-start gap-3 p-4 hover:bg-bg/50 transition-colors group">
        <div
          className={`w-9 h-9 rounded-xl ${colorMap[activity.type] || 'bg-bg text-text-light'} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold">{getActivityLabel(activity.type)}</span>
            <span className="text-xs text-muted">{formatTime(date)}</span>
          </div>
          <p className="text-sm text-text-light truncate">{getSummary()}</p>
          {activity.notes && (
            <p className="text-xs text-muted mt-1 line-clamp-2">{activity.notes}</p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowEdit(true)}
            className="p-1.5 rounded-lg hover:bg-soft-blue text-blue-600 text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 text-xs"
          >
            Hapus
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="font-semibold mb-2">Hapus Aktivitas?</h3>
            <p className="text-sm text-muted mb-4">Data yang dihapus tidak bisa dikembalikan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 p-2 rounded-xl border border-border text-sm font-medium hover:bg-bg"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 p-2 rounded-xl bg-danger text-white text-sm font-medium hover:opacity-90"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <ActivityModal
          type={activity.type as any}
          babyId={activity.baby_id}
          open={true}
          onClose={() => setShowEdit(false)}
          activity={activity}
          onSaved={() => {
            setShowEdit(false)
            onDeleted?.()
          }}
        />
      )}
    </>
  )
}
