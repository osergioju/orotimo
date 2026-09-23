import { teachersRepository } from '../repositories/teachers.repository'
import type { Teacher } from '../models/teacher.model'

export type CreateTeacherInput = Omit<Teacher, 'id' | 'createdAt' | 'preference'> & { preference?: number }

export const teachersService = {
  async listBySchool(schoolId: string) {
    return teachersRepository.listBySchool(schoolId)
  },

  async getById(id: string) {
    return teachersRepository.findById(id)
  },

  async create(input: CreateTeacherInput) {
    return teachersRepository.create({ ...input, preference: input.preference ?? 5 })
  },

  async update(id: string, input: Omit<CreateTeacherInput, 'schoolId'>) {
    return teachersRepository.update(id, { ...input, preference: input.preference ?? 5 })
  },

  async delete(id: string) {
    return teachersRepository.delete(id)
  },
}
