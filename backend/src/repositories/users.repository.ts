import { mockUsers } from '../mocks/data'
import type { User } from '../models/user.model'

/**
 * Nesta etapa lê de mocks em memória. Futuramente, substituir a
 * implementação interna por queries ao PostgreSQL sem alterar o contrato.
 */
export const usersRepository = {
  async findByEmail(email: string): Promise<User | undefined> {
    return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase())
  },

  async findById(id: string): Promise<User | undefined> {
    return mockUsers.find((user) => user.id === id)
  },

  async list(): Promise<User[]> {
    return mockUsers
  },
}
