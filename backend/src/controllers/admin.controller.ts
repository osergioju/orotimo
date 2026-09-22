import type { Request, Response, NextFunction } from 'express'
import { usersRepository } from '../repositories/users.repository'
import { mockSchools, mockSystems, mockUserSystems } from '../mocks/data'

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
      res.json({ schools: mockSchools })
    } catch (error) {
      next(error)
    }
  },

  async listSystems(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ systems: mockSystems })
    } catch (error) {
      next(error)
    }
  },

  async getUserPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params
      const permissions = mockSystems.map((system) => ({
        systemId: system.id,
        systemName: system.name,
        enabled: mockUserSystems.some(
          (userSystem) => userSystem.userId === userId && userSystem.systemId === system.id && userSystem.enabled,
        ),
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

      const existing = mockUserSystems.find(
        (userSystem) => userSystem.userId === userId && userSystem.systemId === systemId,
      )

      if (existing) {
        existing.enabled = Boolean(enabled)
      } else {
        mockUserSystems.push({ userId, systemId, enabled: Boolean(enabled) })
      }

      res.json({ userId, systemId, enabled: Boolean(enabled) })
    } catch (error) {
      next(error)
    }
  },
}
