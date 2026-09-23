import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui'
import { api } from '../../lib/api'
import type { AdminStats } from '../../types'

const CARDS = [
  { label: 'Usuários', to: '/admin/usuarios', icon: '👤' },
  { label: 'Sistemas', to: '/admin/sistemas', icon: '🧩' },
  { label: 'Permissões', to: '/admin/permissoes', icon: '🔐' },
  { label: 'Escolas', to: '/admin/escolas', icon: '🏫' },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    api.adminGetStats().then(setStats)
  }, [])

  const statCards = stats
    ? [
        { label: 'Usuários', value: stats.users },
        { label: 'Administradores', value: stats.admins },
        { label: 'Escolas', value: stats.schools },
        { label: 'Professores (todas as escolas)', value: stats.teachers },
        { label: 'Escalas criadas', value: stats.schedules },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brand-ink">Admin Master</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardBody>
              <p className="font-display text-2xl font-semibold text-brand-ink">{card.value}</p>
              <p className="mt-1 text-xs text-brand-ink-soft">{card.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <Card key={card.to} className="cursor-pointer hover:shadow-md" onClick={() => navigate(card.to)}>
            <CardBody>
              <div className="text-2xl">{card.icon}</div>
              <p className="mt-2 text-base font-semibold text-brand-ink">{card.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
