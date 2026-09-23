import { prisma } from '../lib/prisma'
import type { Schedule } from '../models/schedule.model'

export const schedulesRepository = {
  async listBySchool(schoolId: string): Promise<Schedule[]> {
    return prisma.schedule.findMany({ where: { schoolId }, orderBy: { createdAt: 'desc' } })
  },

  async findById(id: string): Promise<Schedule | null> {
    return prisma.schedule.findUnique({ where: { id } })
  },

  async create(input: Omit<Schedule, 'id' | 'createdAt' | 'status'>): Promise<Schedule> {
    return prisma.schedule.create({ data: input })
  },

  async updateStatus(id: string, status: Schedule['status']): Promise<Schedule> {
    return prisma.schedule.update({ where: { id }, data: { status } })
  },

  async getSchoolOverview(schoolId: string) {
    const [professores, turmas, salas, disciplinas] = await Promise.all([
      prisma.teacher.count({ where: { schoolId } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.room.count({ where: { schoolId } }),
      prisma.subject.count({ where: { schoolId } }),
    ])

    return { turmas, professores, salas, disciplinas }
  },
}
