import type { Request, Response, NextFunction } from 'express'
import { schoolsService } from '../services/schools.service'
import { schedulesService } from '../services/schedules.service'
import { accessService } from '../services/access.service'
import { BadRequestError } from '../lib/errors'

export const schoolsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.userId!
      const schools = await schoolsService.listMine(ownerId)
      res.json({ schools })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.userId!
      const { name, cnpj, description, logoUrl, unitsCount } = req.body ?? {}

      if (!name) {
        throw new BadRequestError('Nome da escola é obrigatório')
      }

      const school = await schoolsService.create({
        ownerId,
        name,
        cnpj: cnpj ?? '',
        description: description ?? '',
        logoUrl,
        unitsCount: Number(unitsCount) || 1,
      })

      res.status(201).json({ school })
    } catch (error) {
      next(error)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const school = await accessService.assertSchoolOwnership(req.params.id, req.userId!)
      res.json({ school })
    } catch (error) {
      next(error)
    }
  },

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const school = await accessService.assertSchoolOwnership(req.params.id, req.userId!)
      const dashboard = await schedulesService.getSchoolDashboard(school.id)
      res.json({ school, ...dashboard })
    } catch (error) {
      next(error)
    }
  },
}
