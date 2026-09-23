import type { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { usersRepository } from '../repositories/users.repository'
import { prisma } from '../lib/prisma'
import { BadRequestError, NotFoundError } from '../lib/errors'

export const adminController = {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [users, schools, teachers, schedules, admins] = await Promise.all([
        prisma.user.count(),
        prisma.school.count(),
        prisma.teacher.count(),
        prisma.schedule.count(),
        prisma.user.count({ where: { role: 'admin' } }),
      ])

      res.json({ users, schools, teachers, schedules, admins })
    } catch (error) {
      next(error)
    }
  },

  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersRepository.list()
      res.json({ users })
    } catch (error) {
      next(error)
    }
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body ?? {}

      if (!name || !email || !password) {
        throw new BadRequestError('name, email e password são obrigatórios')
      }
      if (role && role !== 'admin' && role !== 'user') {
        throw new BadRequestError('role deve ser "admin" ou "user"')
      }

      const existing = await usersRepository.findByEmail(email)
      if (existing) {
        throw new BadRequestError('Já existe um usuário com este e-mail')
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const user = await usersRepository.create({ name, email, passwordHash, role })

      const { passwordHash: _omit, ...publicUser } = user
      res.status(201).json({ user: publicUser })
    } catch (error) {
      next(error)
    }
  },

  async listSchools(_req: Request, res: Response, next: NextFunction) {
    try {
      const schools = await prisma.school.findMany({
        orderBy: { createdAt: 'asc' },
        include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { members: true } } },
      })
      res.json({ schools })
    } catch (error) {
      next(error)
    }
  },

  async listSchoolMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.params
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      })
      if (!school) throw new NotFoundError('Escola não encontrada')

      res.json({
        owner: school.owner,
        members: school.members.map((m) => ({ id: m.id, userId: m.userId, name: m.user.name, email: m.user.email })),
      })
    } catch (error) {
      next(error)
    }
  },

  async addSchoolMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.params
      const { email } = req.body ?? {}
      if (!email) throw new BadRequestError('email é obrigatório')

      const school = await prisma.school.findUnique({ where: { id: schoolId } })
      if (!school) throw new NotFoundError('Escola não encontrada')

      const user = await usersRepository.findByEmail(email)
      if (!user) throw new NotFoundError('Nenhum usuário encontrado com este e-mail')

      if (school.ownerId === user.id) {
        throw new BadRequestError('Este usuário já é o dono da escola')
      }

      const member = await prisma.schoolMember.upsert({
        where: { schoolId_userId: { schoolId, userId: user.id } },
        update: {},
        create: { schoolId, userId: user.id },
      })

      res.status(201).json({ member: { id: member.id, userId: user.id, name: user.name, email: user.email } })
    } catch (error) {
      next(error)
    }
  },

  async removeSchoolMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, userId } = req.params
      await prisma.schoolMember.deleteMany({ where: { schoolId, userId } })
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },

  async listSystems(_req: Request, res: Response, next: NextFunction) {
    try {
      const systems = await prisma.system.findMany({ orderBy: { name: 'asc' } })
      res.json({ systems })
    } catch (error) {
      next(error)
    }
  },

  async getUserPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params
      const systems = await prisma.system.findMany({
        orderBy: { name: 'asc' },
        include: { userSystems: { where: { userId } } },
      })

      const permissions = systems.map((system) => ({
        systemId: system.id,
        systemName: system.name,
        enabled: system.userSystems.some((userSystem) => userSystem.enabled),
      }))

      res.json({ userId, permissions })
    } catch (error) {
      next(error)
    }
  },

  async updateUserPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params
      const { systemId, enabled } = req.body ?? {}

      if (!systemId) {
        res.status(400).json({ error: 'systemId é obrigatório' })
        return
      }

      await prisma.userSystem.upsert({
        where: { userId_systemId: { userId, systemId } },
        create: { userId, systemId, enabled: Boolean(enabled) },
        update: { enabled: Boolean(enabled) },
      })

      res.json({ userId, systemId, enabled: Boolean(enabled) })
    } catch (error) {
      next(error)
    }
  },
}
