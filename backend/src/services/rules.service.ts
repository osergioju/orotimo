import { rulesRepository } from '../repositories/rules.repository'
import type { Rule } from '../models/rule.model'

export const rulesService = {
  async listBySchool(schoolId: string): Promise<Rule[]> {
    return rulesRepository.listBySchool(schoolId)
  },

  async getById(id: string): Promise<Rule | null> {
    return rulesRepository.findById(id)
  },

  async create(input: Omit<Rule, 'id' | 'createdAt'>): Promise<Rule> {
    return rulesRepository.create(input)
  },

  async delete(id: string): Promise<void> {
    return rulesRepository.delete(id)
  },
}
