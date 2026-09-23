import { schedulesRepository } from '../repositories/schedules.repository'
import type { Schedule, ScheduleStatus } from '../models/schedule.model'

export interface CreateScheduleInput {
  schoolId: string
  name: string
  period?: string
  academicYear?: string
}

export const schedulesService = {
  async listBySchool(schoolId: string) {
    return schedulesRepository.listBySchool(schoolId)
  },

  async getById(id: string) {
    return schedulesRepository.findById(id)
  },

  async create(input: CreateScheduleInput): Promise<Schedule> {
    return schedulesRepository.create({
      schoolId: input.schoolId,
      name: input.name,
      period: input.period ?? null,
      academicYear: input.academicYear ?? null,
    })
  },

  async updateStatus(id: string, status: ScheduleStatus): Promise<Schedule> {
    return schedulesRepository.updateStatus(id, status)
  },

  async getSchoolDashboard(schoolId: string) {
    const overview = await schedulesRepository.getSchoolOverview(schoolId)
    return { overview }
  },
}
