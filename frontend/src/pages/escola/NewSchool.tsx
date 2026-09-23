import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { useSchool } from '../../contexts/SchoolContext'
import { api } from '../../lib/api'

export function NewSchool() {
  const navigate = useNavigate()
  const { setCurrentSchool } = useSchool()
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [description, setDescription] = useState('')
  const [unitsCount, setUnitsCount] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const { school } = await api.createSchool({
        name,
        cnpj,
        description,
        unitsCount: Number(unitsCount) || 1,
      })
      setCurrentSchool(school)
      setSuccess(true)
      setTimeout(() => navigate(`/escalas/escola/${school.id}`), 900)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-canvas p-5">
        <div className="w-full max-w-sm rounded-[28px] bg-white p-8 text-center">
          <div className="text-3xl">✅</div>
          <p className="mt-3 font-display text-base font-semibold text-brand-ink">Escola criada com sucesso</p>
          <p className="mt-1 text-sm text-brand-ink-soft">Redirecionando para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-brand-canvas p-5">
      <header className="flex h-[76px] shrink-0 items-center rounded-[28px] bg-white px-7">
        <button type="button" onClick={() => navigate('/escalas/escola')} className="flex items-center">
          <Logo size={30} />
        </button>
      </header>

      <main className="flex flex-1 items-start justify-center rounded-[32px] bg-white p-6 sm:items-center sm:p-11">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Escola</span>
          </div>
          <h1 className="mt-3.5 font-display text-[28px] font-semibold tracking-tight text-brand-ink">Nova escola</h1>
          <p className="mt-2 text-sm text-brand-ink-soft">Preencha os dados iniciais da escola.</p>

          <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className="text-sm font-semibold text-brand-ink">
                Nome da escola
              </label>
              <input
                id="nome"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Escola ABC"
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cnpj" className="text-sm font-semibold text-brand-ink">
                CNPJ
              </label>
              <input
                id="cnpj"
                value={cnpj}
                onChange={(event) => setCnpj(event.target.value)}
                placeholder="00.000.000/0000-00"
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="descricao" className="text-sm font-semibold text-brand-ink">
                Descrição
              </label>
              <textarea
                id="descricao"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ensino fundamental e médio, período integral..."
                className="rounded-xl border border-brand-border bg-brand-input p-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="unidades" className="text-sm font-semibold text-brand-ink">
                Quantidade de unidades
              </label>
              <input
                id="unidades"
                type="number"
                min={1}
                value={unitsCount}
                onChange={(event) => setUnitsCount(event.target.value)}
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-brand-dashed bg-brand-input p-5 text-center transition-colors hover:border-brand-primary hover:bg-brand-muted">
              <input type="file" accept="image/*" className="hidden" />
              <span className="text-sm font-semibold text-brand-ink">Foto/logo da escola</span>
              <span className="text-xs text-brand-ink-soft">Clique para enviar (opcional)</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-11 rounded-full bg-brand-primary text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar escola'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
