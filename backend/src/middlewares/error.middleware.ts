import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../lib/errors'

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Erro interno inesperado' })
}
