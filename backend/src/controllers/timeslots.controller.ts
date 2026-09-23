import type { Request, Response, NextFunction } from 'express'
import { timeSlotsService } from '../services/timeslots.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const timeSlotsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined
      if (!schoolId) throw new BadRequestError('schoolId é obrigatório')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const timeSlots = await timeSlotsService.listBySchool(schoolId)
      res.json({ timeSlots })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, label, startTime, endTime, order } = req.body ?? {}
      if (!schoolId || !label || !startTime || !endTime) {
        throw new BadRequestError('schoolId, label, startTime e endTime são obrigatórios')
      }

      await accessService.assertSchoolOwnership(schoolId, req.userId!)

      const created = await timeSlotsService.create({
        schoolId,
        label,
        startTime,
        endTime,
        order: order != null ? Number(order) : 0,
      })

      res.status(201).json({ timeSlot: created })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const timeSlot = await timeSlotsService.getById(req.params.id)
      if (!timeSlot) throw new NotFoundError('Horário não encontrado')

      await accessService.assertSchoolOwnership(timeSlot.schoolId, req.userId!)
      await timeSlotsService.delete(timeSlot.id)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
