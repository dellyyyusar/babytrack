import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, LogOut, User } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted hover:text-text mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Nama</span>
              <span className="font-medium">{user?.full_name}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
