/**
 * Cria uma escola de teste completa (mesmo cenário usado localmente: 3 turmas,
 * 7 professores, 8 disciplinas, com 3 pequenas inconsistências propositais
 * para testar a validação do solver) para um usuário já existente — sem
 * apagar nada do banco, ao contrário de `prisma/seed.ts`.
 *
 * Uso:
 *   npx tsx scripts/populate-demo-school.ts email@dono.com "Nome da Escola"
 */
import { prisma } from '../src/lib/prisma'

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

const SLOT_DEFS = [
  { label: 'Aula 1', startTime: '07:00', endTime: '07:50' },
  { label: 'Aula 2', startTime: '07:50', endTime: '08:40' },
  { label: 'Aula 3', startTime: '09:00', endTime: '09:50' },
  { label: 'Aula 4', startTime: '09:50', endTime: '10:40' },
  { label: 'Aula 5', startTime: '10:40', endTime: '11:30' },
]

function buildAvailability<TKey extends string>(key: TKey, entityId: string, timeSlotIds: string[], rows: string[]) {
  return rows.flatMap((row, rowIndex) =>
    row.split('').map((flag, colIndex) => ({
      [key]: entityId,
      timeSlotId: timeSlotIds[rowIndex],
      day: DAYS[colIndex],
      available: flag === '1',
    })),
  ) as Record<TKey | 'timeSlotId' | 'day' | 'available', string | boolean>[]
}

