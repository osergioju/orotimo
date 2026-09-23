import { useEffect, useState, type FormEvent } from 'react'
import { Badge, Modal } from '../../../components/ui'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { Rule, RuleType } from '../../../types'

export function Regras() {
  const { currentSchool } = useSchool()
  const [rules, setRules] = useState<Rule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [type, setType] = useState<RuleType>('soft')
  const [weight, setWeight] = useState('5')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api
      .listRules(currentSchool.id)
      .then(({ rules }) => setRules(rules))
      .finally(() => setIsLoading(false))
  }, [currentSchool])

  if (!currentSchool) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentSchool) return
    setIsSubmitting(true)

    try {
      const { rule } = await api.createRule({
        schoolId: currentSchool.id,
        description,
        type,
        weight: Number(weight) || 5,
      })
      setRules((current) => [...current, rule])
      setDescription('')
      setType('soft')
      setWeight('5')
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await api.deleteRule(id)
      setRules((current) => current.filter((rule) => rule.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Configurações</span>
          </div>
          <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">Regras</h1>
          <p className="mt-2 text-sm text-brand-ink-soft">
            Regras obrigatórias (hard) e preferências (soft) que o motor de otimização usará no futuro.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink"
        >
          + Nova regra
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-ink-soft">Carregando regras...</p>
      ) : rules.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">Nenhuma regra cadastrada ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 rounded-[28px] bg-white p-5">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between gap-4 rounded-2xl border border-brand-divider px-4 py-3">
              <div className="flex items-center gap-3">
                <Badge tone={rule.type === 'hard' ? 'warning' : 'info'}>{rule.type === 'hard' ? 'Obrigatória' : `Preferência · peso ${rule.weight}`}</Badge>
                <p className="text-[14.5px] text-brand-ink">{rule.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(rule.id)}
                disabled={deletingId === rule.id}
                className="shrink-0 text-sm font-semibold text-brand-error-ink hover:underline disabled:opacity-50"
              >
                {deletingId === rule.id ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova regra">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="regra-descricao" className="text-sm font-semibold text-brand-ink">
              Descrição
            </label>
            <textarea
              id="regra-descricao"
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: Evitar janelas na grade dos professores"
              rows={3}
              className="rounded-xl border border-brand-border bg-brand-input p-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-brand-ink">Tipo</span>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-brand-muted p-[5px]">
              {(['soft', 'hard'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={`h-10 rounded-full text-sm font-semibold transition-colors ${
                    type === option ? 'bg-brand-ink text-white' : 'text-brand-ink-soft'
                  }`}
                >
                  {option === 'hard' ? 'Obrigatória' : 'Preferência'}
                </button>
              ))}
            </div>
          </div>
          {type === 'soft' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="regra-peso" className="text-sm font-semibold text-brand-ink">
                Peso (1–10)
              </label>
              <input
                id="regra-peso"
                type="number"
                min={1}
                max={10}
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 rounded-full bg-brand-primary text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar regra'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
