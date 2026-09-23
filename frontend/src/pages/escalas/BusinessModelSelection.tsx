import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { useAuth } from '../../contexts/AuthContext'

interface BusinessModel {
  key: string
  name: string
  description: string
  available: boolean
  route?: string
  icon: ReactElement
  iconColor?: string
}

const BUSINESS_MODELS: BusinessModel[] = [
  {
    key: 'escola',
    name: 'Escola',
    description: 'Geração e organização de horários escolares.',
    available: true,
    route: '/escalas/escola',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 2.5 8 12 13l9.5-5z" />
        <path d="m2.5 12.5 9.5 5 9.5-5" />
      </svg>
    ),
  },
  {
    key: 'aviacao',
    name: 'Companhia aérea',
    description: 'Escalas de tripulação e bases.',
    available: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 13.5 4 12l-1.5-2 7 .5L14 4.5a1.8 1.8 0 0 1 3 1.9L14 11l.5 7-2 1.5-1.5-6.5" />
        <path d="M6 20h12" />
      </svg>
    ),
    iconColor: 'text-brand-link',
  },
  {
    key: 'supermercado',
    name: 'Supermercado',
    description: 'Demanda mínima por horário de pico.',
    available: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h2.5l2.2 11h10.8L21 7.5H6.3" />
        <circle cx="9" cy="19.5" r="1.5" />
        <circle cx="17" cy="19.5" r="1.5" />
      </svg>
    ),
    iconColor: 'text-brand-orange',
  },
  {
    key: 'varejo',
    name: 'Varejo',
    description: 'Cobertura mínima por loja e turno.',
    available: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10 5.5 4h13L20 10" />
        <path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
    iconColor: 'text-brand-cyan',
  },
  {
    key: 'industria',
    name: 'Indústria',
    description: 'Turnos, máquinas e competências.',
    available: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V11l5 3.5V11l5 3.5V11l6 4v6z" />
        <path d="M3 21h18" />
      </svg>
    ),
    iconColor: 'text-brand-slate',
  },
  {
    key: 'saude',
    name: 'Saúde',
    description: 'Plantões com descanso mínimo garantido.',
    available: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" />
        <path d="M7.5 12.5h2.5l1.3-2.5 1.9 4.5 1.3-2h2" />
      </svg>
    ),
    iconColor: 'text-brand-primary',
  },
]

export function BusinessModelSelection() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-brand-canvas p-5">
      {/* Top bar */}
      <header className="flex h-[76px] shrink-0 items-center gap-5 rounded-[28px] bg-white py-0 pl-7 pr-3.5">
        <Logo size={30} />
        <div className="flex-1" />
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink hover:bg-brand-canvas"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
            <path d="M10 20.5a2 2 0 0 0 4 0" />
          </svg>
          <span className="absolute right-[13px] top-3 h-2 w-2 rounded-full border-2 border-white bg-brand-orange" />
        </button>
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
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Escalas</span>
          </div>
          <h1 className="mt-3.5 font-display text-[44px] font-semibold leading-[1.08] tracking-tight text-brand-ink">
            Escolha o tipo de operação
          </h1>
          <p className="mt-2.5 text-base text-brand-ink-soft">Selecione o modelo de negócio para configurar suas escalas.</p>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_MODELS.map((model, index) => {
            const order = String(index + 1).padStart(2, '0')

            if (model.available) {
              return (
                <a
                  key={model.key}
                  href={model.route}
                  onClick={(event) => {
                    event.preventDefault()
                    if (model.route) navigate(model.route)
                  }}
                  className="group flex flex-col justify-between gap-8 rounded-[28px] bg-brand-primary p-7 no-underline transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white/[0.12] text-white">
                      {model.icon}
                    </span>
                    <span className="font-display text-[13px] font-medium text-brand-lavender">{order}</span>
                  </div>
                  <div className="flex flex-col gap-[18px]">
                    <div>
                      <div className="font-display text-2xl font-semibold tracking-tight text-white">{model.name}</div>
                      <p className="mt-2 text-[15px] leading-normal text-brand-lavender">{model.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-white">Acessar</span>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange transition-colors group-hover:bg-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16215B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              )
            }

            return (
              <div key={model.key} className="flex flex-col justify-between gap-8 rounded-[28px] bg-brand-muted p-7">
                <div className="flex items-start justify-between">
                  <span className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white ${model.iconColor ?? 'text-brand-ink-soft'}`}>
                    {model.icon}
                  </span>
                  <span className="font-display text-[13px] font-medium text-brand-ink-soft">{order}</span>
                </div>
                <div className="flex flex-col gap-[18px]">
                  <div>
                    <div className="font-display text-2xl font-semibold tracking-tight text-brand-ink">{model.name}</div>
                    <p className="mt-2 text-[15px] leading-normal text-brand-ink-soft">{model.description}</p>
                  </div>
                  <span className="self-start rounded-full border border-brand-border bg-white px-3.5 py-2 text-[13px] font-semibold text-brand-ink-soft">
                    Em breve
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
