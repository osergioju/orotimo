import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../../components/ui'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { Assignment, Class, Subject, Teacher } from '../../../types'

export function Atribuicoes() {
  const { currentSchool } = useSchool()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [weeklyMinClasses, setWeeklyMinClasses] = useState('2')
  const [dailyMaxClasses, setDailyMaxClasses] = useState('2')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    Promise.all([
      api.listAssignments(currentSchool.id),
      api.listClasses(currentSchool.id),
      api.listSubjects(currentSchool.id),
      api.listTeachers(currentSchool.id),
    ])
      .then(([assignmentsRes, classesRes, subjectsRes, teachersRes]) => {
        setAssignments(assignmentsRes.assignments)
        setClasses(classesRes.classes)
        setSubjects(subjectsRes.subjects)
        setTeachers(teachersRes.teachers)
      })
      .finally(() => setIsLoading(false))
  }, [currentSchool])

  if (!currentSchool) return null

  function openCreateModal() {
    setEditingId(null)
    setClassId(classes[0]?.id ?? '')
    setSubjectId(subjects[0]?.id ?? '')
    setTeacherId(teachers[0]?.id ?? '')
    setWeeklyMinClasses('2')
    setDailyMaxClasses('2')
    setError(null)
    setIsModalOpen(true)
  }

  function openEditModal(assignment: Assignment) {
    setEditingId(assignment.id)
    setClassId(assignment.classId)
    setSubjectId(assignment.subjectId)
    setTeacherId(assignment.teacherId)
    setWeeklyMinClasses(String(assignment.weeklyMinClasses))
    setDailyMaxClasses(String(assignment.dailyMaxClasses))
    setError(null)
    setIsModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentSchool) return
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        classId,
        subjectId,
        teacherId,
        weeklyMinClasses: Number(weeklyMinClasses) || 1,
        dailyMaxClasses: Number(dailyMaxClasses) || 1,
      }

      if (editingId) {
        const { assignment: updated } = await api.updateAssignment(editingId, payload)
        setAssignments((current) => current.map((item) => (item.id === editingId ? updated : item)))
      } else {
        const { assignment: created } = await api.createAssignment({ schoolId: currentSchool.id, ...payload })
        setAssignments((current) => [...current, created])
      }

      setIsModalOpen(false)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível salvar a atribuição.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta atribuição?')) return
    setDeletingId(id)
    try {
      await api.deleteAssignment(id)
      setAssignments((current) => current.filter((item) => item.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  function nameOf(list: { id: string; name: string }[], id: string) {
    return list.find((item) => item.id === id)?.name ?? '—'
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Configurações</span>
          </div>
          <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">Atribuições</h1>
          <p className="mt-2 text-sm text-brand-ink-soft">
            Defina qual professor ministra cada disciplina em cada turma — é isso que o solver usa para montar a grade.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          disabled={classes.length === 0 || subjects.length === 0 || teachers.length === 0}
          className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Nova atribuição
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-ink-soft">Carregando atribuições...</p>
      ) : classes.length === 0 || subjects.length === 0 || teachers.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">
            Cadastre ao menos uma turma, uma disciplina e um professor antes de criar atribuições.
          </p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">Nenhuma atribuição cadastrada ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 rounded-[28px] bg-white p-5">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-brand-divider px-4 py-3"
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-[14.5px] font-semibold text-brand-ink">
                  {nameOf(teachers, assignment.teacherId)} · {nameOf(subjects, assignment.subjectId)}
                </p>
                <p className="text-sm text-brand-ink-soft">
                  Turma {nameOf(classes, assignment.classId)} · {assignment.weeklyMinClasses} aulas/semana · máx.{' '}
                  {assignment.dailyMaxClasses}/dia
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => openEditModal(assignment)}
                  className="text-sm font-semibold text-brand-primary hover:underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(assignment.id)}
                  disabled={deletingId === assignment.id}
                  className="text-sm font-semibold text-brand-error-ink hover:underline disabled:opacity-50"
                >
                  {deletingId === assignment.id ? 'Removendo...' : 'Remover'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar atribuição' : 'Nova atribuição'}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-brand-error-ink">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="atrib-turma" className="text-sm font-semibold text-brand-ink">
              Turma
            </label>
            <select
              id="atrib-turma"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            >
              {classes.map((klass) => (
                <option key={klass.id} value={klass.id}>
                  {klass.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="atrib-disciplina" className="text-sm font-semibold text-brand-ink">
              Disciplina
            </label>
            <select
              id="atrib-disciplina"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="atrib-professor" className="text-sm font-semibold text-brand-ink">
              Professor
            </label>
            <select
              id="atrib-professor"
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="atrib-min" className="text-sm font-semibold text-brand-ink">
                Aulas/semana
              </label>
              <input
                id="atrib-min"
                type="number"
                min={1}
                value={weeklyMinClasses}
                onChange={(event) => setWeeklyMinClasses(event.target.value)}
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="atrib-max" className="text-sm font-semibold text-brand-ink">
                Máx. aulas/dia
              </label>
              <input
                id="atrib-max"
                type="number"
                min={1}
                value={dailyMaxClasses}
                onChange={(event) => setDailyMaxClasses(event.target.value)}
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 rounded-full bg-brand-primary text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar atribuição'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
