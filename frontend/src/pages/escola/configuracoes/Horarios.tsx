import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../../components/ui'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { TimeSlot } from '../../../types'

export function Horarios() {
  const { currentSchool } = useSchool()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api
      .listTimeSlots(currentSchool.id)
      .then(({ timeSlots }) => setTimeSlots(timeSlots))
      .finally(() => setIsLoading(false))
  }, [currentSchool])

  if (!currentSchool) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentSchool) return
    setIsSubmitting(true)

    try {
      const { timeSlot } = await api.createTimeSlot({
        schoolId: currentSchool.id,
        label,
        startTime,
        endTime,
        order: timeSlots.length,
      })
      setTimeSlots((current) => [...current, timeSlot])
      setLabel('')
      setStartTime('')
      setEndTime('')
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await api.deleteTimeSlot(id)
      setTimeSlots((current) => current.filter((slot) => slot.id !== id))
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
          <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">Horários</h1>
          <p className="mt-2 text-sm text-brand-ink-soft">
            Os momentos configurados aqui definem as colunas das grades de disponibilidade.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink"
        >
          + Novo horário
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-ink-soft">Carregando horários...</p>
      ) : timeSlots.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">Nenhum horário cadastrado ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 rounded-[28px] bg-white p-5">
          {timeSlots.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between rounded-2xl border border-brand-divider px-4 py-3">
              <div>
                <p className="text-[14.5px] font-semibold text-brand-ink">{slot.label}</p>
                <p className="text-[13px] text-brand-ink-soft">
                  {slot.startTime} – {slot.endTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(slot.id)}
                disabled={deletingId === slot.id}
                className="text-sm font-semibold text-brand-error-ink hover:underline disabled:opacity-50"
              >
                {deletingId === slot.id ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo horário">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="horario-nome" className="text-sm font-semibold text-brand-ink">
              Nome do momento
            </label>
            <input
              id="horario-nome"
              required
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Ex.: Aula 1"
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="horario-inicio" className="text-sm font-semibold text-brand-ink">
                Início
              </label>
              <input
                id="horario-inicio"
                type="time"
                required
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="horario-fim" className="text-sm font-semibold text-brand-ink">
                Fim
              </label>
              <input
                id="horario-fim"
                type="time"
                required
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 rounded-full bg-brand-primary text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar horário'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
