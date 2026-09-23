import { prisma } from '../lib/prisma'
import type { User } from '../models/user.model'

export const usersRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  },

  async list(): Promise<Omit<User, 'passwordHash'>[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
  },

  async create(input: { name: string; email: string; passwordHash: string; role?: User['role'] }): Promise<User> {
    return prisma.user.create({ data: input })
  },
}
