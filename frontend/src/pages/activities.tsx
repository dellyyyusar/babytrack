import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBabyStore } from '@/stores/baby-store'
import { getActivities, type Activity } from '@/features/activities/use-activities'
import { TimelineItem } from '@/components/activity/TimelineItem'
import { ActivityModal } from '@/components/activity/ActivityModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getActivityLabel } from '@/lib/utils'
import { Plus } from 'lucide-react'

const activityTypes = ['all', 'feeding', 'sleep', 'diaper', 'temperature', 'note']

export default function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { selectedBabyId } = useBabyStore()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    if (searchParams.get('add') === 'true' && selectedBabyId) {
      setShowAddModal(true)
      searchParams.delete('add')
      setSearchParams(searchParams)
    }
  }, [searchParams])

  useEffect(() => {
    if (!selectedBabyId) return
    setLoading(true)
    getActivities(selectedBabyId, {
      type: filterType !== 'all' ? filterType : undefined,
      date: selectedDate,
    })
      .then((data) => setActivities(data.activities ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedBabyId, filterType, selectedDate])

  const fetchActivities = () => {
    if (!selectedBabyId) return
    getActivities(selectedBabyId, {
      type: filterType !== 'all' ? filterType : undefined,
      date: selectedDate,
    })
      .then((data) => setActivities(data.activities ?? []))
      .catch(() => {})
  }

  if (!selectedBabyId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Pilih bayi terlebih dahulu</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aktivitas</h1>
        <Button onClick={() => setShowAddModal(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterType === type
                  ? 'bg-primary text-white'
                  : 'bg-bg text-text-light border border-border hover:bg-soft-purple'
              }`}
            >
              {type === 'all' ? 'Semua' : getActivityLabel(type)}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 divide-y divide-border/50 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4">Belum ada aktivitas pada tanggal ini</p>
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              Tambah Aktivitas
            </Button>
          </div>
        ) : (
          activities.map((activity) => (
            <TimelineItem
              key={activity.id}
              activity={activity}
              onDeleted={fetchActivities}
            />
          ))
        )}
      </Card>

      {showAddModal && (
        <ActivityModal
          type="feeding"
          babyId={selectedBabyId}
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false)
            fetchActivities()
          }}
        />
      )}
    </div>
  )
}
