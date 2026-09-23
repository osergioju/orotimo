import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me'

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string
  }
}

/**
 * Valida o JWT emitido em `/auth/login` (assinatura + expiração).
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de acesso não informado' })
    return
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string }
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Token de acesso inválido ou expirado' })
  }
}
