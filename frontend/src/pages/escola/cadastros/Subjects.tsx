import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../../components/ui'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { Subject } from '../../../types'

export function Subjects() {
  const { currentSchool } = useSchool()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [weeklyHours, setWeeklyHours] = useState('2')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api
      .listSubjects(currentSchool.id)
      .then(({ subjects }) => setSubjects(subjects))
      .finally(() => setIsLoading(false))
  }, [currentSchool])

  if (!currentSchool) return null

  function openCreateModal() {
    setEditingId(null)
    setName('')
    setWeeklyHours('2')
    setIsModalOpen(true)
  }

  function openEditModal(subject: Subject) {
    setEditingId(subject.id)
    setName(subject.name)
    setWeeklyHours(String(subject.weeklyHours))
    setIsModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentSchool) return
    setIsSubmitting(true)

    try {
      const payload = { name, weeklyHours: Number(weeklyHours) || 2 }

      if (editingId) {
        const { subject: updated } = await api.updateSubject(editingId, payload)
        setSubjects((current) => current.map((item) => (item.id === editingId ? updated : item)))
      } else {
        const { subject: created } = await api.createSubject({ schoolId: currentSchool.id, ...payload })
        setSubjects((current) => [...current, created])
      }

      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta disciplina?')) return
    setDeletingId(id)
    try {
      await api.deleteSubject(id)
      setSubjects((current) => current.filter((item) => item.id !== id))
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
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Cadastros</span>
          </div>
          <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">Disciplinas</h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink"
        >
          + Nova disciplina
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-ink-soft">Carregando disciplinas...</p>
      ) : subjects.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">Nenhuma disciplina cadastrada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex flex-col gap-3 rounded-[24px] bg-white p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-canvas text-brand-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
                    <path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20" />
                  </svg>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(subject)}
                    aria-label="Editar disciplina"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink-soft hover:bg-brand-canvas hover:text-brand-primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(subject.id)}
                    disabled={deletingId === subject.id}
                    aria-label="Remover disciplina"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink-soft hover:bg-red-50 hover:text-brand-error disabled:opacity-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-brand-ink">{subject.name}</p>
                <p className="mt-1 text-sm text-brand-ink-soft">{subject.weeklyHours}h semanais</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar disciplina' : 'Nova disciplina'}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="disciplina-nome" className="text-sm font-semibold text-brand-ink">
              Nome da disciplina
            </label>
            <input
              id="disciplina-nome"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Matemática"
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="disciplina-horas" className="text-sm font-semibold text-brand-ink">
              Carga horária semanal
            </label>
            <input
              id="disciplina-horas"
              type="number"
              min={1}
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 rounded-full bg-brand-primary text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar disciplina'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
