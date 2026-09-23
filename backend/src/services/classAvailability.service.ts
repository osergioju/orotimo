import { classAvailabilityRepository } from '../repositories/classAvailability.repository'
import type { ClassAvailabilitySlot } from '../models/classAvailability.model'

export const classAvailabilityService = {
  async getForClass(classId: string) {
    return classAvailabilityRepository.listByClass(classId)
  },

  async replaceForClass(classId: string, slots: Omit<ClassAvailabilitySlot, 'classId'>[]) {
    const withClassId = slots.map((slot) => ({ ...slot, classId }))
    return classAvailabilityRepository.replaceForClass(classId, withClassId)
  },
}
