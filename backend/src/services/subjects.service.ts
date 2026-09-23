import { subjectsRepository } from '../repositories/subjects.repository'
import type { Subject } from '../models/subject.model'

export const subjectsService = {
  async listBySchool(schoolId: string): Promise<Subject[]> {
    return subjectsRepository.listBySchool(schoolId)
  },

  async getById(id: string): Promise<Subject | null> {
    return subjectsRepository.findById(id)
  },

  async create(input: Omit<Subject, 'id' | 'createdAt' | 'preference'> & { preference?: number }): Promise<Subject> {
    return subjectsRepository.create({ ...input, preference: input.preference ?? 5 })
  },

  async update(
    id: string,
    input: Omit<Subject, 'id' | 'createdAt' | 'schoolId' | 'preference'> & { preference?: number },
  ): Promise<Subject> {
    return subjectsRepository.update(id, { ...input, preference: input.preference ?? 5 })
  },

  async delete(id: string): Promise<void> {
    return subjectsRepository.delete(id)
  },
}
