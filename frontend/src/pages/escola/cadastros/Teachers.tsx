import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { ContractType, Shift, Teacher } from '../../../types'

const DISCIPLINAS = ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Português', 'Inglês']
const TURNOS = ['Manhã', 'Tarde', 'Noite', 'Integral'] as const
const CPF_PATTERN = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 border-b border-brand-divider py-3 last:border-b-0">
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[14.5px] font-semibold text-brand-ink">{label}</span>
        <span className="text-[13px] text-brand-ink-soft">{description}</span>
      </span>
      <span className="relative block h-[30px] w-[52px] shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className={`absolute inset-0 rounded-full transition-colors ${checked ? 'bg-brand-primary' : 'bg-[#C3CAE2]'}`}
        >
          <span
            className={`absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(22,33,91,0.25)] transition-transform ${
              checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
            }`}
          />
        </span>
      </span>
    </label>
  )
}

export function Teachers() {
  const { currentSchool } = useSchool()
  const navigate = useNavigate()

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [cpfTouched, setCpfTouched] = useState(false)
  const [unidade, setUnidade] = useState(0)
  const [disciplinas, setDisciplinas] = useState<string[]>(['Matemática', 'Física'])
  const [contrato, setContrato] = useState('')
  const [cargaHoraria, setCargaHoraria] = useState(20)
  const [turno, setTurno] = useState<(typeof TURNOS)[number]>('Manhã')
  const [aulasGeminadas, setAulasGeminadas] = useState(true)
  const [evitarJanelas, setEvitarJanelas] = useState(true)
  const [avisosEmail, setAvisosEmail] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api
      .listTeachers(currentSchool.id)
      .then(({ teachers }) => setTeachers(teachers))
      .finally(() => setIsLoadingTeachers(false))
  }, [currentSchool])

  if (!currentSchool) return null

  const cpfInvalid = cpfTouched && cpf.length > 0 && !CPF_PATTERN.test(cpf)

  function toggleDisciplina(disciplina: string) {
    setDisciplinas((current) =>
      current.includes(disciplina) ? current.filter((item) => item !== disciplina) : [...current, disciplina],
    )
  }

  function resetForm() {
    setEditingId(null)
    setNome('')
    setNascimento('')
    setEmail('')
    setTelefone('')
    setCpf('')
    setCpfTouched(false)
    setDisciplinas([])
    setContrato('')
    setCargaHoraria(20)
    setTurno('Manhã')
    setAulasGeminadas(true)
    setEvitarJanelas(true)
    setAvisosEmail(false)
    setObservacoes('')
  }

  function startEdit(teacher: Teacher) {
    setEditingId(teacher.id)
    setNome(teacher.name)
    setNascimento(teacher.birthDate ? teacher.birthDate.slice(0, 10) : '')
    setEmail(teacher.email)
    setTelefone(teacher.phone ?? '')
    setCpf(teacher.cpf ?? '')
    setCpfTouched(false)
    setUnidade(teacher.unit.includes('Unidade Norte') ? 1 : 0)
    setDisciplinas(teacher.subjects)
    setContrato(teacher.contractType ?? '')
    setCargaHoraria(teacher.maxWeeklyClasses)
    setTurno(teacher.preferredShift as (typeof TURNOS)[number])
    setAulasGeminadas(teacher.twinClasses)
    setEvitarJanelas(teacher.avoidGaps)
    setAvisosEmail(teacher.emailNotifications)
    setObservacoes(teacher.notes ?? '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    if (editingId) {
      resetForm()
    } else if (currentSchool) {
      navigate(`/escalas/escola/${currentSchool.id}`)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este professor? Isso também apaga a disponibilidade cadastrada dele.')) return
    setDeletingId(id)
    try {
      await api.deleteTeacher(id)
      setTeachers((current) => current.filter((item) => item.id !== id))
      if (editingId === id) resetForm()
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentSchool) return
    setIsSubmitting(true)

    try {
      const payload = {
        name: nome,
        email,
        phone: telefone || undefined,
        cpf: cpf || undefined,
        birthDate: nascimento || undefined,
        unit: unidade === 0 ? `${currentSchool.name} · Sede` : `${currentSchool.name} · Unidade Norte`,
        subjects: disciplinas,
        contractType: (contrato || undefined) as ContractType | undefined,
        maxWeeklyClasses: cargaHoraria,
        preferredShift: turno as Shift,
        twinClasses: aulasGeminadas,
        avoidGaps: evitarJanelas,
        emailNotifications: avisosEmail,
        notes: observacoes || undefined,
      }

      if (editingId) {
        const { teacher } = await api.updateTeacher(editingId, payload)
        setTeachers((current) => current.map((item) => (item.id === editingId ? teacher : item)))
        setSavedMessage(`${teacher.name} atualizado com sucesso.`)
      } else {
        const { teacher } = await api.createTeacher({ schoolId: currentSchool.id, ...payload })
        setTeachers((current) => [...current, teacher])
        setSavedMessage(`${teacher.name} cadastrado com sucesso.`)
      }

      resetForm()
      setTimeout(() => setSavedMessage(null), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* Título + ações */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 text-[14.5px] text-brand-ink-soft">
            <span>Professores</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
            <span className="font-semibold text-brand-ink">{editingId ? 'Editar professor' : 'Novo professor'}</span>
          </div>
          <h1 className="mt-4 font-display text-[38px] font-semibold leading-[1.1] tracking-tight text-brand-ink">
            {editingId ? 'Editar professor' : 'Novo professor'}
          </h1>
          <p className="mt-2.5 text-[15px] text-brand-ink-soft">Campos com * são obrigatórios.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-14 items-center rounded-full bg-white px-[26px] text-[15px] font-semibold text-brand-ink hover:bg-brand-muted"
          >
            {editingId ? 'Cancelar edição' : 'Cancelar'}
          </button>
          <button
            type="submit"
            form="form-prof"
            disabled={isSubmitting}
            className="flex h-14 items-center gap-4 rounded-full bg-brand-primary py-0 pl-[26px] pr-2 text-[15px] font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar professor'}
            <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-brand-orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16215B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white">{savedMessage}</div>
      )}

      {!isLoadingTeachers && teachers.length > 0 && (
        <div className="flex flex-col gap-3 rounded-[28px] bg-white p-5">
          <span className="text-sm font-semibold text-brand-ink-soft">
            Professores cadastrados nesta escola ({teachers.length})
          </span>
          <div className="flex flex-col gap-2">
            {teachers.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition-colors ${
                  editingId === item.id ? 'border-brand-primary bg-brand-canvas' : 'border-brand-divider'
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-lilac font-display text-[12px] font-semibold text-brand-ink">
                  {item.name.replace(/^(Profa?\.|Professor(a)?)\s+/i, '').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold text-brand-ink">{item.name}</p>
                  <p className="truncate text-[12.5px] text-brand-ink-soft">{item.subjects.join(' · ') || 'Sem disciplinas'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-brand-border px-3 text-[13px] font-semibold text-brand-ink hover:bg-brand-muted"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink-soft hover:bg-red-50 hover:text-brand-error disabled:opacity-50"
                  aria-label="Remover professor"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário */}
      <form id="form-prof" onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Dados pessoais */}
          <section className="flex flex-col gap-6 rounded-[28px] bg-white p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-primary font-display text-[13px] font-semibold text-white">
                01
              </span>
              <h2 className="m-0 font-display text-[19px] font-semibold text-brand-ink">Dados pessoais</h2>
            </div>

            <div className="grid grid-cols-1 gap-x-[18px] gap-y-5 sm:grid-cols-3">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="nome" className="text-sm font-semibold text-brand-ink">
                  Nome completo *
                </label>
                <input
                  id="nome"
                  type="text"
                  autoComplete="name"
                  placeholder="Ex.: Ana Ribeiro"
                  required
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="h-[50px] rounded-2xl border border-brand-border bg-brand-input px-4 text-[15px] font-medium text-brand-ink outline-none placeholder:text-brand-placeholder placeholder:font-normal hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="nasc" className="text-sm font-semibold text-brand-ink">
                  Data de nascimento
                </label>
                <input
                  id="nasc"
                  type="date"
                  value={nascimento}
                  onChange={(event) => setNascimento(event.target.value)}
                  className="h-[50px] rounded-2xl border border-brand-border bg-brand-input px-4 text-[15px] font-medium text-brand-ink outline-none hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="mail" className="text-sm font-semibold text-brand-ink">
                  E-mail *
                </label>
                <input
                  id="mail"
                  type="email"
                  autoComplete="email"
                  placeholder="nome@escola.com.br"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-[50px] rounded-2xl border border-brand-border bg-brand-input px-4 text-[15px] font-medium text-brand-ink outline-none placeholder:text-brand-placeholder placeholder:font-normal hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
                />
                <span className="text-[13px] text-brand-ink-soft">Usado para login e avisos.</span>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="tel" className="text-sm font-semibold text-brand-ink">
                  Telefone
                </label>
                <input
                  id="tel"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(11) 90000-0000"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                  className="h-[50px] rounded-2xl border border-brand-border bg-brand-input px-4 text-[15px] font-medium text-brand-ink outline-none placeholder:text-brand-placeholder placeholder:font-normal hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cpf" className="text-sm font-semibold text-brand-ink">
                  CPF *
                </label>
                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  required
                  value={cpf}
                  onChange={(event) => setCpf(event.target.value)}
                  onBlur={() => setCpfTouched(true)}
                  aria-invalid={cpfInvalid}
                  aria-describedby={cpfInvalid ? 'cpf-erro' : undefined}
                  className={`h-[50px] rounded-2xl border px-4 text-[15px] font-medium text-brand-ink outline-none placeholder:text-brand-placeholder placeholder:font-normal hover:border-brand-lilac focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)] ${
                    cpfInvalid ? 'border-brand-error bg-[#FFF6F2] focus:border-brand-error' : 'border-brand-border bg-brand-input focus:border-brand-primary'
                  }`}
                />
                {cpfInvalid && (
                  <span id="cpf-erro" className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-error-ink">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7.5v5.5M12 16.5h.01" />
                    </svg>
                    CPF inválido. Use o formato 000.000.000-00.
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="matricula" className="text-sm font-semibold text-brand-ink">
                  Matrícula
                </label>
                <input
                  id="matricula"
                  type="text"
                  value={editingId ? 'Já gerada' : 'Gerada ao salvar'}
                  disabled
                  className="h-[50px] cursor-not-allowed rounded-2xl border border-[#E0E5F2] bg-[#EEF1F8] px-4 text-[15px] font-medium text-brand-ink-soft outline-none"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="unidade" className="text-sm font-semibold text-brand-ink">
                  Unidade *
                </label>
                <div className="relative">
                  <select
                    id="unidade"
                    value={unidade}
                    onChange={(event) => setUnidade(Number(event.target.value))}
                    className="h-[50px] w-full cursor-pointer appearance-none rounded-2xl border border-brand-border bg-brand-input py-0 pl-4 pr-11 text-[15px] font-medium text-brand-ink outline-none hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
                  >
                    <option value={0}>{currentSchool.name} · Sede</option>
                    <option value={1}>{currentSchool.name} · Unidade Norte</option>
                  </select>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-4 top-[15px] text-brand-primary" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Atuação */}
          <section className="flex flex-1 flex-col gap-6 rounded-[28px] bg-white p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-primary font-display text-[13px] font-semibold text-white">
                02
              </span>
              <h2 className="m-0 font-display text-[19px] font-semibold text-brand-ink">Atuação</h2>
            </div>

            <fieldset className="m-0 flex flex-col gap-3 border-none p-0">
              <legend className="mb-3 p-0 text-sm font-semibold text-brand-ink">Disciplinas *</legend>
              <div className="flex flex-wrap gap-2.5">
                {DISCIPLINAS.map((disciplina) => {
                  const active = disciplinas.includes(disciplina)
                  return (
                    <label key={disciplina} className="relative inline-flex cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleDisciplina(disciplina)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      <span
                        className={`flex h-11 items-center rounded-full border px-[18px] text-[14.5px] font-semibold transition-colors ${
                          active ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-border bg-brand-input text-brand-ink'
                        }`}
                      >
                        {disciplina}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="contrato" className="text-sm font-semibold text-brand-ink">
                  Tipo de contrato
                </label>
                <div className="relative">
                  <select
                    id="contrato"
                    value={contrato}
                    onChange={(event) => setContrato(event.target.value)}
                    className="h-[50px] w-full cursor-pointer appearance-none rounded-2xl border border-brand-border bg-brand-input py-0 pl-4 pr-11 text-[15px] font-medium text-brand-ink outline-none hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
                  >
                    <option value="">Selecione</option>
                    <option>CLT</option>
                    <option>PJ</option>
                    <option>Temporário</option>
                  </select>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-4 top-[15px] text-brand-primary" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="carga" className="text-sm font-semibold text-brand-ink">
                  Carga horária máxima
                </label>
                <div className="relative">
                  <input
                    id="carga"
                    type="number"
                    min={1}
                    max={44}
                    value={cargaHoraria}
                    onChange={(event) => setCargaHoraria(Number(event.target.value))}
                    className="h-[50px] w-full rounded-2xl border border-brand-border bg-brand-input py-0 pl-4 pr-[120px] text-[15px] font-medium text-brand-ink outline-none hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
                  />
                  <span className="pointer-events-none absolute right-4 top-[15px] text-sm text-brand-ink-soft">aulas / semana</span>
                </div>
              </div>
            </div>

            <fieldset className="m-0 border-none p-0">
              <legend className="mb-3 p-0 text-sm font-semibold text-brand-ink">Turno preferido</legend>
              <div className="grid grid-cols-2 gap-1 rounded-full bg-brand-muted p-[5px] sm:grid-cols-4">
                {TURNOS.map((option) => (
                  <label key={option} className="relative block cursor-pointer">
                    <input
                      type="radio"
                      name="turno"
                      checked={turno === option}
                      onChange={() => setTurno(option)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span
                      className={`flex h-11 items-center justify-center rounded-full text-[14.5px] font-semibold transition-colors ${
                        turno === option ? 'bg-brand-ink text-white' : 'text-brand-ink-soft'
                      }`}
                    >
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-5 lg:w-[360px] lg:shrink-0">
          <section className="flex flex-col gap-4 rounded-[28px] bg-white p-6">
            <h2 className="m-0 font-display text-[17px] font-semibold text-brand-ink">Foto</h2>
            <label className="relative flex cursor-pointer flex-col items-center gap-2.5 rounded-[20px] border-[1.5px] border-dashed border-brand-dashed bg-brand-input p-[26px] text-center transition-colors hover:border-brand-primary hover:bg-brand-muted">
              <input type="file" accept="image/png,image/jpeg" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-canvas text-brand-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
                  <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
                </svg>
              </span>
              <span className="text-[14.5px] font-semibold text-brand-ink">
                Arraste uma imagem ou <span className="text-brand-primary underline">escolha um arquivo</span>
              </span>
              <span className="text-[13px] text-brand-ink-soft">PNG ou JPG, até 2 MB</span>
            </label>
          </section>

          <section className="flex flex-col gap-0.5 rounded-[28px] bg-white p-6">
            <h2 className="m-0 mb-2 font-display text-[17px] font-semibold text-brand-ink">Preferências</h2>
            <Switch
              checked={aulasGeminadas}
              onChange={setAulasGeminadas}
              label="Aulas geminadas"
              description="Permite duas aulas seguidas na mesma turma."
            />
            <Switch
              checked={evitarJanelas}
              onChange={setEvitarJanelas}
              label="Evitar janelas"
              description="Minimiza horários vagos entre aulas."
            />
            <Switch
              checked={avisosEmail}
              onChange={setAvisosEmail}
              label="Avisos por e-mail"
              description="Envia a escala quando for publicada."
            />
          </section>

          <section className="flex flex-1 flex-col gap-3 rounded-[28px] bg-white p-6">
            <label htmlFor="obs" className="font-display text-[17px] font-semibold text-brand-ink">
              Observações
            </label>
            <textarea
              id="obs"
              maxLength={300}
              placeholder="Restrições, acordos ou qualquer detalhe útil para montar a escala."
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              className="min-h-[120px] flex-1 resize-y rounded-2xl border border-brand-border bg-brand-input p-4 text-[15px] leading-relaxed text-brand-ink outline-none placeholder:text-brand-placeholder placeholder:font-normal hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
            />
            <span className="self-end text-[12.5px] text-brand-ink-soft">{observacoes.length} / 300 caracteres</span>
          </section>
        </div>
      </form>
    </div>
  )
}
