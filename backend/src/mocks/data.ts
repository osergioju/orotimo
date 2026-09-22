import type { User } from '../models/user.model'
import type { School } from '../models/school.model'
import type { Schedule } from '../models/schedule.model'
import type { SystemModule, UserSystem } from '../models/system.model'

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Junior', email: 'junior@crtcomunicacao.com.br', createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'user-2', name: 'João Silva', email: 'joao@escola.com', createdAt: '2026-02-05T10:00:00.000Z' },
  { id: 'user-3', name: 'Maria Souza', email: 'maria@escola.com', createdAt: '2026-03-01T10:00:00.000Z' },
]

export const mockSystems: SystemModule[] = [
  { id: 'sys-escalas', key: 'escalas', name: 'Escalas', description: 'Criar e otimizar escalas', status: 'active' },
  { id: 'sys-aviacao', key: 'aviacao', name: 'Aviação', description: 'Em breve', status: 'coming_soon' },
  { id: 'sys-varejo', key: 'varejo', name: 'Varejo', description: 'Em breve', status: 'coming_soon' },
  { id: 'sys-saude', key: 'saude', name: 'Saúde', description: 'Em breve', status: 'coming_soon' },
]

export const mockUserSystems: UserSystem[] = [
  { userId: 'user-1', systemId: 'sys-escalas', enabled: true },
  { userId: 'user-1', systemId: 'sys-aviacao', enabled: false },
  { userId: 'user-1', systemId: 'sys-varejo', enabled: false },
  { userId: 'user-1', systemId: 'sys-saude', enabled: false },
]

export const mockSchools: School[] = [
  {
    id: 'school-1',
    ownerId: 'user-1',
    name: 'Escola ABC',
    cnpj: '12.345.678/0001-90',
    description: 'Escola de ensino fundamental e médio',
    unitsCount: 2,
    createdAt: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'school-2',
    ownerId: 'user-1',
    name: 'Escola XYZ',
    cnpj: '98.765.432/0001-10',
    description: 'Escola técnica profissionalizante',
    unitsCount: 1,
    createdAt: '2026-04-15T10:00:00.000Z',
  },
]

export const mockSchedules: Schedule[] = [
  { id: 'schedule-1', schoolId: 'school-1', name: 'Grade 2027', period: 'Anual', academicYear: '2027', status: 'draft', createdAt: '2026-09-22T10:00:00.000Z' },
  { id: 'schedule-2', schoolId: 'school-1', name: 'Grade 2026', period: 'Anual', academicYear: '2026', status: 'generated', createdAt: '2026-09-10T10:00:00.000Z' },
]

export const mockSchoolOverview = {
  turmas: 24,
  professores: 42,
  salas: 18,
  disciplinas: 31,
}
