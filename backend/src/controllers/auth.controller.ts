import type { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body ?? {}

      if (!email || !password) {
        res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
        return
      }

      const result = await authService.login(email, password)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },
}
