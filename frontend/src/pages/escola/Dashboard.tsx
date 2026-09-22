import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '../../components/ui'
import { useSchool } from '../../contexts/SchoolContext'
import { api } from '../../lib/api'
import type { SchoolOverview } from '../../types'

export function Dashboard() {
  const { currentSchool } = useSchool()
  const navigate = useNavigate()
  const [overview, setOverview] = useState<SchoolOverview | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api.getSchoolDashboard(currentSchool.id).then(({ overview }) => setOverview(overview))
  }, [currentSchool])

  if (!currentSchool) return null

  const base = `/escalas/escola/${currentSchool.id}`

  const overviewItems = [
    { label: 'Turmas', value: overview?.turmas },
    { label: 'Professores', value: overview?.professores },
    { label: 'Salas', value: overview?.salas },
    { label: 'Disciplinas', value: overview?.disciplinas },
  ]

  const cadastros = [
    { label: 'Professores', to: `${base}/cadastros/professores` },
    { label: 'Turmas', to: `${base}/cadastros/turmas` },
    { label: 'Disciplinas', to: `${base}/cadastros/disciplinas` },
    { label: 'Salas', to: `${base}/cadastros/salas` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{currentSchool.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {overviewItems.map((item) => (
          <Card key={item.label}>
            <CardBody>
              <p className="text-2xl font-semibold text-slate-900">{item.value ?? '—'}</p>
              <p className="mt-1 text-sm text-slate-500">{item.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Cadastros</h2>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-3">
          {cadastros.map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </button>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Escalas</h2>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`${base}/escalas/nova`)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Nova escala
          </button>
          <button
            type="button"
            onClick={() => navigate(`${base}/escalas`)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Minhas escalas
          </button>
        </CardBody>
      </Card>
    </div>
  )
}
