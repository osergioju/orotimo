import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Sidebar, type SidebarSection } from '../../components/layout/Sidebar'
import { useSchool } from '../../contexts/SchoolContext'

export function SchoolLayout() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { currentSchool, clearCurrentSchool } = useSchool()
  const navigate = useNavigate()

  if (!currentSchool) {
    return <Navigate to="/escalas/escola" replace />
  }

  const base = `/escalas/escola/${schoolId}`

  const sections: SidebarSection[] = [
    { items: [{ label: 'Dashboard', to: base, end: true }] },
    {
      title: 'Cadastros',
      items: [
        { label: 'Professores', to: `${base}/cadastros/professores` },
        { label: 'Turmas', to: `${base}/cadastros/turmas` },
        { label: 'Disciplinas', to: `${base}/cadastros/disciplinas` },
        { label: 'Salas', to: `${base}/cadastros/salas` },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { label: 'Horários', to: `${base}/configuracoes/horarios` },
        { label: 'Disponibilidade de professores', to: `${base}/configuracoes/disponibilidade-professores` },
        { label: 'Disponibilidade de turmas', to: `${base}/configuracoes/disponibilidade-turmas` },
        { label: 'Regras', to: `${base}/configuracoes/regras` },
      ],
    },
    {
      title: 'Escalas',
      items: [
        { label: 'Minhas escalas', to: `${base}/escalas`, end: true },
        { label: 'Nova escala', to: `${base}/escalas/nova` },
      ],
    },
  ]

  function handleBackToSystems() {
    clearCurrentSchool()
    navigate('/escalas/escola')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar brand={currentSchool.name} sections={sections} />
      <div className="flex flex-1 flex-col">
        <Header
          title={currentSchool.name}
          actions={
            <button
              type="button"
              onClick={handleBackToSystems}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Voltar para sistemas
            </button>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
