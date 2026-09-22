import { mockSystems, mockUserSystems } from '../mocks/data'
import type { SystemModule } from '../models/system.model'

export const systemsRepository = {
  async list(): Promise<SystemModule[]> {
    return mockSystems
  },

  async listEnabledForUser(userId: string): Promise<SystemModule[]> {
    const enabledIds = mockUserSystems
      .filter((userSystem) => userSystem.userId === userId && userSystem.enabled)
      .map((userSystem) => userSystem.systemId)

    return mockSystems.filter((system) => enabledIds.includes(system.id))
  },
}
