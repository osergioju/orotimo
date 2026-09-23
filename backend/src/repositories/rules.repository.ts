import { prisma } from '../lib/prisma'
import type { Rule } from '../models/rule.model'

export const rulesRepository = {
  async listBySchool(schoolId: string): Promise<Rule[]> {
    return prisma.rule.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } })
  },

  async findById(id: string): Promise<Rule | null> {
    return prisma.rule.findUnique({ where: { id } })
  },

  async create(input: Omit<Rule, 'id' | 'createdAt'>): Promise<Rule> {
    return prisma.rule.create({ data: input })
  },

  async delete(id: string): Promise<void> {
    await prisma.rule.delete({ where: { id } })
  },
}
