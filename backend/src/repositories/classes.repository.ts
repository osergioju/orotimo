import { prisma } from '../lib/prisma'
import type { Class } from '../models/class.model'

export const classesRepository = {
  async listBySchool(schoolId: string): Promise<Class[]> {
    return prisma.class.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } })
  },

  async findById(id: string): Promise<Class | null> {
    return prisma.class.findUnique({ where: { id } })
  },

  async create(input: Omit<Class, 'id' | 'createdAt'>): Promise<Class> {
    return prisma.class.create({ data: input })
  },

  async update(id: string, input: Omit<Class, 'id' | 'createdAt' | 'schoolId'>): Promise<Class> {
    return prisma.class.update({ where: { id }, data: input })
  },

  async delete(id: string): Promise<void> {
    await prisma.class.delete({ where: { id } })
  },
}
