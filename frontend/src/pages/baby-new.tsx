import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { createBaby } from '@/features/babies/use-babies'
import { Baby, ArrowLeft } from 'lucide-react'

export default function BabyNewPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [birthWeight, setBirthWeight] = useState('')
  const [birthLength, setBirthLength] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !birthDate || !gender) {
      setError('Nama, tanggal lahir, dan jenis kelamin harus diisi')
      return
    }
    setLoading(true)
    try {
      await createBaby({
        name,
        birth_date: birthDate,
        gender,
        birth_weight: birthWeight ? parseFloat(birthWeight) : undefined,
        birth_length: birthLength ? parseFloat(birthLength) : undefined,
        notes: notes || undefined,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data bayi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted hover:text-text mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-soft-blue flex items-center justify-center mx-auto mb-3">
          <Baby className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">Tambah Bayi</h1>
        <p className="text-sm text-muted mt-1">Masukkan data bayi Anda</p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-danger text-sm p-3 rounded-xl">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Bayi *</Label>
              <Input
                id="name"
                placeholder="Nama lengkap bayi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Tanggal Lahir *</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Jenis Kelamin *</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Laki-laki</SelectItem>
                  <SelectItem value="female">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthWeight">Berat Lahir (kg)</Label>
                <Input
                  id="birthWeight"
                  type="number"
                  step="0.01"
                  placeholder="3.2"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthLength">Panjang Lahir (cm)</Label>
                <Input
                  id="birthLength"
                  type="number"
                  step="0.1"
                  placeholder="50"
                  value={birthLength}
                  onChange={(e) => setBirthLength(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Khusus</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                placeholder="Alergi, kondisi khusus, dll."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Data Bayi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
