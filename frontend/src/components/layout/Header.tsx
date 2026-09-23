import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  title?: string
  actions?: ReactNode
}

export function Header({ title, actions }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-brand-divider bg-white px-6">
      <div>
        {title ? (
          <h1 className="font-display text-lg font-semibold text-brand-ink">{title}</h1>
        ) : (
          <span className="font-display text-lg font-semibold text-brand-ink">Orotchimo</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-brand-ink-soft">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-brand-border px-3 py-1.5 text-sm text-brand-ink-soft hover:bg-brand-muted"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
