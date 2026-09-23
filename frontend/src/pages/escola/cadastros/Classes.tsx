import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../../components/ui'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { Class } from '../../../types'

const SHIFTS = ['Manhã', 'Tarde', 'Noite', 'Integral']

export function Classes() {
  const { currentSchool } = useSchool()
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [shift, setShift] = useState(SHIFTS[0])
  const [studentsCount, setStudentsCount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api
      .listClasses(currentSchool.id)
      .then(({ classes }) => setClasses(classes))
      .finally(() => setIsLoading(false))
  }, [currentSchool])

  if (!currentSchool) return null

  function openCreateModal() {
    setEditingId(null)
    setName('')
    setShift(SHIFTS[0])
    setStudentsCount('')
    setIsModalOpen(true)
  }

  function openEditModal(klass: Class) {
    setEditingId(klass.id)
    setName(klass.name)
    setShift(klass.shift)
    setStudentsCount(klass.studentsCount ? String(klass.studentsCount) : '')
    setIsModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentSchool) return
    setIsSubmitting(true)

    try {
      const payload = { name, shift, studentsCount: studentsCount ? Number(studentsCount) : undefined }

      if (editingId) {
        const { class: updated } = await api.updateClass(editingId, payload)
        setClasses((current) => current.map((item) => (item.id === editingId ? updated : item)))
      } else {
        const { class: created } = await api.createClass({ schoolId: currentSchool.id, ...payload })
        setClasses((current) => [...current, created])
      }

      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta turma?')) return
    setDeletingId(id)
    try {
      await api.deleteClass(id)
      setClasses((current) => current.filter((item) => item.id !== id))
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
          <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">Turmas</h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink"
        >
          + Nova turma
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-ink-soft">Carregando turmas...</p>
      ) : classes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">Nenhuma turma cadastrada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((klass) => (
            <div key={klass.id} className="flex flex-col gap-3 rounded-[24px] bg-white p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-canvas text-brand-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3 2.5 8 12 13l9.5-5z" />
                    <path d="m2.5 12.5 9.5 5 9.5-5" />
                  </svg>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(klass)}
                    aria-label="Editar turma"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink-soft hover:bg-brand-canvas hover:text-brand-primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(klass.id)}
                    disabled={deletingId === klass.id}
                    aria-label="Remover turma"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink-soft hover:bg-red-50 hover:text-brand-error disabled:opacity-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-brand-ink">{klass.name}</p>
                <p className="mt-1 text-sm text-brand-ink-soft">
                  {klass.shift}
                  {klass.studentsCount ? ` · ${klass.studentsCount} alunos` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar turma' : 'Nova turma'}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="turma-nome" className="text-sm font-semibold text-brand-ink">
              Nome da turma
            </label>
            <input
              id="turma-nome"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: 7º Ano A"
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="turma-turno" className="text-sm font-semibold text-brand-ink">
              Turno
            </label>
            <select
              id="turma-turno"
              value={shift}
              onChange={(event) => setShift(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            >
              {SHIFTS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="turma-alunos" className="text-sm font-semibold text-brand-ink">
              Quantidade de alunos
            </label>
            <input
              id="turma-alunos"
              type="number"
              min={0}
              value={studentsCount}
              onChange={(event) => setStudentsCount(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 rounded-full bg-brand-primary text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar turma'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
