import { systemsRepository } from '../repositories/systems.repository'

export const systemsService = {
  async listAll() {
    return systemsRepository.list()
  },

  async listEnabledForUser(userId: string) {
    return systemsRepository.listEnabledForUser(userId)
  },
}
