/**
 * Representação conceitual da tabela `users` (PostgreSQL).
 * Nesta etapa não há persistência real — os dados vêm de mocks.
 */
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}
