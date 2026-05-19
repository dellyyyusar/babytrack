import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createActivity, updateActivity } from '@/features/activities/use-activities'
import { getLocalDatetimeString } from '@/lib/utils'

interface NoteFormProps {
  babyId: string
  activity?: any
  onSaved: () => void
  onCancel: () => void
}

const tagOptions = [
  { value: 'rewel', label: 'Rewel' },
  { value: 'alergi', label: 'Alergi' },
  { value: 'ruam', label: 'Ruam' },
  { value: 'batuk', label: 'Batuk' },
  { value: 'demam', label: 'Demam' },
  { value: 'dokter', label: 'Dokter' },
]

export function NoteForm({ babyId, activity, onSaved, onCancel }: NoteFormProps) {
  const [startedAt] = useState(
    activity ? new Date(activity.started_at).toISOString().slice(0, 16) : getLocalDatetimeString()
  )
  const [title, setTitle] = useState(activity?.metadata?.title || '')
  const [content, setContent] = useState(activity?.notes || '')
  const [tags, setTags] = useState<string[]>(activity?.metadata?.tags || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        type: 'note' as const,
        started_at: new Date(startedAt).toISOString(),
        metadata: {
          title: title || null,
          tags,
        },
        notes: content,
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
        <Label htmlFor="title">Judul (opsional)</Label>
        <Input
          id="title"
          placeholder="Judul catatan"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Isi Catatan</Label>
        <textarea
          id="content"
          className="flex min-h-[120px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
          placeholder="Tulis catatan di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tag</Label>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                tags.includes(tag.value)
                  ? 'bg-primary text-white'
                  : 'bg-bg text-text-light hover:bg-soft-purple border border-border'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
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
