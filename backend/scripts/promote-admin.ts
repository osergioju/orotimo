/**
 * Promove um usuário já existente a admin (role='admin') — dá acesso ao
 * Admin Master (/admin). Não apaga nada.
 *
 *   npx tsx scripts/promote-admin.ts email@dominio.com
 */
import { prisma } from '../src/lib/prisma'

async function main() {
  const [email] = process.argv.slice(2)
  if (!email) {
    console.error('Uso: npx tsx scripts/promote-admin.ts email@dominio.com')
    process.exit(1)
  }

  const user = await prisma.user.update({ where: { email }, data: { role: 'admin' } })
  console.log(`${user.email} agora é admin.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
