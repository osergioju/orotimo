import { schedulesRepository } from '../repositories/schedules.repository'

export const schedulesService = {
  async listBySchool(schoolId: string) {
    return schedulesRepository.listBySchool(schoolId)
  },

  async getById(id: string) {
    return schedulesRepository.findById(id)
  },

  async getSchoolDashboard(schoolId: string) {
    const overview = await schedulesRepository.getSchoolOverview(schoolId)
    return { overview }
  },
}
