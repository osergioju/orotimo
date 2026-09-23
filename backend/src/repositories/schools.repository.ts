import { prisma } from '../lib/prisma'
import type { School } from '../models/school.model'

export const schoolsRepository = {
  async listByOwner(ownerId: string): Promise<School[]> {
    return prisma.school.findMany({ where: { ownerId }, orderBy: { createdAt: 'asc' } })
  },

  async findById(id: string): Promise<School | null> {
    return prisma.school.findUnique({ where: { id } })
  },

  async create(input: Omit<School, 'id' | 'createdAt'>): Promise<School> {
    return prisma.school.create({ data: input })
  },
}
