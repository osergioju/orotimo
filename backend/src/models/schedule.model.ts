export type { Schedule, ScheduleStatus } from '@prisma/client'

/**
 * Representação conceitual da tabela `schedule_versions` (PostgreSQL).
 * Cada execução do solver (futuro) gera uma nova versão/alternativa —
 * ainda não modelada como tabela real.
 */
export interface ScheduleVersion {
  id: string
  scheduleId: string
  label: string
  createdAt: string
}
