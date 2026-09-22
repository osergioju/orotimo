import type { NextFunction, Request, Response } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string
  }
}

/**
 * Autenticação mockada via token simples ("mock-token.<userId>").
 * Estrutura preparada para, futuramente, validar um JWT real no header Authorization.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de acesso não informado' })
    return
  }

  const token = authHeader.replace('Bearer ', '')
  const [, userId] = token.split('.')

  if (!userId) {
    res.status(401).json({ error: 'Token de acesso inválido' })
    return
  }

  req.userId = userId
  next()
}
