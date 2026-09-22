import type { Request, Response, NextFunction } from 'express'
import { systemsService } from '../services/systems.service'

export const systemsController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const systems = await systemsService.listAll()
      res.json({ systems })
    } catch (error) {
      next(error)
    }
  },
}
