import { prisma } from '../lib/prisma'
import type { TimeSlot } from '../models/timeslot.model'

export const timeSlotsRepository = {
  async listBySchool(schoolId: string): Promise<TimeSlot[]> {
    return prisma.timeSlot.findMany({ where: { schoolId }, orderBy: { order: 'asc' } })
  },

  async findById(id: string): Promise<TimeSlot | null> {
    return prisma.timeSlot.findUnique({ where: { id } })
  },

  async create(input: Omit<TimeSlot, 'id' | 'createdAt'>): Promise<TimeSlot> {
    return prisma.timeSlot.create({ data: input })
  },

  async delete(id: string): Promise<void> {
    await prisma.timeSlot.delete({ where: { id } })
  },
}
