import { availabilityRepository } from '../repositories/availability.repository'
import type { TeacherAvailabilitySlot } from '../models/availability.model'

export const availabilityService = {
  async getForTeacher(teacherId: string) {
    return availabilityRepository.listByTeacher(teacherId)
  },

  async replaceForTeacher(teacherId: string, slots: Omit<TeacherAvailabilitySlot, 'teacherId'>[]) {
    const withTeacherId = slots.map((slot) => ({ ...slot, teacherId }))
    return availabilityRepository.replaceForTeacher(teacherId, withTeacherId)
  },
}
