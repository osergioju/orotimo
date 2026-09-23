import type { Request, Response, NextFunction } from 'express'
import { roomsService } from '../services/rooms.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const roomsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined
      if (!schoolId) throw new BadRequestError('schoolId é obrigatório')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const rooms = await roomsService.listBySchool(schoolId)
      res.json({ rooms })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, name, capacity } = req.body ?? {}
      if (!schoolId || !name) throw new BadRequestError('schoolId e name são obrigatórios')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)

      const created = await roomsService.create({
        schoolId,
        name,
        capacity: capacity != null ? Number(capacity) : null,
      })

      res.status(201).json({ room: created })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await roomsService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Sala não encontrada')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)

      const { name, capacity } = req.body ?? {}
      if (!name) throw new BadRequestError('name é obrigatório')

      const updated = await roomsService.update(existing.id, {
        name,
        capacity: capacity != null ? Number(capacity) : null,
      })

      res.json({ room: updated })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await roomsService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Sala não encontrada')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)
      await roomsService.delete(existing.id)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
