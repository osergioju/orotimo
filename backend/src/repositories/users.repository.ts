import { prisma } from '../lib/prisma'
import type { User } from '../models/user.model'

export const usersRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  },

  async list(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
  },
}
