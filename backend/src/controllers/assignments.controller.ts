import type { Request, Response, NextFunction } from 'express'
import { assignmentsService } from '../services/assignments.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const assignmentsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined
      if (!schoolId) throw new BadRequestError('schoolId é obrigatório')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const assignments = await assignmentsService.listBySchool(schoolId)
      res.json({ assignments })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, classId, subjectId, teacherId, weeklyMinClasses, dailyMaxClasses } = req.body ?? {}
      if (!schoolId || !classId || !subjectId || !teacherId) {
        throw new BadRequestError('schoolId, classId, subjectId e teacherId são obrigatórios')
      }

      await accessService.assertSchoolOwnership(schoolId, req.userId!)

      const created = await assignmentsService.create({
        schoolId,
        classId,
        subjectId,
        teacherId,
        weeklyMinClasses: weeklyMinClasses != null ? Number(weeklyMinClasses) : 2,
        dailyMaxClasses: dailyMaxClasses != null ? Number(dailyMaxClasses) : 2,
      })

      res.status(201).json({ assignment: created })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await assignmentsService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Atribuição não encontrada')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)

      const { classId, subjectId, teacherId, weeklyMinClasses, dailyMaxClasses } = req.body ?? {}

      const updated = await assignmentsService.update(existing.id, {
        classId: classId ?? existing.classId,
        subjectId: subjectId ?? existing.subjectId,
        teacherId: teacherId ?? existing.teacherId,
        weeklyMinClasses: weeklyMinClasses != null ? Number(weeklyMinClasses) : existing.weeklyMinClasses,
        dailyMaxClasses: dailyMaxClasses != null ? Number(dailyMaxClasses) : existing.dailyMaxClasses,
      })

      res.json({ assignment: updated })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await assignmentsService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Atribuição não encontrada')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)
      await assignmentsService.delete(existing.id)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
