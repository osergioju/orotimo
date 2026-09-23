import { prisma } from '../lib/prisma'
import type { TeacherAvailabilitySlot } from '../models/availability.model'

export const availabilityRepository = {
  async listByTeacher(teacherId: string): Promise<TeacherAvailabilitySlot[]> {
    return prisma.teacherAvailabilitySlot.findMany({ where: { teacherId } })
  },

  async replaceForTeacher(teacherId: string, slots: TeacherAvailabilitySlot[]): Promise<TeacherAvailabilitySlot[]> {
    return prisma.$transaction(async (tx) => {
      await tx.teacherAvailabilitySlot.deleteMany({ where: { teacherId } })
      if (slots.length > 0) {
        await tx.teacherAvailabilitySlot.createMany({ data: slots })
      }
      return tx.teacherAvailabilitySlot.findMany({ where: { teacherId } })
    })
  },
}
