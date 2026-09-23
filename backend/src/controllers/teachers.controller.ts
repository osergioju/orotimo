import type { Request, Response, NextFunction } from 'express'
import { teachersService } from '../services/teachers.service'
import { accessService } from '../services/access.service'
import { BadRequestError, NotFoundError } from '../lib/errors'

function parseTeacherPayload(body: Record<string, unknown>) {
  const {
    name,
    email,
    phone,
    cpf,
    birthDate,
    unit,
    subjects,
    contractType,
    maxWeeklyClasses,
    preferredShift,
    twinClasses,
    avoidGaps,
    emailNotifications,
    notes,
    preference,
  } = body

  return {
    name: name as string,
    email: email as string,
    phone: (phone as string) || null,
    cpf: (cpf as string) || null,
    birthDate: birthDate ? new Date(birthDate as string) : null,
    unit: (unit as string) ?? '',
    subjects: Array.isArray(subjects) ? subjects : [],
    contractType: (contractType as string) || null,
    maxWeeklyClasses: Number(maxWeeklyClasses) || 20,
    preferredShift: (preferredShift as string) ?? 'Manhã',
    twinClasses: Boolean(twinClasses),
    avoidGaps: Boolean(avoidGaps),
    emailNotifications: Boolean(emailNotifications),
    notes: (notes as string) || null,
    preference: preference != null ? Number(preference) : undefined,
  }
}

export const teachersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.query.schoolId as string | undefined
      if (!schoolId) throw new BadRequestError('schoolId é obrigatório')

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const teachers = await teachersService.listBySchool(schoolId)
      res.json({ teachers })
    } catch (error) {
      next(error)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.body ?? {}
      const payload = parseTeacherPayload(req.body ?? {})

      if (!schoolId || !payload.name || !payload.email) {
        throw new BadRequestError('schoolId, name e email são obrigatórios')
      }

      await accessService.assertSchoolOwnership(schoolId, req.userId!)
      const teacher = await teachersService.create({ schoolId, ...payload })

      res.status(201).json({ teacher })
    } catch (error) {
      next(error)
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await teachersService.getById(req.params.id)
      if (!teacher) throw new NotFoundError('Professor não encontrado')

      await accessService.assertSchoolOwnership(teacher.schoolId, req.userId!)
      res.json({ teacher })
    } catch (error) {
      next(error)
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await teachersService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Professor não encontrado')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)

      const payload = parseTeacherPayload(req.body ?? {})
      if (!payload.name || !payload.email) {
        throw new BadRequestError('name e email são obrigatórios')
      }

      const teacher = await teachersService.update(existing.id, payload)
      res.json({ teacher })
    } catch (error) {
      next(error)
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await teachersService.getById(req.params.id)
      if (!existing) throw new NotFoundError('Professor não encontrado')

      await accessService.assertSchoolOwnership(existing.schoolId, req.userId!)
      await teachersService.delete(existing.id)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
