import { useEffect, useState } from 'react'
import { useBabyStore } from '@/stores/baby-store'
import { getActivities } from '@/features/activities/use-activities'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Baby, Moon, Droplets } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DayData {
  date: string
  label: string
  feeding: number
  sleep: number
  diaper: number
}

export default function ReportsPage() {
  const { selectedBabyId } = useBabyStore()
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedBabyId) {
      setLoading(false)
      return
    }

    const fetch7Days = async () => {
      const days: DayData[] = []
      const today = new Date()

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().slice(0, 10)
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' })
        const dayNum = date.getDate()

        try {
          const res = await getActivities(selectedBabyId!, { date: dateStr })
          const acts = res.activities
          days.push({
            date: dateStr,
            label: `${dayName} ${dayNum}`,
            feeding: acts.filter((a) => a.type === 'feeding').length,
            sleep: acts.filter((a) => a.type === 'sleep').reduce((sum, a) => sum + (a.duration_minutes || 0), 0),
            diaper: acts.filter((a) => a.type === 'diaper').length,
          })
        } catch {
          days.push({ date: dateStr, label: `${dayName} ${dayNum}`, feeding: 0, sleep: 0, diaper: 0 })
        }
      }

      setData(days)
      setLoading(false)
    }

    fetch7Days()
  }, [selectedBabyId])

  if (!selectedBabyId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Pilih bayi terlebih dahulu</p>
      </div>
    )
  }

  const totals = data.reduce(
    (acc, d) => ({
      feeding: acc.feeding + d.feeding,
      sleep: acc.sleep + d.sleep,
      diaper: acc.diaper + d.diaper,
    }),
    { feeding: 0, sleep: 0, diaper: 0 }
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laporan 7 Hari</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Baby className="w-5 h-5 text-pink-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{totals.feeding}</p>
          <p className="text-xs text-muted">Total Menyusu</p>
        </Card>
        <Card className="p-4 text-center">
          <Moon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{Math.round(totals.sleep / 60)}j</p>
          <p className="text-xs text-muted">Total Tidur</p>
        </Card>
        <Card className="p-4 text-center">
          <Droplets className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{totals.diaper}</p>
          <p className="text-xs text-muted">Total Popok</p>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Baby className="w-4 h-4 text-pink-500" />
                Menyusu per Hari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e8e6ef',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="feeding" fill="#f0a5b8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-500" />
                Tidur per Hari (jam)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.map((d) => ({ ...d, sleep: Math.round(d.sleep / 60 * 10) / 10 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e8e6ef',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="sleep" fill="#83cdd1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="w-4 h-4 text-green-500" />
                Popok per Hari
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e8e6ef',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="diaper" fill="#81c784" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
