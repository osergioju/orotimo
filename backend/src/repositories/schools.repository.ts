import { prisma } from '../lib/prisma'
import type { School } from '../models/school.model'

export const schoolsRepository = {
  async listAccessibleByUser(userId: string): Promise<School[]> {
    return prisma.school.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      orderBy: { createdAt: 'asc' },
    })
  },

  async findById(id: string): Promise<School | null> {
    return prisma.school.findUnique({ where: { id } })
  },

  async create(input: Omit<School, 'id' | 'createdAt'>): Promise<School> {
    return prisma.school.create({ data: input })
  },
}
