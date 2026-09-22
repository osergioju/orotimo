import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, EmptyState, Input } from '../../../components/ui'
import { useSchool } from '../../../contexts/SchoolContext'

const STEPS = ['Informações', 'Professores', 'Turmas', 'Horários', 'Regras', 'Gerar', 'Resultado'] as const

export function NewSchedule() {
  const { currentSchool } = useSchool()
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState({ name: '', period: '', unit: '', academicYear: '' })
  const [isGenerating, setIsGenerating] = useState(false)

  if (!currentSchool) return null

  const isLastStep = stepIndex === STEPS.length - 1
  const isGenerateStep = STEPS[stepIndex] === 'Gerar'

  function goNext() {
    if (isGenerateStep) {
      setIsGenerating(true)
      setTimeout(() => {
        setIsGenerating(false)
        setStepIndex((index) => index + 1)
      }, 1200)
      return
    }
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1))
  }

  function goBack() {
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900">Nova escala</h1>

      <ol className="flex flex-wrap gap-2">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
              index === stepIndex
                ? 'bg-indigo-600 text-white'
                : index < stepIndex
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span>{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <Card>
        <CardBody>
          {STEPS[stepIndex] === 'Informações' && (
            <form
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault()
                goNext()
              }}
            >
              <Input
                label="Nome"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
              <Input
                label="Período"
                value={form.period}
                onChange={(event) => setForm({ ...form, period: event.target.value })}
              />
              <Input
                label="Unidade"
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
              />
              <Input
                label="Ano letivo"
                value={form.academicYear}
                onChange={(event) => setForm({ ...form, academicYear: event.target.value })}
              />
              <div className="sm:col-span-2">
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          )}

          {['Professores', 'Turmas', 'Horários', 'Regras'].includes(STEPS[stepIndex]) && (
            <EmptyState
              icon="🧩"
              title={`Etapa "${STEPS[stepIndex]}" em preparação`}
              description="Os cadastros e regras desta etapa serão conectados quando o motor de otimização for implementado."
            />
          )}

          {isGenerateStep && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              {isGenerating ? (
                <>
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  <p className="text-sm text-slate-500">Gerando escala (simulado)...</p>
                </>
              ) : (
                <>
                  <div className="text-3xl">⚙️</div>
                  <p className="text-sm text-slate-500">
                    O solver de otimização ainda não foi implementado. Clique em continuar para simular o resultado.
                  </p>
                </>
              )}
            </div>
          )}

          {STEPS[stepIndex] === 'Resultado' && (
            <EmptyState
              icon="✅"
              title="Escala gerada (dados ilustrativos)"
              description="Nesta etapa o motor apresentará múltiplas soluções comparáveis. Por enquanto, veja o estado final da navegação."
              action={
                <Button onClick={() => navigate(`/escalas/escola/${currentSchool.id}/escalas`)}>
                  Ir para Minhas escalas
                </Button>
              }
            />
          )}

          {!isLastStep && (
            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={goBack} disabled={stepIndex === 0}>
                Voltar
              </Button>
              {STEPS[stepIndex] !== 'Informações' && (
                <Button onClick={goNext} disabled={isGenerating}>
                  {isGenerateStep ? 'Gerar escala' : 'Continuar'}
                </Button>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
