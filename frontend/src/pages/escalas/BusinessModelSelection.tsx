import { useNavigate } from 'react-router-dom'
import { Badge, Card, CardBody } from '../../components/ui'
import { Header } from '../../components/layout/Header'

interface BusinessModel {
  key: string
  icon: string
  name: string
  description: string
  available: boolean
  route?: string
}

const BUSINESS_MODELS: BusinessModel[] = [
  {
    key: 'escola',
    icon: '🏫',
    name: 'Escola',
    description: 'Geração e organização de horários escolares',
    available: true,
    route: '/escalas/escola',
  },
  { key: 'aviacao', icon: '✈️', name: 'Companhia aérea', description: 'Em breve', available: false },
  { key: 'supermercado', icon: '🛒', name: 'Supermercado', description: 'Em breve', available: false },
  { key: 'varejo', icon: '🏪', name: 'Varejo', description: 'Em breve', available: false },
  { key: 'industria', icon: '🏭', name: 'Indústria', description: 'Em breve', available: false },
  { key: 'saude', icon: '🏥', name: 'Saúde', description: 'Em breve', available: false },
]

export function BusinessModelSelection() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Escalas" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Escolha o tipo de operação</h1>
        <p className="mt-1 text-slate-500">Selecione o modelo de negócio para configurar suas escalas</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_MODELS.map((model) => (
            <Card key={model.key} className={model.available ? 'hover:shadow-md' : 'opacity-60'}>
              <CardBody>
                <div className="text-3xl">{model.icon}</div>
                <h2 className="mt-3 text-base font-semibold text-slate-900">{model.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{model.description}</p>
                <div className="mt-4">
                  {model.available ? (
                    <button
                      type="button"
                      onClick={() => model.route && navigate(model.route)}
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
          ))}
        </div>
      </main>
    </div>
  )
}
