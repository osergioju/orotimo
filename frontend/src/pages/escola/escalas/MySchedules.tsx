import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, EmptyState, Table, type TableColumn } from '../../../components/ui'
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Escalas</h1>
        <Button onClick={() => navigate(`${base}/escalas/nova`)}>+ Criar nova escala</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Carregando escalas...</p>
      ) : schedules.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="Nenhuma escala criada"
          description="Crie sua primeira escala para começar a organizar os horários."
          action={<Button onClick={() => navigate(`${base}/escalas/nova`)}>+ Criar nova escala</Button>}
        />
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
