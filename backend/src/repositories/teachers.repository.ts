import { prisma } from '../lib/prisma'
import type { Teacher } from '../models/teacher.model'

export const teachersRepository = {
  async listBySchool(schoolId: string): Promise<Teacher[]> {
    return prisma.teacher.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } })
  },

  async findById(id: string): Promise<Teacher | null> {
    return prisma.teacher.findUnique({ where: { id } })
  },

  async create(input: Omit<Teacher, 'id' | 'createdAt'>): Promise<Teacher> {
    return prisma.teacher.create({ data: input })
  },

  async update(id: string, input: Omit<Teacher, 'id' | 'createdAt' | 'schoolId'>): Promise<Teacher> {
    return prisma.teacher.update({ where: { id }, data: input })
  },

  async delete(id: string): Promise<void> {
    await prisma.teacher.delete({ where: { id } })
  },
}
