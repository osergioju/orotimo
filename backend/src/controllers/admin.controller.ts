import type { Request, Response, NextFunction } from 'express'
import { usersRepository } from '../repositories/users.repository'
import { prisma } from '../lib/prisma'

export const adminController = {
  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersRepository.list()
      res.json({ users })
    } catch (error) {
      next(error)
    }
  },

  async listSchools(_req: Request, res: Response, next: NextFunction) {
    try {
      const schools = await prisma.school.findMany({ orderBy: { createdAt: 'asc' } })
      res.json({ schools })
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
