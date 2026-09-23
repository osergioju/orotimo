import { timeSlotsRepository } from '../repositories/timeslots.repository'
import type { TimeSlot } from '../models/timeslot.model'

export const timeSlotsService = {
  async listBySchool(schoolId: string): Promise<TimeSlot[]> {
    return timeSlotsRepository.listBySchool(schoolId)
  },

  async getById(id: string): Promise<TimeSlot | null> {
    return timeSlotsRepository.findById(id)
  },

  async create(input: Omit<TimeSlot, 'id' | 'createdAt'>): Promise<TimeSlot> {
    return timeSlotsRepository.create(input)
  },

  async delete(id: string): Promise<void> {
    return timeSlotsRepository.delete(id)
  },
}
