import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { Class, Rule, Teacher, TimeSlot } from '../../../types'

const STEPS = ['Informações', 'Professores', 'Turmas', 'Horários', 'Regras', 'Gerar', 'Resultado'] as const

export function NewSchedule() {
  const { currentSchool } = useSchool()
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState({ name: '', period: 'Anual', academicYear: String(new Date().getFullYear() + 1) })
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [scheduleName, setScheduleName] = useState('')

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [generateStatus, setGenerateStatus] = useState<'success' | 'infeasible' | 'error' | null>(null)
  const [generateMessages, setGenerateMessages] = useState<{ mensagens: string[]; dica: string }[]>([])
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api.listTeachers(currentSchool.id).then(({ teachers }) => setTeachers(teachers))
    api.listClasses(currentSchool.id).then(({ classes }) => setClasses(classes))
    api.listTimeSlots(currentSchool.id).then(({ timeSlots }) => setTimeSlots(timeSlots))
    api.listRules(currentSchool.id).then(({ rules }) => setRules(rules))
  }, [currentSchool])

  if (!currentSchool) return null

  const isLastStep = stepIndex === STEPS.length - 1
  const isGenerateStep = STEPS[stepIndex] === 'Gerar'

  async function handleCreateSchedule() {
    if (!currentSchool) return
    setIsSubmittingInfo(true)
    try {
      const { schedule } = await api.createSchedule({
        schoolId: currentSchool.id,
        name: form.name,
        period: form.period,
        academicYear: form.academicYear,
      })
      setScheduleId(schedule.id)
      setScheduleName(schedule.name)
      setStepIndex((index) => index + 1)
    } finally {
      setIsSubmittingInfo(false)
    }
  }

  async function goNext() {
    if (isGenerateStep) {
      if (!scheduleId) return
      setIsGenerating(true)
      setGenerateError(null)
      try {
        const result = await api.generateSchedule(scheduleId)
        setGenerateStatus(result.status)
        setGenerateMessages(result.messages)
      } catch (error) {
        setGenerateStatus('error')
        setGenerateError(error instanceof Error ? error.message : 'Erro ao gerar escala')
      } finally {
        setIsGenerating(false)
        setStepIndex((index) => index + 1)
      }
      return
    }
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1))
  }

  function goBack() {
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Escalas</span>
        </div>
        <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">Nova escala</h1>
      </div>

      <ol className="flex flex-wrap gap-2">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              index === stepIndex
                ? 'bg-brand-primary text-white'
                : index < stepIndex
                  ? 'bg-brand-canvas text-brand-primary'
                  : 'bg-brand-muted text-brand-ink-soft'
            }`}
          >
            <span>{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="flex-1 rounded-[28px] bg-white p-6 sm:p-8">
        {STEPS[stepIndex] === 'Informações' && (
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              handleCreateSchedule()
            }}
          >
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="escala-nome" className="text-sm font-semibold text-brand-ink">
                Nome
              </label>
              <input
                id="escala-nome"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ex.: Grade 2027"
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="escala-periodo" className="text-sm font-semibold text-brand-ink">
                Período
              </label>
              <input
                id="escala-periodo"
                value={form.period}
                onChange={(event) => setForm({ ...form, period: event.target.value })}
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="escala-ano" className="text-sm font-semibold text-brand-ink">
                Ano letivo
              </label>
              <input
                id="escala-ano"
                value={form.academicYear}
                onChange={(event) => setForm({ ...form, academicYear: event.target.value })}
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSubmittingInfo}
                className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmittingInfo ? 'Salvando...' : 'Continuar'}
              </button>
            </div>
          </form>
        )}

        {STEPS[stepIndex] === 'Professores' && (
          <SummaryStep
            title="Professores"
            description="Professores cadastrados nesta escola que poderão ser escalados."
            items={teachers.map((t) => t.name)}
            emptyHint="Cadastre professores em Cadastros → Professores."
          />
        )}

        {STEPS[stepIndex] === 'Turmas' && (
          <SummaryStep
            title="Turmas"
            description="Turmas cadastradas nesta escola."
            items={classes.map((c) => c.name)}
            emptyHint="Cadastre turmas em Cadastros → Turmas."
          />
        )}

        {STEPS[stepIndex] === 'Horários' && (
          <SummaryStep
            title="Horários"
            description="Momentos configurados para montar a grade."
            items={timeSlots.map((t) => `${t.label} (${t.startTime}–${t.endTime})`)}
            emptyHint="Cadastre horários em Configurações → Horários."
          />
        )}

        {STEPS[stepIndex] === 'Regras' && (
          <SummaryStep
            title="Regras"
            description="Regras obrigatórias e preferências configuradas."
            items={rules.map((r) => `${r.type === 'hard' ? '[Obrigatória]' : `[Preferência · ${r.weight}]`} ${r.description}`)}
            emptyHint="Cadastre regras em Configurações → Regras."
          />
        )}

        {isGenerateStep && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            {isGenerating ? (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                <p className="text-sm text-brand-ink-soft">Rodando o solver de otimização...</p>
              </>
            ) : (
              <>
                <div className="text-3xl">⚙️</div>
                <p className="max-w-md text-sm text-brand-ink-soft">
                  O solver vai buscar professores, turmas, disciplinas, horários e atribuições cadastrados e montar a
                  grade. Clique em "Gerar escala" para rodar.
                </p>
              </>
            )}
          </div>
        )}

        {STEPS[stepIndex] === 'Resultado' && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            {generateStatus === 'success' ? (
              <>
                <div className="text-3xl">✅</div>
                <p className="font-display text-lg font-semibold text-brand-ink">{scheduleName || 'Escala'} gerada</p>
                <p className="max-w-md text-sm text-brand-ink-soft">
                  O solver encontrou uma grade viável. Veja o resultado completo na página da escala.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/escalas/escola/${currentSchool.id}/escalas/${scheduleId}`)}
                  className="mt-2 h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white hover:bg-brand-ink"
                >
                  Ver escala gerada
                </button>
              </>
            ) : (
              <>
                <div className="text-3xl">⚠️</div>
                <p className="font-display text-lg font-semibold text-brand-ink">Não foi possível gerar a escala</p>
                {generateError && <p className="max-w-md text-sm text-brand-error-ink">{generateError}</p>}
                <div className="flex w-full max-w-md flex-col gap-2 text-left">
                  {generateMessages.map((problem, index) => (
                    <div key={index} className="rounded-2xl bg-red-50 p-4">
                      <ul className="list-disc pl-5 text-sm text-brand-error-ink">
                        {problem.mensagens.map((mensagem, i) => (
                          <li key={i}>{mensagem}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/escalas/escola/${currentSchool.id}/configuracoes/atribuicoes`)}
                  className="mt-2 h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white hover:bg-brand-ink"
                >
                  Ajustar atribuições
                </button>
              </>
            )}
          </div>
        )}

        {!isLastStep && STEPS[stepIndex] !== 'Informações' && (
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="h-11 rounded-full border border-brand-border bg-white px-5 text-sm font-semibold text-brand-ink hover:bg-brand-muted disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={isGenerating}
              className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerateStep ? 'Gerar escala' : 'Continuar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryStep({
  title,
  description,
  items,
  emptyHint,
}: {
  title: string
  description: string
  items: string[]
  emptyHint: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-brand-ink">{title}</h2>
        <p className="mt-1 text-sm text-brand-ink-soft">{description}</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-brand-dashed bg-brand-input p-6 text-center text-sm text-brand-ink-soft">
          {emptyHint}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={index} className="rounded-xl bg-brand-input px-4 py-2.5 text-sm text-brand-ink">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
