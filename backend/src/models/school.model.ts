export type { School } from '@prisma/client'

/**
 * Representação conceitual da tabela `school_units` (PostgreSQL).
 * Preparado para o caso de uma escola possuir múltiplas unidades físicas —
 * ainda não modelada como tabela real.
 */
export interface SchoolUnit {
  id: string
  schoolId: string
  name: string
  address?: string
}
