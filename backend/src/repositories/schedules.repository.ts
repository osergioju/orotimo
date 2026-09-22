import { mockSchedules, mockSchoolOverview } from '../mocks/data'
import type { Schedule } from '../models/schedule.model'

export const schedulesRepository = {
  async listBySchool(schoolId: string): Promise<Schedule[]> {
    return mockSchedules.filter((schedule) => schedule.schoolId === schoolId)
  },

  async findById(id: string): Promise<Schedule | undefined> {
    return mockSchedules.find((schedule) => schedule.id === id)
  },

  async getSchoolOverview(_schoolId: string) {
    return mockSchoolOverview
  },
}
