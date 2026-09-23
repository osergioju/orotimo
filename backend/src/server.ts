import 'dotenv/config'
import { app } from './app'
import { prisma } from './lib/prisma'

const PORT = Number(process.env.PORT) || 4000

const server = app.listen(PORT, () => {
  console.log(`Scale Engine API rodando em http://localhost:${PORT}`)
})

async function shutdown(signal: string) {
  console.log(`\n${signal} recebido, encerrando servidor...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
