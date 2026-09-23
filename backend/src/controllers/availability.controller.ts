import type { Request, Response, NextFunction } from 'express'
import { availabilityService } from '../services/availability.service'
import { teachersService } from '../services/teachers.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const availabilityController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await teachersService.getById(req.params.teacherId)
      if (!teacher) throw new NotFoundError('Professor não encontrado')

      await accessService.assertSchoolOwnership(teacher.schoolId, req.userId!)
      const slots = await availabilityService.getForTeacher(teacher.id)
      res.json({ slots })
    } catch (error) {
      next(error)
    }
  },

  async replace(req: Request, res: Response, next: NextFunction) {
    try {
      const { slots } = req.body ?? {}
      if (!Array.isArray(slots)) throw new BadRequestError('slots deve ser uma lista')

      const teacher = await teachersService.getById(req.params.teacherId)
      if (!teacher) throw new NotFoundError('Professor não encontrado')

      await accessService.assertSchoolOwnership(teacher.schoolId, req.userId!)
      const saved = await availabilityService.replaceForTeacher(teacher.id, slots)

      res.json({ slots: saved })
    } catch (error) {
      next(error)
    }
  },
}
