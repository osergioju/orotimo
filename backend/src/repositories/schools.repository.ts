import { randomUUID } from 'node:crypto'
import { mockSchools } from '../mocks/data'
import type { School } from '../models/school.model'

export const schoolsRepository = {
  async listByOwner(ownerId: string): Promise<School[]> {
    return mockSchools.filter((school) => school.ownerId === ownerId)
  },

  async findById(id: string): Promise<School | undefined> {
    return mockSchools.find((school) => school.id === id)
  },

  async create(input: Omit<School, 'id' | 'createdAt'>): Promise<School> {
    const school: School = {
      ...input,
      id: `school-${randomUUID()}`,
      createdAt: new Date().toISOString(),
    }
    mockSchools.push(school)
    return school
  },
}
