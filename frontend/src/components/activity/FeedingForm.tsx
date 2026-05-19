import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createActivity, updateActivity } from '@/features/activities/use-activities'
import { getLocalDatetimeString } from '@/lib/utils'

interface FeedingFormProps {
  babyId: string
  activity?: any
  onSaved: () => void
  onCancel: () => void
}

type FeedingType = 'breastfeeding' | 'bottle_asi' | 'formula' | 'mpasi'

export function FeedingForm({ babyId, activity, onSaved, onCancel }: FeedingFormProps) {
  const [feedingType, setFeedingType] = useState<FeedingType>(activity?.metadata?.feeding_type || 'breastfeeding')
  const [startedAt, setStartedAt] = useState(
    activity ? new Date(activity.started_at).toISOString().slice(0, 16) : getLocalDatetimeString()
  )
  const [duration, setDuration] = useState(activity?.duration_minutes?.toString() || '')
  const [breastSide, setBreastSide] = useState(activity?.metadata?.breast_side || '')
  const [volume, setVolume] = useState(activity?.metadata?.volume_ml?.toString() || '')
  const [foodName, setFoodName] = useState(activity?.metadata?.food_name || '')
  const [notes, setNotes] = useState(activity?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        type: 'feeding' as const,
        started_at: new Date(startedAt).toISOString(),
        duration_minutes: duration ? parseInt(duration) : undefined,
        metadata: {
          feeding_type: feedingType,
          breast_side: breastSide || null,
          volume_ml: volume ? parseInt(volume) : null,
          food_name: foodName || null,
        },
        notes: notes || undefined,
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
      {error && (
        <div className="bg-red-50 text-danger text-sm p-3 rounded-xl">{error}</div>
      )}
      <div className="space-y-2">
        <Label>Jenis Feeding</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'breastfeeding', label: 'ASI Langsung' },
            { value: 'bottle_asi', label: 'Botol ASI' },
            { value: 'formula', label: 'Formula' },
            { value: 'mpasi', label: 'MPASI' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFeedingType(type.value as FeedingType)}
              className={`p-2 rounded-xl text-sm font-medium transition-all ${
                feedingType === type.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-bg text-text-light hover:bg-soft-purple'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startedAt">Waktu Mulai</Label>
        <Input
          id="startedAt"
          type="datetime-local"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Durasi (menit)</Label>
        <Input
          id="duration"
          type="number"
          placeholder="20"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      {feedingType === 'breastfeeding' && (
        <div className="space-y-2">
          <Label>Sisi Payudara</Label>
          <div className="flex gap-2">
            {[
              { value: 'left', label: 'Kiri' },
              { value: 'right', label: 'Kanan' },
              { value: 'both', label: 'Keduanya' },
            ].map((side) => (
              <button
                key={side.value}
                type="button"
                onClick={() => setBreastSide(side.value)}
                className={`flex-1 p-2 rounded-xl text-sm font-medium transition-all ${
                  breastSide === side.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-bg text-text-light hover:bg-soft-purple'
                }`}
              >
                {side.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(feedingType === 'bottle_asi' || feedingType === 'formula') && (
        <div className="space-y-2">
          <Label htmlFor="volume">Volume (ml)</Label>
          <Input
            id="volume"
            type="number"
            placeholder="90"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
        </div>
      )}

      {feedingType === 'mpasi' && (
        <div className="space-y-2">
          <Label htmlFor="foodName">Nama Makanan</Label>
          <Input
            id="foodName"
            placeholder="Bubur ayam, puree buah, dll."
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
        </div>
      )}

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
