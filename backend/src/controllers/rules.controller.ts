import type { Request, Response, NextFunction } from 'express'
import { rulesService } from '../services/rules.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const rulesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined
      if (!schoolId) throw new BadRequestError('schoolId é obrigatório')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const rules = await rulesService.listBySchool(schoolId)
      res.json({ rules })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, description, type, weight } = req.body ?? {}
      if (!schoolId || !description) throw new BadRequestError('schoolId e description são obrigatórios')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)

      const created = await rulesService.create({
        schoolId,
        description,
        type: type === 'hard' ? 'hard' : 'soft',
        weight: weight != null ? Number(weight) : 5,
      })

      res.status(201).json({ rule: created })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await rulesService.getById(req.params.id)
      if (!rule) throw new NotFoundError('Regra não encontrada')

      await accessService.assertSchoolOwnership(rule.schoolId, req.userId!)
      await rulesService.delete(rule.id)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
