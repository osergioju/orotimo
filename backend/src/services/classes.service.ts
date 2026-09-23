import { classesRepository } from '../repositories/classes.repository'
import type { Class } from '../models/class.model'

export const classesService = {
  async listBySchool(schoolId: string): Promise<Class[]> {
    return classesRepository.listBySchool(schoolId)
  },

  async getById(id: string): Promise<Class | null> {
    return classesRepository.findById(id)
  },

  async create(input: Omit<Class, 'id' | 'createdAt'>): Promise<Class> {
    return classesRepository.create(input)
  },

  async update(id: string, input: Omit<Class, 'id' | 'createdAt' | 'schoolId'>): Promise<Class> {
    return classesRepository.update(id, input)
  },

  async delete(id: string): Promise<void> {
    return classesRepository.delete(id)
  },
}
