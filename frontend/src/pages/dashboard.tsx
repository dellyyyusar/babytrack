import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBabyStore } from '@/stores/baby-store'
import { getDashboardSummary, type Activity } from '@/features/activities/use-activities'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { LastActivityCards } from '@/components/dashboard/LastActivityCards'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { TimelinePreview } from '@/components/dashboard/TimelinePreview'
import { BabySwitcher } from '@/components/baby/BabySwitcher'
import { Skeleton } from '@/components/ui/skeleton'
import { getAge } from '@/lib/utils'
import { Baby } from 'lucide-react'

interface DashboardData {
  last_feeding: Activity | null
  last_sleep: Activity | null
  last_diaper: Activity | null
  today_feeding_count: number
  today_sleep_minutes: number
  today_diaper_count: number
  today_feeding_minutes: number
  upcoming_immunizations: unknown[]
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { babies, selectedBabyId, fetchBabies, isLoading: babiesLoading } = useBabyStore()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const baby = babies.find((b) => b.id === selectedBabyId)

  useEffect(() => {
    fetchBabies()
  }, [])

  useEffect(() => {
    if (selectedBabyId) {
      setLoading(true)
      getDashboardSummary(selectedBabyId)
        .then(setDashboard)
        .catch(() => {})
        .finally(() => setLoading(false))
    } else if (!babiesLoading && babies.length === 0) {
      setLoading(false)
    }
  }, [selectedBabyId, babies.length, babiesLoading, refreshKey])

  if (!babiesLoading && babies.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-soft-blue flex items-center justify-center mx-auto mb-4">
          <Baby className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Selamat Datang!</h2>
        <p className="text-muted text-sm mb-6">
          Tambahkan data bayi Anda untuk mulai mencatat aktivitas
        </p>
        <button
          onClick={() => navigate('/babies/new')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all shadow-sm"
        >
          Tambah Bayi
        </button>
      </div>
    )
  }

  const hasActivities = dashboard && (
    dashboard.today_feeding_count > 0 ||
    dashboard.today_sleep_minutes > 0 ||
    dashboard.today_diaper_count > 0 ||
    dashboard.last_feeding ||
    dashboard.last_sleep ||
    dashboard.last_diaper
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {baby && (
            <p className="text-sm text-muted mt-1">{getAge(baby.birth_date)}</p>
          )}
        </div>
        {babies.length > 0 && <BabySwitcher />}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : !hasActivities ? (
        <>
          <StatsCards
            feedingCount={0}
            sleepMinutes={0}
            diaperCount={0}
            feedingMinutes={0}
          />
          <QuickActions babyId={baby?.id} onSaved={() => setRefreshKey((k) => k + 1)} />
          <EmptyState onAddActivity={() => navigate('/activities?add=true')} />
        </>
      ) : (
        <>
          <StatsCards
            feedingCount={dashboard!.today_feeding_count}
            sleepMinutes={dashboard!.today_sleep_minutes}
            diaperCount={dashboard!.today_diaper_count}
            feedingMinutes={dashboard!.today_feeding_minutes}
          />
          <LastActivityCards
            lastFeeding={dashboard!.last_feeding}
            lastSleep={dashboard!.last_sleep}
            lastDiaper={dashboard!.last_diaper}
          />
          <QuickActions babyId={baby?.id} onSaved={() => setRefreshKey((k) => k + 1)} />
          <TimelinePreview babyId={selectedBabyId!} refreshKey={refreshKey} />
        </>
      )}
    </div>
  )
}
