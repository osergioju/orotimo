import { writeFileSync } from 'node:fs'
import { prisma } from '../src/lib/prisma'
import { buildSolverPayload } from '../src/services/solverPayload.service'

async function main() {
  const schoolName = process.argv[2] ?? 'Escola ABC'
  const outPath = process.argv[3] ?? '/tmp/solver-payload.json'

  const school = await prisma.school.findFirstOrThrow({ where: { name: schoolName } })
  const payload = await buildSolverPayload(school.id)
  writeFileSync(outPath, JSON.stringify(payload, null, 2))
  console.log(`Payload escrito em ${outPath}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
