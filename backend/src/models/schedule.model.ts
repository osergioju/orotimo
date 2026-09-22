export type ScheduleStatus = 'draft' | 'generated'

/**
 * Representação conceitual da tabela `schedules` (PostgreSQL).
 * O conteúdo gerado pelo solver (futuro) ficará em `schedule_versions`.
 */
export interface Schedule {
  id: string
  schoolId: string
  name: string
  period?: string
  academicYear?: string
  status: ScheduleStatus
  createdAt: string
}

/**
 * Representação conceitual da tabela `schedule_versions` (PostgreSQL).
 * Cada execução do solver (futuro) gera uma nova versão/alternativa.
 */
export interface ScheduleVersion {
  id: string
  scheduleId: string
  label: string
  createdAt: string
}
