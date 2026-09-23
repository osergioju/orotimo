import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui'

const CARDS = [
  { label: 'Usuários', to: '/admin/usuarios', icon: '👤' },
  { label: 'Sistemas', to: '/admin/sistemas', icon: '🧩' },
  { label: 'Permissões', to: '/admin/permissoes', icon: '🔐' },
  { label: 'Escolas', to: '/admin/escolas', icon: '🏫' },
]

export function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brand-ink">Admin Master</h1>
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
