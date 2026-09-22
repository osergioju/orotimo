import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Card, CardBody } from '../../components/ui'
import { Header } from '../../components/layout/Header'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'
import type { SystemModule } from '../../types'

const SYSTEM_ICONS: Record<string, string> = {
  escalas: '📅',
  aviacao: '✈️',
  varejo: '🛒',
  saude: '🏥',
}

const SYSTEM_ROUTES: Record<string, string> = {
  escalas: '/escalas',
}

export function SystemSelection() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [systems, setSystems] = useState<SystemModule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .listSystems()
      .then(({ systems }) => setSystems(systems))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Olá, {user?.name ?? ''}</h1>
        <p className="mt-1 text-slate-500">Escolha um sistema para continuar</p>

        {isLoading ? (
          <p className="mt-8 text-sm text-slate-400">Carregando sistemas...</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {systems.map((system) => {
              const isActive = system.status === 'active'
              const route = SYSTEM_ROUTES[system.key]

              return (
                <Card
                  key={system.id}
                  className={`transition-shadow ${isActive ? 'hover:shadow-md' : 'opacity-60'}`}
                >
                  <CardBody>
                    <div className="text-3xl">{SYSTEM_ICONS[system.key] ?? '🧩'}</div>
                    <h2 className="mt-3 text-base font-semibold text-slate-900">{system.name.toUpperCase()}</h2>
                    <p className="mt-1 text-sm text-slate-500">{system.description}</p>
                    <div className="mt-4">
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => route && navigate(route)}
                          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                          Acessar
                        </button>
                      ) : (
                        <Badge tone="neutral">Em breve</Badge>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
