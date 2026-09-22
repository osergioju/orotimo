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
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        {title ? (
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        ) : (
          <span className="text-lg font-semibold text-slate-900">Scale Engine</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
