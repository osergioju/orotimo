/**
 * Representação conceitual da tabela `schools` (PostgreSQL).
 * Um usuário pode possuir múltiplas escolas (1:N).
 */
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

/**
 * Representação conceitual da tabela `school_units` (PostgreSQL).
 * Preparado para o caso de uma escola possuir múltiplas unidades físicas.
 */
export interface SchoolUnit {
  id: string
  schoolId: string
  name: string
  address?: string
}
