export interface User {
  id: string
  name: string
  email: string
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
}

export type ScheduleStatus = 'draft' | 'generated'

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
