import { Prisma } from '@prisma/client'
import { assignmentsRepository } from '../repositories/assignments.repository'
import type { Assignment } from '../models/assignment.model'
import { BadRequestError } from '../lib/errors'

export type CreateAssignmentInput = Omit<Assignment, 'id' | 'createdAt'>

export const assignmentsService = {
  async listBySchool(schoolId: string) {
    return assignmentsRepository.listBySchool(schoolId)
  },

  async getById(id: string) {
    return assignmentsRepository.findById(id)
  },

  async create(input: CreateAssignmentInput) {
    try {
      return await assignmentsRepository.create(input)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestError('Esta turma já tem um professor atribuído para esta disciplina.')
      }
      throw error
    }
  },

  async update(id: string, input: Omit<CreateAssignmentInput, 'schoolId'>) {
    try {
      return await assignmentsRepository.update(id, input)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestError('Esta turma já tem um professor atribuído para esta disciplina.')
      }
      throw error
    }
  },

  async delete(id: string) {
    return assignmentsRepository.delete(id)
  },
}
