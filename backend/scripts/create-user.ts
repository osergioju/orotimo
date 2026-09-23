/**
 * Cria (ou atualiza a senha de) um usuário real, sem apagar nada do banco —
 * ao contrário de `prisma/seed.ts`, que reseta tudo. Uso em produção:
 *
 *   npx tsx scripts/create-user.ts "Nome" email@dominio.com senha-forte
 */
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const [name, email, password] = process.argv.slice(2)
  if (!name || !email || !password) {
    console.error('Uso: npx tsx scripts/create-user.ts "Nome" email@dominio.com senha-forte')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  })

  const escalas = await prisma.system.upsert({
    where: { key: 'escalas' },
    update: {},
    create: { key: 'escalas', name: 'Escalas', description: 'Criar e otimizar escalas', status: 'active' },
  })

  await prisma.userSystem.upsert({
    where: { userId_systemId: { userId: user.id, systemId: escalas.id } },
    update: { enabled: true },
    create: { userId: user.id, systemId: escalas.id, enabled: true },
  })

  console.log(`Usuário pronto: ${user.email} (id ${user.id})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
