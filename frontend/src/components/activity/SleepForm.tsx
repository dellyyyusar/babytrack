import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createActivity, updateActivity } from '@/features/activities/use-activities'
import { getLocalDatetimeString } from '@/lib/utils'

interface SleepFormProps {
  babyId: string
  activity?: any
  onSaved: () => void
  onCancel: () => void
}

export function SleepForm({ babyId, activity, onSaved, onCancel }: SleepFormProps) {
  const [startedAt, setStartedAt] = useState(
    activity ? new Date(activity.started_at).toISOString().slice(0, 16) : getLocalDatetimeString()
  )
  const [endedAt, setEndedAt] = useState(
    activity?.ended_at ? new Date(activity.ended_at).toISOString().slice(0, 16) : ''
  )
  const [quality, setQuality] = useState(activity?.metadata?.sleep_quality || 'good')
  const [notes, setNotes] = useState(activity?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload: any = {
        type: 'sleep' as const,
        started_at: new Date(startedAt).toISOString(),
        metadata: {
          sleep_quality: quality,
        },
        notes: notes || undefined,
      }

      if (endedAt) {
        payload.ended_at = new Date(endedAt).toISOString()
        const start = new Date(startedAt).getTime()
        const end = new Date(endedAt).getTime()
        if (end > start) {
          payload.duration_minutes = Math.round((end - start) / 60000)
        }
      }

      if (activity) {
        await updateActivity(activity.id, payload)
      } else {
        await createActivity(babyId, payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (<div className="bg-red-50 text-danger text-sm p-3 rounded-xl">{error}</div>)}
      <div className="space-y-2">
        <Label htmlFor="startedAt">Jam Mulai Tidur</Label>
        <Input
          id="startedAt"
          type="datetime-local"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endedAt">Jam Bangun (kosongkan jika masih tidur)</Label>
        <Input
          id="endedAt"
          type="datetime-local"
          value={endedAt}
          onChange={(e) => setEndedAt(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Kualitas Tidur</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'good', label: 'Nyenyak' },
            { value: 'restless', label: 'Sering Bangun' },
            { value: 'fussy', label: 'Rewel' },
          ].map((q) => (
            <button
              key={q.value}
              type="button"
              onClick={() => setQuality(q.value)}
              className={`p-2 rounded-xl text-sm font-medium transition-all ${
                quality === q.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-bg text-text-light hover:bg-soft-purple'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <textarea
          id="notes"
          className="flex min-h-[60px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
          placeholder="Catatan tambahan..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Menyimpan...' : activity ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
