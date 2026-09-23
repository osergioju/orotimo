import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { useAuth } from '../../contexts/AuthContext'
import { useSchool } from '../../contexts/SchoolContext'
import { api } from '../../lib/api'
import type { School } from '../../types'

export function MySchools() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { setCurrentSchool } = useSchool()
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .listSchools()
      .then(({ schools }) => setSchools(schools))
      .finally(() => setIsLoading(false))
  }, [])

  function handleSelect(school: School) {
    setCurrentSchool(school)
    navigate(`/escalas/escola/${school.id}`)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-brand-canvas p-5">
      {/* Top bar */}
      <header className="flex h-[76px] shrink-0 items-center gap-5 rounded-[28px] bg-white py-0 pl-7 pr-3.5">
        <button type="button" onClick={() => navigate('/escalas')} className="flex items-center">
          <Logo size={30} />
        </button>
        <div className="flex-1" />
        <div className="flex h-[50px] items-center gap-3 rounded-full border border-brand-border px-1.5">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-brand-lilac font-display text-sm font-semibold text-brand-ink">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'J'}
          </span>
          <span className="text-[15px] font-semibold text-brand-ink">{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-brand-muted px-3.5 py-2 text-[13px] font-semibold text-brand-ink"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex flex-1 flex-col gap-9 rounded-[32px] bg-white p-11">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
              <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Escola</span>
            </div>
            <h1 className="mt-3.5 font-display text-[44px] font-semibold leading-[1.08] tracking-tight text-brand-ink">
              Minhas escolas
            </h1>
            <p className="mt-2.5 text-base text-brand-ink-soft">Escolha uma escola para continuar ou cadastre uma nova.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-brand-ink-soft">Carregando escolas...</p>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school, index) => {
              const order = String(index + 1).padStart(2, '0')
              return (
                <a
                  key={school.id}
                  href={`/escalas/escola/${school.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    handleSelect(school)
                  }}
                  className="group flex flex-col justify-between gap-[18px] rounded-[28px] bg-brand-muted p-7 no-underline transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white text-brand-primary">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3 2.5 8 12 13l9.5-5z" />
                        <path d="m2.5 12.5 9.5 5 9.5-5" />
                      </svg>
                    </span>
                    <span className="font-display text-[13px] font-medium text-brand-ink-soft">{order}</span>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-semibold tracking-tight text-brand-ink">{school.name}</div>
                    <p className="mt-2 text-[15px] leading-normal text-brand-ink-soft">{school.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-brand-ink-soft">{school.unitsCount} unidade(s)</span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary transition-colors group-hover:bg-brand-ink">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                    </span>
                  </div>
                </a>
              )
            })}

            <a
              href="/escalas/escola/novo"
              onClick={(event) => {
                event.preventDefault()
                navigate('/escalas/escola/novo')
              }}
              className="flex flex-col items-center justify-center gap-3 rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-brand-input p-7 text-center no-underline transition-colors hover:border-brand-primary hover:bg-brand-muted"
            >
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white text-brand-primary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span className="font-display text-lg font-semibold text-brand-ink">Nova escola</span>
              <span className="text-sm text-brand-ink-soft">Cadastre outra unidade para gerenciar escalas.</span>
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
