import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createActivity, updateActivity } from '@/features/activities/use-activities'
import { getLocalDatetimeString } from '@/lib/utils'

interface TemperatureFormProps {
  babyId: string
  activity?: any
  onSaved: () => void
  onCancel: () => void
}

export function TemperatureForm({ babyId, activity, onSaved, onCancel }: TemperatureFormProps) {
  const [startedAt, setStartedAt] = useState(
    activity ? new Date(activity.started_at).toISOString().slice(0, 16) : getLocalDatetimeString()
  )
  const [temperature, setTemperature] = useState(activity?.metadata?.temperature?.toString() || '')
  const [method, setMethod] = useState(activity?.metadata?.method || 'axillary')
  const [notes, setNotes] = useState(activity?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const temp = parseFloat(temperature)
  const isHigh = !isNaN(temp) && temp >= 37.5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        type: 'temperature' as const,
        started_at: new Date(startedAt).toISOString(),
        metadata: {
          temperature: temp,
          method,
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
      {error && (<div className="bg-red-50 text-danger text-sm p-3 rounded-xl">{error}</div>)}
      <div className="space-y-2">
        <Label htmlFor="startedAt">Waktu Pengukuran</Label>
        <Input
          id="startedAt"
          type="datetime-local"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperature">Suhu Tubuh (°C)</Label>
        <Input
          id="temperature"
          type="number"
          step="0.1"
          placeholder="36.5"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          required
        />
        {isHigh && (
          <div className="bg-soft-yellow text-yellow-700 text-xs p-3 rounded-xl mt-1">
            Suhu {temp}°C lebih tinggi dari normal. Pantau terus kondisi bayi. Jika demam berlanjut, segera konsultasi ke dokter.
            <span className="block mt-1 text-yellow-500 font-medium">Ini bukan diagnosis medis.</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Metode Pengukuran</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih metode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="axillary">Ketiak</SelectItem>
            <SelectItem value="forehead">Dahi</SelectItem>
            <SelectItem value="ear">Telinga</SelectItem>
            <SelectItem value="rectal">Rektal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan</Label>
        <textarea
          id="notes"
          className="flex min-h-[60px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
          placeholder="Gejala lain, dll."
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
