import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../../components/ui'
import { api } from '../../../lib/api'
import type { Schedule, ScheduleSolution } from '../../../types'

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

const STATUS_LABEL: Record<Schedule['status'], string> = {
  draft: 'Rascunho',
  generating: 'Gerando...',
  generated: 'Gerada',
  failed: 'Falhou',
}

const STATUS_TONE: Record<Schedule['status'], 'success' | 'warning' | 'info'> = {
  draft: 'warning',
  generating: 'info',
  generated: 'success',
  failed: 'warning',
}

export function ScheduleDetail() {
  const { schoolId, scheduleId } = useParams<{ schoolId: string; scheduleId: string }>()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [solutions, setSolutions] = useState<ScheduleSolution[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    if (!scheduleId) return
    load()
    async function load() {
      const [{ schedule }, { solutions }] = await Promise.all([
        api.getSchedule(scheduleId!),
        api.getScheduleSolutions(scheduleId!),
      ])
      setSchedule(schedule)
      setSolutions(solutions)
      setIsLoading(false)
    }
  }, [scheduleId])

  async function handleRegenerate() {
    if (!scheduleId) return
    setIsRegenerating(true)
    try {
      await api.generateSchedule(scheduleId)
      const [{ schedule }, { solutions }] = await Promise.all([
        api.getSchedule(scheduleId),
        api.getScheduleSolutions(scheduleId),
      ])
      setSchedule(schedule)
      setSolutions(solutions)
      setSelectedIndex(0)
    } finally {
      setIsRegenerating(false)
    }
  }

  if (isLoading || !schedule) {
    return <p className="text-sm text-brand-ink-soft">Carregando escala...</p>
  }

  const successSolutions = solutions.filter((s) => s.status === 'success')
  const problemSolution = solutions.find((s) => s.status === 'infeasible' || s.status === 'error')
  const selected = successSolutions[selectedIndex]

  const gridByClass = new Map<string, Record<string, string>[]>()
  if (selected?.visualizacaoEscola) {
    for (const row of selected.visualizacaoEscola) {
      const turma = row.turma
      if (!gridByClass.has(turma)) gridByClass.set(turma, [])
      gridByClass.get(turma)!.push(row)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Escalas</span>
          </div>
          <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">{schedule.name}</h1>
          <p className="mt-2 text-sm text-brand-ink-soft">
            {schedule.period ?? '—'} · Ano letivo {schedule.academicYear ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={STATUS_TONE[schedule.status]}>{STATUS_LABEL[schedule.status]}</Badge>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRegenerating ? 'Gerando...' : 'Gerar novamente'}
          </button>
        </div>
      </div>

      {solutions.length === 0 && (
        <div className="rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-8 text-center text-sm text-brand-ink-soft">
          Esta escala ainda não foi gerada. Clique em "Gerar novamente" para rodar o solver.
        </div>
      )}

      {problemSolution && (
        <div className="flex flex-col gap-3 rounded-[28px] bg-white p-6 sm:p-7">
          <h2 className="font-display text-[17px] font-semibold text-brand-error-ink">
            {problemSolution.status === 'error' ? 'Erro ao gerar a escala' : 'Não foi possível gerar a escala'}
          </h2>
          {(problemSolution.messages ?? []).map((problem, index) => (
            <div key={index} className="rounded-2xl bg-red-50 p-4">
              <ul className="list-disc pl-5 text-sm text-brand-error-ink">
                {problem.mensagens.map((mensagem, i) => (
                  <li key={i}>{mensagem}</li>
                ))}
              </ul>
              {problem.dica && <p className="mt-2 whitespace-pre-line text-xs text-brand-ink-soft">{problem.dica}</p>}
            </div>
          ))}
        </div>
      )}

      {successSolutions.length > 0 && (
        <>
          {successSolutions.length > 1 && (
            <div className="flex gap-2">
              {successSolutions.map((solution, index) => (
                <button
                  key={solution.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`h-10 rounded-full px-4 text-sm font-semibold ${
                    index === selectedIndex ? 'bg-brand-primary text-white' : 'bg-brand-muted text-brand-ink-soft'
                  }`}
                >
                  Variante {index + 1}
                </button>
              ))}
            </div>
          )}

          {[...gridByClass.entries()].map(([turma, rows]) => (
            <div key={turma} className="rounded-[28px] bg-white p-6 sm:p-7">
              <h2 className="font-display text-[17px] font-semibold text-brand-ink">{turma}</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      <th className="w-28 pb-2 text-left text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">Momento</th>
                      {DAYS.map((day) => (
                        <th key={day} className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.momento}>
                        <td className="rounded-l-xl bg-brand-input px-3 py-2.5 text-xs font-semibold text-brand-ink-soft">
                          {row.momento}
                        </td>
                        {DAYS.map((day) => (
                          <td key={day} className="border-b border-brand-divider px-3 py-2.5 text-brand-ink">
                            {row[day] === '-' ? <span className="text-brand-ink-soft">—</span> : row[day]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      <button
        type="button"
        onClick={() => navigate(`/escalas/escola/${schoolId}/escalas`)}
        className="h-11 w-fit rounded-full border border-brand-border bg-white px-5 text-sm font-semibold text-brand-ink hover:bg-brand-muted"
      >
        Voltar para Minhas escalas
      </button>
    </div>
  )
}
