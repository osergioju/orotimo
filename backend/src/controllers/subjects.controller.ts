import type { Request, Response, NextFunction } from 'express'
import { subjectsService } from '../services/subjects.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const subjectsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined
      if (!schoolId) throw new BadRequestError('schoolId é obrigatório')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const subjects = await subjectsService.listBySchool(schoolId)
      res.json({ subjects })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, name, weeklyHours, preference } = req.body ?? {}
      if (!schoolId || !name) throw new BadRequestError('schoolId e name são obrigatórios')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)

      const created = await subjectsService.create({
        schoolId,
        name,
        weeklyHours: weeklyHours != null ? Number(weeklyHours) : 2,
        preference: preference != null ? Number(preference) : undefined,
      })

      res.status(201).json({ subject: created })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await subjectsService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Disciplina não encontrada')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)

      const { name, weeklyHours, preference } = req.body ?? {}
      if (!name) throw new BadRequestError('name é obrigatório')

      const updated = await subjectsService.update(existing.id, {
        name,
        weeklyHours: weeklyHours != null ? Number(weeklyHours) : 2,
        preference: preference != null ? Number(preference) : undefined,
      })

      res.json({ subject: updated })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await subjectsService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Disciplina não encontrada')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)
      await subjectsService.delete(existing.id)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
