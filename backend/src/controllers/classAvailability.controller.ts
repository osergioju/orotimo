import type { Request, Response, NextFunction } from 'express'
import { classAvailabilityService } from '../services/classAvailability.service'
import { classesService } from '../services/classes.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const classAvailabilityController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const klass = await classesService.getById(req.params.classId)
      if (!klass) throw new NotFoundError('Turma não encontrada')

      await accessService.assertSchoolOwnership(klass.schoolId, req.userId!)
      const slots = await classAvailabilityService.getForClass(klass.id)
      res.json({ slots })
    } catch (error) {
      next(error)
    }
  },

  async replace(req: Request, res: Response, next: NextFunction) {
    try {
      const { slots } = req.body ?? {}
      if (!Array.isArray(slots)) throw new BadRequestError('slots deve ser uma lista')

      const klass = await classesService.getById(req.params.classId)
      if (!klass) throw new NotFoundError('Turma não encontrada')

      await accessService.assertSchoolOwnership(klass.schoolId, req.userId!)
      const saved = await classAvailabilityService.replaceForClass(klass.id, slots)

      res.json({ slots: saved })
    } catch (error) {
      next(error)
    }
  },
}
