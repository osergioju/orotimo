export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface SchoolMember {
  id: string
  userId: string
  name: string
  email: string
}

export interface AdminStats {
  users: number
  schools: number
  teachers: number
  schedules: number
  admins: number
}

export type SystemStatus = 'active' | 'coming_soon'

export interface SystemModule {
  id: string
  key: string
  name: string
  description: string
  status: SystemStatus
}

export interface School {
  id: string
  ownerId: string
  name: string
  cnpj: string
  description: string
  logoUrl?: string
  unitsCount: number
  createdAt: string
  owner?: { id: string; name: string; email: string }
  _count?: { members: number }
}

export type ScheduleStatus = 'draft' | 'generating' | 'generated' | 'failed'

export interface Schedule {
  id: string
  schoolId: string
  name: string
  period?: string
  academicYear?: string
  status: ScheduleStatus
  createdAt: string
}

export interface SchoolOverview {
  turmas: number
  professores: number
  salas: number
  disciplinas: number
}

export type ContractType = 'CLT' | 'PJ' | 'Temporário'
export type Shift = 'Manhã' | 'Tarde' | 'Noite' | 'Integral'

export interface Teacher {
  id: string
  schoolId: string
  name: string
  email: string
  phone?: string
  cpf?: string
  birthDate?: string
  unit: string
  subjects: string[]
  contractType?: ContractType
  maxWeeklyClasses: number
  preferredShift: Shift
  twinClasses: boolean
  avoidGaps: boolean
  emailNotifications: boolean
  notes?: string
  preference: number
  createdAt: string
}

export interface TeacherAvailabilitySlot {
  teacherId: string
  day: string
  timeSlotId: string
  available: boolean
}

export interface Class {
  id: string
  schoolId: string
  name: string
  shift: string
  studentsCount?: number | null
  createdAt: string
}

export interface ClassAvailabilitySlot {
  classId: string
  day: string
  timeSlotId: string
  available: boolean
}

export interface Subject {
  id: string
  schoolId: string
  name: string
  weeklyHours: number
  preference: number
  createdAt: string
}

export interface Assignment {
  id: string
  schoolId: string
  classId: string
  subjectId: string
  teacherId: string
  weeklyMinClasses: number
  dailyMaxClasses: number
  createdAt: string
  class?: Class
  subject?: Subject
  teacher?: Teacher
}

export type SolutionStatus = 'success' | 'infeasible' | 'error'

export interface ScheduleSolutionMessage {
  mensagens: string[]
  dica: string
}

export interface ScheduleSolution {
  id: string
  scheduleId: string
  status: SolutionStatus
  messages?: ScheduleSolutionMessage[] | null
  visualizacaoEscola?: Record<string, string>[] | null
  visualizacaoProfessores?: Record<string, string>[] | null
  visualizacaoJanelas?: Record<string, string>[] | null
  resumoJanelas?: Record<string, string | number>[] | null
  createdAt: string
}

export interface Room {
  id: string
  schoolId: string
  name: string
  capacity?: number | null
  createdAt: string
}

export interface TimeSlot {
  id: string
  schoolId: string
  label: string
  startTime: string
  endTime: string
  order: number
  createdAt: string
}

export type RuleType = 'hard' | 'soft'

export interface Rule {
  id: string
  schoolId: string
  description: string
  type: RuleType
  weight: number
  createdAt: string
}
