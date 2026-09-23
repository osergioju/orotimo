import { useEffect, useState, type ReactElement, type ReactNode } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { useAuth } from '../../contexts/AuthContext'
import { useSchool } from '../../contexts/SchoolContext'
import { api } from '../../lib/api'

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

interface NavItem {
  label: string
  to: string
  end?: boolean
  icon: ReactElement
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface SidebarContentProps {
  sections: NavSection[]
  collapsedSections: Set<string>
  onToggleSection: (title: string) => void
  schoolName: string
  userName?: string
  onBackToSystems: () => void
  onLogout: () => void
  onNewSchedule: () => void
  onNavigate: () => void
}

function SidebarContent({
  sections,
  collapsedSections,
  onToggleSection,
  schoolName,
  userName,
  onBackToSystems,
  onLogout,
  onNewSchedule,
  onNavigate,
}: SidebarContentProps) {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col gap-[26px] overflow-hidden px-4 pb-4 pt-7">
      <button type="button" onClick={onBackToSystems} className="flex shrink-0 items-center gap-2.5 px-3 text-left">
        <Logo size={30} />
      </button>

      <nav aria-label="Principal" className="flex flex-1 flex-col gap-[18px] overflow-y-auto">
        {sections.map((section, index) => {
          const hasActiveItem = section.items.some((item) =>
            item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
          )
          const isOpen = !section.title || hasActiveItem || !collapsedSections.has(section.title)

          return (
            <div key={section.title ?? index} className="flex flex-col gap-0.5">
              {section.title && (
                <button
                  type="button"
                  onClick={() => onToggleSection(section.title!)}
                  className="flex items-center justify-between px-3 pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-brand-ink-soft"
                >
                  {section.title}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              )}
              <div className={`grid transition-[grid-template-rows] duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14.5px] font-medium no-underline transition-colors ${
                          isActive ? 'bg-brand-canvas font-semibold text-brand-ink' : 'text-brand-ink-soft hover:bg-brand-muted hover:text-brand-ink'
                        }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="flex shrink-0 flex-col gap-3.5 rounded-[22px] bg-brand-ink p-5">
        <div className="flex gap-1.5">
          <span className="h-[18px] w-[18px] rounded-[5px] bg-brand-orange" />
          <span className="h-[18px] w-[18px] rounded-[5px] bg-brand-cyan" />
          <span className="h-[18px] w-[18px] rounded-[5px] bg-brand-lilac" />
        </div>
        <div>
          <div className="font-display text-base font-semibold text-white">Tudo pronto?</div>
          <p className="mt-1.5 text-[13.5px] leading-snug text-brand-lavender">
            Gere uma escala com as disponibilidades atuais.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewSchedule}
          className="h-11 rounded-full border-none bg-white text-sm font-bold text-brand-ink"
        >
          Gerar escala
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-3 px-1.5 py-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-lilac font-display text-sm font-semibold text-brand-ink">
          {userName?.charAt(0)?.toUpperCase() ?? 'J'}
        </span>
        <div className="flex flex-1 flex-col overflow-hidden">
          <span className="truncate text-[14.5px] font-semibold text-brand-ink">{userName}</span>
          <span className="truncate text-[12.5px] text-brand-ink-soft">{schoolName}</span>
        </div>
        <button type="button" onClick={onLogout} className="shrink-0 text-[13px] font-semibold text-brand-primary">
          Sair
        </button>
      </div>
    </div>
  )
}

export function SchoolLayout() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { currentSchool, setCurrentSchool, clearCurrentSchool } = useSchool()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isResolving, setIsResolving] = useState(!currentSchool)
  const [notFound, setNotFound] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set(['Configurações']))

  function toggleSection(title: string) {
    setCollapsedSections((current) => {
      const next = new Set(current)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  useEffect(() => {
    if (currentSchool || !schoolId) {
      setIsResolving(false)
      return
    }

    api
      .getSchool(schoolId)
      .then(({ school }) => setCurrentSchool(school))
      .catch(() => setNotFound(true))
      .finally(() => setIsResolving(false))
  }, [schoolId, currentSchool, setCurrentSchool])

  if (isResolving) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-canvas">
        <p className="text-sm text-brand-ink-soft">Carregando escola...</p>
      </div>
    )
  }

  if (notFound || !currentSchool) {
    return <Navigate to="/escalas/escola" replace />
  }

  const base = `/escalas/escola/${schoolId}`

  const sections: NavSection[] = [
    {
      items: [
        {
          label: 'Dashboard',
          to: base,
          end: true,
          icon: (
            <NavIcon>
              <rect x="3" y="3" width="7" height="9" rx="2" />
              <rect x="14" y="3" width="7" height="5" rx="2" />
              <rect x="14" y="12" width="7" height="9" rx="2" />
              <rect x="3" y="16" width="7" height="5" rx="2" />
            </NavIcon>
          ),
        },
      ],
    },
    {
      title: 'Cadastros',
      items: [
        {
          label: 'Professores',
          to: `${base}/cadastros/professores`,
          icon: (
            <NavIcon>
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
              <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
              <path d="M18 14.8c1.9.7 3.1 2.4 3.5 5.2" />
            </NavIcon>
          ),
        },
        {
          label: 'Turmas',
          to: `${base}/cadastros/turmas`,
          icon: (
            <NavIcon>
              <path d="M12 3 2.5 8 12 13l9.5-5z" />
              <path d="m2.5 12.5 9.5 5 9.5-5" />
            </NavIcon>
          ),
        },
        {
          label: 'Disciplinas',
          to: `${base}/cadastros/disciplinas`,
          icon: (
            <NavIcon>
              <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
              <path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20" />
            </NavIcon>
          ),
        },
        {
          label: 'Salas',
          to: `${base}/cadastros/salas`,
          icon: (
            <NavIcon>
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-4h4v4" />
            </NavIcon>
          ),
        },
      ],
    },
    {
      title: 'Configurações',
      items: [
        {
          label: 'Horários',
          to: `${base}/configuracoes/horarios`,
          icon: (
            <NavIcon>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </NavIcon>
          ),
        },
        {
          label: 'Disp. de professores',
          to: `${base}/configuracoes/disponibilidade-professores`,
          icon: (
            <NavIcon>
              <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
              <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
              <path d="m9 15 2 2 4-4" />
            </NavIcon>
          ),
        },
        {
          label: 'Disp. de turmas',
          to: `${base}/configuracoes/disponibilidade-turmas`,
          icon: (
            <NavIcon>
              <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
              <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
            </NavIcon>
          ),
        },
        {
          label: 'Regras',
          to: `${base}/configuracoes/regras`,
          icon: (
            <NavIcon>
              <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="10" cy="12" r="2" />
              <circle cx="18" cy="18" r="2" />
            </NavIcon>
          ),
        },
        {
          label: 'Atribuições',
          to: `${base}/configuracoes/atribuicoes`,
          icon: (
            <NavIcon>
              <circle cx="8" cy="8" r="3" />
              <path d="M2.5 20c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
              <path d="M14.5 8h6.5M14.5 12h6.5M14.5 16h4" />
            </NavIcon>
          ),
        },
      ],
    },
    {
      title: 'Escalas',
      items: [
        {
          label: 'Minhas escalas',
          to: `${base}/escalas`,
          end: true,
          icon: (
            <NavIcon>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M3 9h18M9 21V9" />
            </NavIcon>
          ),
        },
        {
          label: 'Nova escala',
          to: `${base}/escalas/nova`,
          icon: (
            <NavIcon>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" />
            </NavIcon>
          ),
        },
      ],
    },
  ]

  function handleBackToSystems() {
    clearCurrentSchool()
    navigate('/escalas/escola')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const sidebarProps: SidebarContentProps = {
    sections,
    collapsedSections,
    onToggleSection: toggleSection,
    schoolName: currentSchool.name,
    userName: user?.name,
    onBackToSystems: handleBackToSystems,
    onLogout: handleLogout,
    onNewSchedule: () => navigate(`${base}/escalas/nova`),
    onNavigate: () => setIsNavOpen(false),
  }

  return (
    <div className="flex h-screen gap-3 overflow-hidden bg-brand-canvas p-3 sm:gap-5 sm:p-5">
      {/* Sidebar — desktop */}
      <aside className="hidden w-[272px] shrink-0 rounded-[28px] bg-white lg:block">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Sidebar — drawer mobile */}
      {isNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsNavOpen(false)} />
          <div className="relative flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setIsNavOpen(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-brand-ink-soft hover:bg-brand-muted"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <SidebarContent {...sidebarProps} />
          </div>
        </div>
      )}

      {/* Área principal */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-5">
        {/* Top bar */}
        <div className="flex h-11 shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsNavOpen(true)}
            aria-label="Abrir menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-ink hover:bg-brand-muted lg:hidden"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <label className="hidden h-11 max-w-[420px] flex-1 items-center gap-2 rounded-full bg-white px-4 text-brand-ink-soft sm:flex">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              aria-label="Buscar"
              placeholder="Buscar professores, turmas, salas"
              className="flex-1 border-none bg-transparent text-[13.5px] text-brand-ink outline-none placeholder:text-brand-ink-soft"
            />
          </label>
          <div className="flex-1" />
          <button
            type="button"
            aria-label="Notificações"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-none bg-white text-brand-ink hover:bg-brand-muted"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
              <path d="M10 20.5a2 2 0 0 0 4 0" />
            </svg>
            <span className="absolute right-3 top-[11px] h-1.5 w-1.5 rounded-full border-2 border-white bg-brand-orange" />
          </button>
          <button
            type="button"
            onClick={handleBackToSystems}
            className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] font-semibold text-brand-ink hover:bg-brand-muted sm:px-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
            </svg>
            <span className="hidden md:inline">Trocar sistema</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-1 pr-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