async function main() {
  const [ownerEmail, schoolName] = process.argv.slice(2)
  if (!ownerEmail || !schoolName) {
    console.error('Uso: npx tsx scripts/populate-demo-school.ts email@dono.com "Nome da Escola"')
    process.exit(1)
  }

  const owner = await prisma.user.findUniqueOrThrow({ where: { email: ownerEmail } })

  console.log(`Criando escola "${schoolName}" para ${owner.email}...`)
  const school = await prisma.school.create({
    data: {
      ownerId: owner.id,
      name: schoolName,
      cnpj: '12.345.678/0001-90',
      description: 'Escola de teste (dados fictícios, para validar o fluxo completo)',
      unitsCount: 2,
    },
  })

  const escalas = await prisma.system.upsert({
    where: { key: 'escalas' },
    update: {},
    create: { key: 'escalas', name: 'Escalas', description: 'Criar e otimizar escalas', status: 'active' },
  })
  await prisma.userSystem.upsert({
    where: { userId_systemId: { userId: owner.id, systemId: escalas.id } },
    update: { enabled: true },
    create: { userId: owner.id, systemId: escalas.id, enabled: true },
  })

  await prisma.schedule.createMany({
    data: [
      { schoolId: school.id, name: 'Grade 2027', period: 'Anual', academicYear: '2027', status: 'draft' },
      { schoolId: school.id, name: 'Grade 2026', period: 'Anual', academicYear: '2026', status: 'draft' },
    ],
  })

  const slots = []
  for (const [index, def] of SLOT_DEFS.entries()) {
    slots.push(await prisma.timeSlot.create({ data: { schoolId: school.id, order: index, ...def } }))
  }
  const slotIds = slots.map((s) => s.id)

  const turma7a = await prisma.class.create({ data: { schoolId: school.id, name: '7º Ano A', shift: 'Manhã', studentsCount: 28 } })
  const turma8b = await prisma.class.create({ data: { schoolId: school.id, name: '8º Ano B', shift: 'Manhã', studentsCount: 25 } })
  const turmaEm = await prisma.class.create({ data: { schoolId: school.id, name: '1º Ano EM', shift: 'Tarde', studentsCount: 32 } })

  const [matematica, fisica, quimica, biologia, historia, geografia, portugues, ingles] = await Promise.all([
    prisma.subject.create({ data: { schoolId: school.id, name: 'Matemática', weeklyHours: 5 } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Física', weeklyHours: 3 } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Química', weeklyHours: 3 } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Biologia', weeklyHours: 2 } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'História', weeklyHours: 2 } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Geografia', weeklyHours: 2 } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Português', weeklyHours: 5 } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Inglês', weeklyHours: 2 } }),
  ])

  await prisma.room.createMany({
    data: [
      { schoolId: school.id, name: 'Sala 101', capacity: 30 },
      { schoolId: school.id, name: 'Sala 102', capacity: 30 },
      { schoolId: school.id, name: 'Laboratório de Ciências', capacity: 24 },
    ],
  })

  await prisma.rule.createMany({
    data: [
      { schoolId: school.id, description: 'Professor não pode estar em duas turmas ao mesmo tempo', type: 'hard', weight: 10 },
      { schoolId: school.id, description: 'Turma não pode ter duas disciplinas no mesmo horário', type: 'hard', weight: 10 },
      { schoolId: school.id, description: 'Evitar janelas na grade dos professores', type: 'soft', weight: 6 },
      { schoolId: school.id, description: 'Distribuir aulas de Educação Física ao longo da semana', type: 'soft', weight: 4 },
    ],
  })

  const ana = await prisma.teacher.create({
    data: {
      schoolId: school.id, name: 'Profa. Ana Ribeiro', email: 'ana.ribeiro@escolaabc.com.br', unit: `${schoolName} · Sede`,
      subjects: ['Matemática', 'Física'], contractType: 'CLT', maxWeeklyClasses: 20, preferredShift: 'Manhã',
      twinClasses: true, avoidGaps: true, emailNotifications: false,
    },
  })
  const carlos = await prisma.teacher.create({
    data: {
      schoolId: school.id, name: 'Prof. Carlos Mendes', email: 'carlos.mendes@escolaabc.com.br', unit: `${schoolName} · Sede`,
      subjects: ['História', 'Geografia'], contractType: 'CLT', maxWeeklyClasses: 18, preferredShift: 'Manhã',
      twinClasses: false, avoidGaps: true, emailNotifications: true,
    },
  })
  const bia = await prisma.teacher.create({
    data: {
      schoolId: school.id, name: 'Profa. Beatriz Lima', email: 'beatriz.lima@escolaabc.com.br', unit: `${schoolName} · Sede`,
      subjects: ['Química', 'Biologia'], contractType: 'PJ', maxWeeklyClasses: 20, preferredShift: 'Manhã',
      twinClasses: true, avoidGaps: false, emailNotifications: false,
    },
  })
  const camila = await prisma.teacher.create({
    data: {
      schoolId: school.id, name: 'Profa. Camila Santos', email: 'camila.santos@escolaabc.com.br', unit: `${schoolName} · Sede`,
      subjects: ['Português'], contractType: 'CLT', maxWeeklyClasses: 20, preferredShift: 'Manhã',
      twinClasses: false, avoidGaps: true, emailNotifications: true,
    },
  })
  const diego = await prisma.teacher.create({
    data: {
      schoolId: school.id, name: 'Prof. Diego Alves', email: 'diego.alves@escolaabc.com.br', unit: `${schoolName} · Sede`,
      subjects: ['Inglês'], contractType: 'PJ', maxWeeklyClasses: 8, preferredShift: 'Manhã',
      twinClasses: false, avoidGaps: false, emailNotifications: false,
    },
  })
  const eduardo = await prisma.teacher.create({
    data: {
      schoolId: school.id, name: 'Prof. Eduardo Nascimento', email: 'eduardo.nascimento@escolaabc.com.br', unit: `${schoolName} · Sede`,
      subjects: ['Matemática', 'Física'], contractType: 'CLT', maxWeeklyClasses: 20, preferredShift: 'Tarde',
      twinClasses: true, avoidGaps: true, emailNotifications: false,
    },
  })
  const gabriela = await prisma.teacher.create({
    data: {
      schoolId: school.id, name: 'Profa. Gabriela Rocha', email: 'gabriela.rocha@escolaabc.com.br', unit: `${schoolName} · Sede`,
      subjects: ['Química', 'Biologia'], contractType: 'Temporário', maxWeeklyClasses: 16, preferredShift: 'Tarde',
      twinClasses: false, avoidGaps: false, emailNotifications: false,
    },
  })

  await prisma.teacherAvailabilitySlot.createMany({
    data: [
      ...buildAvailability('teacherId', ana.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', carlos.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', bia.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', eduardo.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', gabriela.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', camila.id, slotIds, ['11100', '11100', '11100', '11100', '11100']),
      ...buildAvailability('teacherId', diego.id, slotIds, ['11000', '10000', '00000', '00000', '00000']),
    ],
  })

  await prisma.classAvailabilitySlot.createMany({
    data: [
      ...buildAvailability('classId', turma7a.id, slotIds, ['11111', '11111', '11111', '11111', '11101']),
      ...buildAvailability('classId', turma8b.id, slotIds, ['11111', '11111', '11111', '11111', '11101']),
      ...buildAvailability('classId', turmaEm.id, slotIds, ['11111', '11111', '11111', '11111', '11101']),
    ],
  })

  await prisma.assignment.createMany({
    data: [
      { schoolId: school.id, classId: turma7a.id, subjectId: matematica.id, teacherId: ana.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma7a.id, subjectId: fisica.id, teacherId: ana.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma7a.id, subjectId: quimica.id, teacherId: bia.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma7a.id, subjectId: biologia.id, teacherId: bia.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma7a.id, subjectId: historia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma7a.id, subjectId: geografia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma7a.id, subjectId: portugues.id, teacherId: camila.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma7a.id, subjectId: ingles.id, teacherId: diego.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },

      { schoolId: school.id, classId: turma8b.id, subjectId: matematica.id, teacherId: ana.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma8b.id, subjectId: fisica.id, teacherId: ana.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma8b.id, subjectId: quimica.id, teacherId: bia.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma8b.id, subjectId: biologia.id, teacherId: bia.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma8b.id, subjectId: historia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma8b.id, subjectId: geografia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turma8b.id, subjectId: portugues.id, teacherId: camila.id, weeklyMinClasses: 5, dailyMaxClasses: 1 },
      { schoolId: school.id, classId: turma8b.id, subjectId: ingles.id, teacherId: diego.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },

      { schoolId: school.id, classId: turmaEm.id, subjectId: matematica.id, teacherId: eduardo.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turmaEm.id, subjectId: fisica.id, teacherId: eduardo.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turmaEm.id, subjectId: quimica.id, teacherId: gabriela.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turmaEm.id, subjectId: biologia.id, teacherId: gabriela.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turmaEm.id, subjectId: historia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turmaEm.id, subjectId: geografia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: school.id, classId: turmaEm.id, subjectId: portugues.id, teacherId: camila.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
    ],
  })

  console.log(`Pronto: escola "${schoolName}" (id ${school.id}) criada para ${owner.email}.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
