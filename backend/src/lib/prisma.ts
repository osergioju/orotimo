import { PrismaClient } from '@prisma/client'

/**
 * Instância única do Prisma Client. Evita esgotar o pool de conexões do
 * Postgres criando um client novo a cada import (crítico em dev com hot-reload).
 */
export const prisma = new PrismaClient()
