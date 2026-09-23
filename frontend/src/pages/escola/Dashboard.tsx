import { useEffect, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchool } from '../../contexts/SchoolContext'
import { api } from '../../lib/api'
import type { SchoolOverview } from '../../types'

function Icon({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const ICONS = {
  turmas: (
    <Icon>
      <path d="M12 3 2.5 8 12 13l9.5-5z" />
      <path d="m2.5 12.5 9.5 5 9.5-5" />
    </Icon>
  ),
  professores: (
    <Icon>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
      <path d="M18 14.8c1.9.7 3.1 2.4 3.5 5.2" />
    </Icon>
  ),
  salas: (
    <Icon>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-4h4v4" />
    </Icon>
  ),
  disciplinas: (
    <Icon>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
      <path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20" />
    </Icon>
  ),
} as const

export function Dashboard() {
  const { currentSchool } = useSchool()
  const navigate = useNavigate()
  const [overview, setOverview] = useState<SchoolOverview | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api.getSchoolDashboard(currentSchool.id).then(({ overview }) => setOverview(overview))
  }, [currentSchool])

  if (!currentSchool) return null

  const base = `/escalas/escola/${currentSchool.id}`

  const overviewItems: { key: keyof typeof ICONS; label: string; value?: number }[] = [
    { key: 'turmas', label: 'Turmas', value: overview?.turmas },
    { key: 'professores', label: 'Professores', value: overview?.professores },
    { key: 'salas', label: 'Salas', value: overview?.salas },
    { key: 'disciplinas', label: 'Disciplinas', value: overview?.disciplinas },
  ]

  const cadastros: { key: keyof typeof ICONS; label: string; to: string }[] = [
    { key: 'professores', label: 'Professores', to: `${base}/cadastros/professores` },
    { key: 'turmas', label: 'Turmas', to: `${base}/cadastros/turmas` },
    { key: 'disciplinas', label: 'Disciplinas', to: `${base}/cadastros/disciplinas` },
    { key: 'salas', label: 'Salas', to: `${base}/cadastros/salas` },
  ]

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Dashboard</span>
        </div>
        <h1 className="mt-3.5 font-display text-[32px] font-semibold leading-tight tracking-tight text-brand-ink sm:text-[38px]">
          {currentSchool.name}
        </h1>
        <p className="mt-2 text-[15px] text-brand-ink-soft">Visão geral da escola</p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {overviewItems.map((item) => (
          <div key={item.key} className="flex flex-col gap-3 rounded-[24px] bg-white p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-canvas text-brand-primary">
              {ICONS[item.key]}
            </span>
            <div>
              <p className="font-display text-[28px] font-semibold tracking-tight text-brand-ink">{item.value ?? '—'}</p>
              <p className="mt-0.5 text-sm text-brand-ink-soft">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cadastros */}
      <section className="flex flex-col gap-5 rounded-[28px] bg-white p-6 sm:p-7">
        <div>
          <h2 className="font-display text-[19px] font-semibold text-brand-ink">Cadastros</h2>
          <p className="mt-1 text-sm text-brand-ink-soft">Gerencie professores, turmas, disciplinas e salas.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cadastros.map((item) => (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              className="group flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-input px-4 py-3.5 text-left transition-colors hover:border-brand-primary hover:bg-brand-canvas"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-primary">
                {ICONS[item.key]}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-brand-ink">{item.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
      </section>

      {/* Escalas */}
      <section className="flex flex-col gap-5 rounded-[28px] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <h2 className="font-display text-[19px] font-semibold text-brand-ink">Escalas</h2>
          <p className="mt-1 text-sm text-brand-ink-soft">Gere e acompanhe as escalas desta escola.</p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => navigate(`${base}/escalas`)}
            className="h-12 rounded-full border border-brand-border bg-white px-5 text-[14.5px] font-semibold text-brand-ink hover:bg-brand-muted"
          >
            Minhas escalas
          </button>
          <button
            type="button"
            onClick={() => navigate(`${base}/escalas/nova`)}
            className="flex h-12 items-center gap-3 rounded-full bg-brand-primary py-0 pl-5 pr-1.5 text-[14.5px] font-semibold text-white hover:bg-brand-ink"
          >
            Nova escala
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16215B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}
