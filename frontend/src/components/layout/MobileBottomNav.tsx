import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Clock, PlusCircle, BarChart3, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  onMenuClick: () => void
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const items = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Aktivitas', href: '/activities', icon: Clock },
    { label: 'Tambah', href: '#', icon: PlusCircle, action: 'add' as const },
    { label: 'Laporan', href: '/reports', icon: BarChart3 },
    { label: 'Menu', href: '#', icon: Menu, action: 'menu' as const },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border/50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.action === 'add') {
                navigate('/activities?add=true')
              } else if (item.action === 'menu') {
                onMenuClick()
              } else {
                navigate(item.href)
              }
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 w-16 h-full rounded-xl transition-all duration-200',
              location.pathname === item.href
                ? 'text-primary'
                : 'text-muted hover:text-text-light'
            )}
          >
            {item.action === 'add' ? (
              <div className="w-12 h-12 -mt-4 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
            ) : (
              <item.icon className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
