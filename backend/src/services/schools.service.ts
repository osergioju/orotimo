import { schoolsRepository } from '../repositories/schools.repository'
import type { School } from '../models/school.model'

export interface CreateSchoolInput {
  ownerId: string
  name: string
  cnpj: string
  description: string
  logoUrl?: string | null
  unitsCount: number
}

export const schoolsService = {
  async listMine(ownerId: string): Promise<School[]> {
    return schoolsRepository.listByOwner(ownerId)
  },

  async getById(id: string): Promise<School | null> {
    return schoolsRepository.findById(id)
  },

  async create(input: CreateSchoolInput): Promise<School> {
    return schoolsRepository.create({ ...input, logoUrl: input.logoUrl ?? null })
  },
}
