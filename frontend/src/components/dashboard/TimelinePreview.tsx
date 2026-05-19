import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivities, type Activity } from '@/features/activities/use-activities'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TimelineItem } from '@/components/activity/TimelineItem'
import { ArrowRight } from 'lucide-react'

interface TimelinePreviewProps {
  babyId: string
  refreshKey?: number
}

export function TimelinePreview({ babyId, refreshKey }: TimelinePreviewProps) {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivities(babyId, { limit: '5' })
      .then((data) => setActivities(data.activities))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [babyId, refreshKey])

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-0">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Aktivitas Terbaru
        </h3>
        <button
          onClick={() => navigate('/activities')}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="divide-y divide-border/50">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Belum ada aktivitas</p>
        ) : (
          activities.map((activity) => (
            <TimelineItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </Card>
  )
}
