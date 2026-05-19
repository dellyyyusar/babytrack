import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createActivity, updateActivity } from '@/features/activities/use-activities'
import { getLocalDatetimeString } from '@/lib/utils'

interface DiaperFormProps {
  babyId: string
  activity?: any
  onSaved: () => void
  onCancel: () => void
}

type DiaperType = 'wet' | 'dirty' | 'wet_and_dirty' | 'dry'

export function DiaperForm({ babyId, activity, onSaved, onCancel }: DiaperFormProps) {
  const [startedAt, setStartedAt] = useState(
    activity ? new Date(activity.started_at).toISOString().slice(0, 16) : getLocalDatetimeString()
  )
  const [diaperType, setDiaperType] = useState<DiaperType>(activity?.metadata?.diaper_type || 'wet')
  const [poopColor, setPoopColor] = useState(activity?.metadata?.poop_color || '')
  const [poopTexture, setPoopTexture] = useState(activity?.metadata?.poop_texture || '')
  const [notes, setNotes] = useState(activity?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isDirty = diaperType === 'dirty' || diaperType === 'wet_and_dirty'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        type: 'diaper' as const,
        started_at: new Date(startedAt).toISOString(),
        metadata: {
          diaper_type: diaperType,
          poop_color: isDirty ? poopColor : null,
          poop_texture: isDirty ? poopTexture : null,
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
        <Label htmlFor="startedAt">Waktu Ganti Popok</Label>
        <Input
          id="startedAt"
          type="datetime-local"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tipe Popok</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'wet', label: 'Basah' },
            { value: 'dirty', label: 'Pup' },
            { value: 'wet_and_dirty', label: 'Basah + Pup' },
            { value: 'dry', label: 'Kering' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setDiaperType(type.value as DiaperType)}
              className={`p-2 rounded-xl text-sm font-medium transition-all ${
                diaperType === type.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-bg text-text-light hover:bg-soft-purple'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {isDirty && (
        <>
          <div className="space-y-2">
            <Label htmlFor="poopColor">Warna Pup</Label>
            <Select value={poopColor} onValueChange={setPoopColor}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih warna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yellow">Kuning</SelectItem>
                <SelectItem value="green">Hijau</SelectItem>
                <SelectItem value="brown">Coklat</SelectItem>
                <SelectItem value="dark_brown">Coklat Tua</SelectItem>
                <SelectItem value="black">Hitam</SelectItem>
                <SelectItem value="red">Merah</SelectItem>
                <SelectItem value="white">Putih</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="poopTexture">Tekstur Pup</Label>
            <Select value={poopTexture} onValueChange={setPoopTexture}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tekstur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soft">Lembek</SelectItem>
                <SelectItem value="runny">Cair</SelectItem>
                <SelectItem value="formed">Padat</SelectItem>
                <SelectItem value="hard">Keras</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
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
