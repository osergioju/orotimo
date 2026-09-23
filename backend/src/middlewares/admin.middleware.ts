import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

/**
 * Exige que o usuário autenticado (ver `authMiddleware`, que deve rodar
 * antes) tenha `role === 'admin'`. Sem isso, qualquer conta logada poderia
 * acessar `/admin/*`.
 */
export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } })

  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Acesso restrito a administradores' })
    return
  }

  next()
}
