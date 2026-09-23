import type { Request, Response, NextFunction } from 'express'
import { classesService } from '../services/classes.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const classesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined
      if (!schoolId) throw new BadRequestError('schoolId é obrigatório')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const classes = await classesService.listBySchool(schoolId)
      res.json({ classes })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, name, shift, studentsCount } = req.body ?? {}
      if (!schoolId || !name) throw new BadRequestError('schoolId e name são obrigatórios')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)

      const created = await classesService.create({
        schoolId,
        name,
        shift: shift ?? 'Manhã',
        studentsCount: studentsCount != null ? Number(studentsCount) : null,
      })

      res.status(201).json({ class: created })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await classesService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Turma não encontrada')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)

      const { name, shift, studentsCount } = req.body ?? {}
      if (!name) throw new BadRequestError('name é obrigatório')

      const updated = await classesService.update(existing.id, {
        name,
        shift: shift ?? 'Manhã',
        studentsCount: studentsCount != null ? Number(studentsCount) : null,
      })

      res.json({ class: updated })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await classesService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Turma não encontrada')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)
      await classesService.delete(existing.id)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
