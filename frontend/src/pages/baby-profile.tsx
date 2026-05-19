import { useParams, useNavigate } from 'react-router-dom'
import { useBabyStore } from '@/stores/baby-store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Baby, Calendar } from 'lucide-react'
import { getAge, formatDate } from '@/lib/utils'

export default function BabyProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { babies } = useBabyStore()
  const baby = babies.find((b) => b.id === id)

  if (!baby) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Bayi tidak ditemukan</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Kembali ke Dashboard
        </Button>
      </div>
    )
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
        <div className="w-20 h-20 rounded-full bg-soft-blue flex items-center justify-center mx-auto mb-3">
          <Baby className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">{baby.name}</h1>
        <p className="text-muted text-sm mt-1">{getAge(baby.birth_date)}</p>
        <Badge variant={baby.gender === 'male' ? 'default' : 'secondary'} className="mt-2">
          {baby.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
        </Badge>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Tanggal Lahir</span>
              <span className="font-medium">{formatDate(baby.birth_date)}</span>
            </div>
            {baby.birth_weight && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Berat Lahir</span>
                <span className="font-medium">{baby.birth_weight} kg</span>
              </div>
            )}
            {baby.birth_length && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Panjang Lahir</span>
                <span className="font-medium">{baby.birth_length} cm</span>
              </div>
            )}
            {baby.blood_type && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Golongan Darah</span>
                <span className="font-medium">{baby.blood_type}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {baby.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-light">{baby.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
