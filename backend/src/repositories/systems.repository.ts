import { prisma } from '../lib/prisma'
import type { SystemModule } from '../models/system.model'

export const systemsRepository = {
  async list(): Promise<SystemModule[]> {
    return prisma.system.findMany({ orderBy: { name: 'asc' } })
  },

  async listEnabledForUser(userId: string): Promise<SystemModule[]> {
    return prisma.system.findMany({
      where: { userSystems: { some: { userId, enabled: true } } },
      orderBy: { name: 'asc' },
    })
  },
}
