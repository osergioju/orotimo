import { prisma } from '../lib/prisma'
import type { Subject } from '../models/subject.model'

export const subjectsRepository = {
  async listBySchool(schoolId: string): Promise<Subject[]> {
    return prisma.subject.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } })
  },

  async findById(id: string): Promise<Subject | null> {
    return prisma.subject.findUnique({ where: { id } })
  },

  async create(input: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
    return prisma.subject.create({ data: input })
  },

  async update(id: string, input: Omit<Subject, 'id' | 'createdAt' | 'schoolId'>): Promise<Subject> {
    return prisma.subject.update({ where: { id }, data: input })
  },

  async delete(id: string): Promise<void> {
    await prisma.subject.delete({ where: { id } })
  },
}
