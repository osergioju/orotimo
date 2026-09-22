import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/auth/Login'
import { SystemSelection } from './pages/systems/SystemSelection'
import { BusinessModelSelection } from './pages/escalas/BusinessModelSelection'
import { MySchools } from './pages/escola/MySchools'
import { NewSchool } from './pages/escola/NewSchool'
import { SchoolLayout } from './pages/escola/SchoolLayout'
import { Dashboard } from './pages/escola/Dashboard'
import { Teachers } from './pages/escola/cadastros/Teachers'
import { Classes } from './pages/escola/cadastros/Classes'
import { Subjects } from './pages/escola/cadastros/Subjects'
import { Rooms } from './pages/escola/cadastros/Rooms'
import { Horarios } from './pages/escola/configuracoes/Horarios'
import { DisponibilidadeProfessores } from './pages/escola/configuracoes/DisponibilidadeProfessores'
import { DisponibilidadeTurmas } from './pages/escola/configuracoes/DisponibilidadeTurmas'
import { Regras } from './pages/escola/configuracoes/Regras'
import { MySchedules } from './pages/escola/escalas/MySchedules'
import { NewSchedule } from './pages/escola/escalas/NewSchedule'
import { ScheduleDetail } from './pages/escola/escalas/ScheduleDetail'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { Users } from './pages/admin/Users'
import { Systems } from './pages/admin/Systems'
import { Permissions } from './pages/admin/Permissions'
import { AdminSchools } from './pages/admin/AdminSchools'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route path="/sistemas" element={<ProtectedRoute><SystemSelection /></ProtectedRoute>} />

      <Route path="/escalas" element={<ProtectedRoute><BusinessModelSelection /></ProtectedRoute>} />
      <Route path="/escalas/escola" element={<ProtectedRoute><MySchools /></ProtectedRoute>} />
      <Route path="/escalas/escola/novo" element={<ProtectedRoute><NewSchool /></ProtectedRoute>} />

      <Route
        path="/escalas/escola/:schoolId"
        element={
          <ProtectedRoute>
            <SchoolLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cadastros/professores" element={<Teachers />} />
        <Route path="cadastros/turmas" element={<Classes />} />
        <Route path="cadastros/disciplinas" element={<Subjects />} />
        <Route path="cadastros/salas" element={<Rooms />} />
        <Route path="configuracoes/horarios" element={<Horarios />} />
        <Route path="configuracoes/disponibilidade-professores" element={<DisponibilidadeProfessores />} />
        <Route path="configuracoes/disponibilidade-turmas" element={<DisponibilidadeTurmas />} />
        <Route path="configuracoes/regras" element={<Regras />} />
        <Route path="escalas" element={<MySchedules />} />
        <Route path="escalas/nova" element={<NewSchedule />} />
        <Route path="escalas/:scheduleId" element={<ScheduleDetail />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<Users />} />
        <Route path="sistemas" element={<Systems />} />
        <Route path="permissoes" element={<Permissions />} />
        <Route path="permissoes/:userId" element={<Permissions />} />
        <Route path="escolas" element={<AdminSchools />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
