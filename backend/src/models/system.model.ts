export type SystemStatus = 'active' | 'coming_soon'

/**
 * Representação conceitual da tabela `systems` (PostgreSQL).
 */
export interface SystemModule {
  id: string
  key: string
  name: string
  description: string
  status: SystemStatus
}

/**
 * Representação conceitual da tabela pivô `user_systems` (PostgreSQL).
 */
export interface UserSystem {
  userId: string
  systemId: string
  enabled: boolean
}
