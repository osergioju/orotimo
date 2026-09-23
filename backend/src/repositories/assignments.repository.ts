import { prisma } from '../lib/prisma'
import type { Assignment } from '../models/assignment.model'

export const assignmentsRepository = {
  async listBySchool(schoolId: string) {
    return prisma.assignment.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'asc' },
      include: { class: true, subject: true, teacher: true },
    })
  },

  async findById(id: string): Promise<Assignment | null> {
    return prisma.assignment.findUnique({ where: { id } })
  },

  async create(input: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> {
    return prisma.assignment.create({ data: input })
  },

  async update(id: string, input: Omit<Assignment, 'id' | 'createdAt' | 'schoolId'>): Promise<Assignment> {
    return prisma.assignment.update({ where: { id }, data: input })
  },

  async delete(id: string): Promise<void> {
    await prisma.assignment.delete({ where: { id } })
  },
}
