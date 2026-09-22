import type { Request, Response, NextFunction } from 'express'
import { schedulesService } from '../services/schedules.service'

export const schedulesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined

      if (!schoolId) {
        res.status(400).json({ error: 'schoolId é obrigatório' })
        return
      }

      const schedules = await schedulesService.listBySchool(schoolId)
      res.json({ schedules })
    } catch (error) {
      next(error)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await schedulesService.getById(req.params.id)

      if (!schedule) {
        res.status(404).json({ error: 'Escala não encontrada' })
        return
      }

      res.json({ schedule })
    } catch (error) {
      next(error)
    }
  },
}
