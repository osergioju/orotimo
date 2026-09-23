import type { Request, Response, NextFunction } from 'express'
import { schedulesService } from '../services/schedules.service'
import { accessService } from '../services/access.service'
import { solverService } from '../services/solver.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const schedulesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined
      if (!schoolId) throw new BadRequestError('schoolId é obrigatório')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const schedules = await schedulesService.listBySchool(schoolId)
      res.json({ schedules })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, name, period, academicYear } = req.body ?? {}
      if (!schoolId || !name) throw new BadRequestError('schoolId e name são obrigatórios')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const schedule = await schedulesService.create({ schoolId, name, period, academicYear })

      res.status(201).json({ schedule })
    } catch (error) {
      next(error)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await schedulesService.getById(req.params.id)
      if (!schedule) throw new NotFoundError('Escala não encontrada')

      await accessService.assertSchoolOwnership(schedule.schoolId, req.userId!)
      res.json({ schedule })
    } catch (error) {
      next(error)
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body ?? {}
      if (status !== 'draft' && status !== 'generated') {
        throw new BadRequestError('status deve ser "draft" ou "generated"')
      }

      const schedule = await schedulesService.getById(req.params.id)
      if (!schedule) throw new NotFoundError('Escala não encontrada')

      await accessService.assertSchoolOwnership(schedule.schoolId, req.userId!)
      const updated = await schedulesService.updateStatus(schedule.id, status)

      res.json({ schedule: updated })
    } catch (error) {
      next(error)
    }
  },

  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await schedulesService.getById(req.params.id)
      if (!schedule) throw new NotFoundError('Escala não encontrada')

      await accessService.assertSchoolOwnership(schedule.schoolId, req.userId!)
      const result = await solverService.generate(schedule.id)

      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  async getSolutions(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await schedulesService.getById(req.params.id)
      if (!schedule) throw new NotFoundError('Escala não encontrada')

      await accessService.assertSchoolOwnership(schedule.schoolId, req.userId!)
      const solutions = await solverService.getSolutions(schedule.id)

      res.json({ solutions })
    } catch (error) {
      next(error)
    }
  },
}
