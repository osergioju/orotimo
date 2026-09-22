import { Outlet } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Sidebar, type SidebarSection } from '../../components/layout/Sidebar'

const sections: SidebarSection[] = [
  {
    items: [
      { label: 'Dashboard', to: '/admin', end: true },
      { label: 'Usuários', to: '/admin/usuarios' },
      { label: 'Sistemas', to: '/admin/sistemas' },
      { label: 'Permissões', to: '/admin/permissoes' },
      { label: 'Escolas', to: '/admin/escolas' },
    ],
  },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar brand="Admin Master" sections={sections} />
      <div className="flex flex-1 flex-col">
        <Header title="Admin Master" />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
