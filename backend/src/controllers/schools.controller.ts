import type { Request, Response, NextFunction } from 'express'
import { schoolsService } from '../services/schools.service'
import { schedulesService } from '../services/schedules.service'

const DEFAULT_OWNER_ID = 'user-1'

export const schoolsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.userId ?? DEFAULT_OWNER_ID
      const schools = await schoolsService.listMine(ownerId)
      res.json({ schools })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.userId ?? DEFAULT_OWNER_ID
      const { name, cnpj, description, logoUrl, unitsCount } = req.body ?? {}

      if (!name) {
        res.status(400).json({ error: 'Nome da escola é obrigatório' })
        return
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
      const school = await schoolsService.getById(req.params.id)

      if (!school) {
        res.status(404).json({ error: 'Escola não encontrada' })
        return
      }

      res.json({ school })
    } catch (error) {
      next(error)
    }
  },

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const school = await schoolsService.getById(req.params.id)

      if (!school) {
        res.status(404).json({ error: 'Escola não encontrada' })
        return
      }

      const dashboard = await schedulesService.getSchoolDashboard(school.id)
      res.json({ school, ...dashboard })
    } catch (error) {
      next(error)
    }
  },
}
