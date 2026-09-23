import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Table, type TableColumn } from '../../../components/ui'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { Schedule } from '../../../types'

export function MySchedules() {
  const { currentSchool } = useSchool()
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentSchool) return
    api
      .listSchedules(currentSchool.id)
      .then(({ schedules }) => setSchedules(schedules))
      .finally(() => setIsLoading(false))
  }, [currentSchool])

  if (!currentSchool) return null

  const base = `/escalas/escola/${currentSchool.id}`

  const columns: TableColumn<Schedule>[] = [
    { key: 'name', header: 'Nome' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={row.status === 'generated' ? 'success' : 'warning'}>{row.status === 'generated' ? 'Gerada' : 'Rascunho'}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Criada em',
      render: (row) => new Date(row.createdAt).toLocaleDateString('pt-BR'),
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Escalas</span>
          </div>
          <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">Minhas escalas</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(`${base}/escalas/nova`)}
          className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink"
        >
          + Criar nova escala
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-ink-soft">Carregando escalas...</p>
      ) : schedules.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl">🗂️</span>
            <p className="text-sm font-semibold text-brand-ink">Nenhuma escala criada</p>
            <p className="max-w-xs text-sm text-brand-ink-soft">Crie sua primeira escala para começar a organizar os horários.</p>
            <button
              type="button"
              onClick={() => navigate(`${base}/escalas/nova`)}
              className="mt-1 h-11 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink"
            >
              + Criar nova escala
            </button>
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={schedules}
          rowKey={(row) => row.id}
          onRowClick={(row) => navigate(`${base}/escalas/${row.id}`)}
        />
      )}
    </div>
  )
}
