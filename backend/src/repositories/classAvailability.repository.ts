import { prisma } from '../lib/prisma'
import type { ClassAvailabilitySlot } from '../models/classAvailability.model'

export const classAvailabilityRepository = {
  async listByClass(classId: string): Promise<ClassAvailabilitySlot[]> {
    return prisma.classAvailabilitySlot.findMany({ where: { classId } })
  },

  async replaceForClass(classId: string, slots: ClassAvailabilitySlot[]): Promise<ClassAvailabilitySlot[]> {
    return prisma.$transaction(async (tx) => {
      await tx.classAvailabilitySlot.deleteMany({ where: { classId } })
      if (slots.length > 0) {
        await tx.classAvailabilitySlot.createMany({ data: slots })
      }
      return tx.classAvailabilitySlot.findMany({ where: { classId } })
    })
  },
}
