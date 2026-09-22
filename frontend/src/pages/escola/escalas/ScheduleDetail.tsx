import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, CardBody, CardHeader } from '../../../components/ui'
import { api } from '../../../lib/api'
import type { Schedule } from '../../../types'

export function ScheduleDetail() {
  const { schoolId, scheduleId } = useParams<{ schoolId: string; scheduleId: string }>()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState<Schedule | null>(null)

  useEffect(() => {
    if (!scheduleId) return
    api.getSchedule(scheduleId).then(({ schedule }) => setSchedule(schedule))
  }, [scheduleId])

  if (!schedule) {
    return <p className="text-sm text-slate-400">Carregando escala...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{schedule.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {schedule.period ?? '—'} · Ano letivo {schedule.academicYear ?? '—'}
          </p>
        </div>
        <Badge tone={schedule.status === 'generated' ? 'success' : 'warning'}>
          {schedule.status === 'generated' ? 'Gerada' : 'Rascunho'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Métricas (dados ilustrativos)</h2>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">100%</p>
            <p className="text-xs text-slate-500">Cobertura</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">12h</p>
            <p className="text-xs text-slate-500">Horas extras</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">91%</p>
            <p className="text-xs text-slate-500">Satisfação estimada</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">0</p>
            <p className="text-xs text-slate-500">Violações hard</p>
          </div>
        </CardBody>
      </Card>

      <Button variant="secondary" onClick={() => navigate(`/escalas/escola/${schoolId}/escalas`)} className="self-start">
        Voltar para Minhas escalas
      </Button>
    </div>
  )
}
