import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, LayoutDashboard, Clock, BarChart3, Settings, Baby, PlusCircle, PanelLeftClose, PanelLeft, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useBabyStore } from '@/stores/baby-store'

interface SidebarProps {
  open: boolean
  onClose: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Aktivitas', href: '/activities', icon: Clock },
  { label: 'Laporan', href: '/reports', icon: BarChart3 },
  { label: 'Profil Bayi', href: '#', icon: Baby, action: 'baby' },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
]

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { babies, selectedBabyId, selectBaby } = useBabyStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleNav = (item: typeof navItems[0]) => {
    if (item.action === 'baby') {
      if (babies.length > 0) {
        navigate(`/babies/${selectedBabyId || babies[0].id}`)
      } else {
        navigate('/babies/new')
      }
    } else {
      navigate(item.href)
    }
    onClose()
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-card border-r border-border/50 transform transition-all duration-200 lg:static lg:z-auto',
          collapsed ? 'w-16' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn('flex items-center border-b border-border/50', collapsed ? 'justify-center p-3' : 'justify-between p-5')}>
            {collapsed ? (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Baby className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Baby className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-lg">BeeTrack</span>
              </div>
            )}
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-soft-purple">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                  location.pathname === item.href
                    ? 'bg-soft-purple text-primary'
                    : 'text-text-light hover:bg-soft-purple/50 hover:text-text'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && item.label}
              </button>
            ))}

            {!collapsed && babies.length > 0 && (
              <>
                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted uppercase tracking-wider">
                  Bayi
                </div>
                {babies.map((baby) => (
                  <button
                    key={baby.id}
                    onClick={() => {
                      selectBaby(baby.id)
                      navigate('/')
                      onClose()
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      selectedBabyId === baby.id
                        ? 'bg-soft-blue text-blue-700'
                        : 'text-text-light hover:bg-soft-purple/50 hover:text-text'
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-soft-blue flex items-center justify-center text-xs font-semibold text-blue-600">
                      {baby.name[0]}
                    </div>
                    {baby.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    navigate('/babies/new')
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-primary hover:bg-soft-purple/50 transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  Tambah Bayi
                </button>
              </>
            )}
          </div>

          <div className="p-3 border-t border-border/50 relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                'w-full rounded-xl hover:bg-soft-purple/50 transition-colors',
                collapsed ? 'flex justify-center p-2' : 'flex items-center gap-3 p-2'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-soft-purple flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                {user?.full_name?.[0] || 'U'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{user?.full_name}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
              )}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className={cn(
                  'absolute z-20 bg-card border border-border/50 rounded-xl shadow-lg py-1',
                  collapsed ? 'left-full ml-2 bottom-0 w-48' : 'bottom-full mb-2 left-0 right-0'
                )}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50 transition-colors rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 border-t border-border/50 text-muted hover:text-text hover:bg-soft-purple/50 transition-colors"
            >
              {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
