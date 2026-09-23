import { prisma } from '../lib/prisma'
import type { Room } from '../models/room.model'

export const roomsRepository = {
  async listBySchool(schoolId: string): Promise<Room[]> {
    return prisma.room.findMany({ where: { schoolId }, orderBy: { createdAt: 'asc' } })
  },

  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({ where: { id } })
  },

  async create(input: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
    return prisma.room.create({ data: input })
  },

  async update(id: string, input: Omit<Room, 'id' | 'createdAt' | 'schoolId'>): Promise<Room> {
    return prisma.room.update({ where: { id }, data: input })
  },

  async delete(id: string): Promise<void> {
    await prisma.room.delete({ where: { id } })
  },
}
