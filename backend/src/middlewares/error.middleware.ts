import type { NextFunction, Request, Response } from 'express'

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : 'Erro interno inesperado'
  const status = err instanceof Error && err.name === 'InvalidCredentialsError' ? 401 : 500

  res.status(status).json({ error: message })
}
