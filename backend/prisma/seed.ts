import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
const DEMO_PASSWORD = 'escala123'

const SLOT_DEFS = [
  { label: 'Aula 1', startTime: '07:00', endTime: '07:50' },
  { label: 'Aula 2', startTime: '07:50', endTime: '08:40' },
  { label: 'Aula 3', startTime: '09:00', endTime: '09:50' },
  { label: 'Aula 4', startTime: '09:50', endTime: '10:40' },
  { label: 'Aula 5', startTime: '10:40', endTime: '11:30' },
]

function buildAvailability<TKey extends string>(
  key: TKey,
  entityId: string,
  timeSlotIds: string[],
  rows: string[],
) {
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
  console.log('Limpando dados existentes...')
  await prisma.classAvailabilitySlot.deleteMany()
  await prisma.teacherAvailabilitySlot.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.rule.deleteMany()
  await prisma.timeSlot.deleteMany()
  await prisma.room.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.class.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.school.deleteMany()
  await prisma.userSystem.deleteMany()
  await prisma.system.deleteMany()
  await prisma.user.deleteMany()

  console.log('Criando usuários...')
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)
  const junior = await prisma.user.create({
    data: { name: 'Junior', email: 'junior@crtcomunicacao.com.br', passwordHash },
  })
  await prisma.user.create({ data: { name: 'João Silva', email: 'joao@escola.com', passwordHash } })
  await prisma.user.create({ data: { name: 'Maria Souza', email: 'maria@escola.com', passwordHash } })

  console.log('Criando sistemas...')
  const [escalas, aviacao, varejo, saude] = await Promise.all([
    prisma.system.create({ data: { key: 'escalas', name: 'Escalas', description: 'Criar e otimizar escalas', status: 'active' } }),
    prisma.system.create({ data: { key: 'aviacao', name: 'Aviação', description: 'Em breve', status: 'coming_soon' } }),
    prisma.system.create({ data: { key: 'varejo', name: 'Varejo', description: 'Em breve', status: 'coming_soon' } }),
    prisma.system.create({ data: { key: 'saude', name: 'Saúde', description: 'Em breve', status: 'coming_soon' } }),
  ])

  await prisma.userSystem.createMany({
    data: [
      { userId: junior.id, systemId: escalas.id, enabled: true },
      { userId: junior.id, systemId: aviacao.id, enabled: false },
      { userId: junior.id, systemId: varejo.id, enabled: false },
      { userId: junior.id, systemId: saude.id, enabled: false },
    ],
  })

  console.log('Criando escolas...')
  const schoolAbc = await prisma.school.create({
    data: {
      ownerId: junior.id,
      name: 'Escola ABC',
      cnpj: '12.345.678/0001-90',
      description: 'Escola de ensino fundamental e médio',
      unitsCount: 2,
    },
  })
  await prisma.school.create({
    data: {
      ownerId: junior.id,
      name: 'Escola XYZ',
      cnpj: '98.765.432/0001-10',
      description: 'Escola técnica profissionalizante',
      unitsCount: 1,
    },
  })

  console.log('Criando escalas (schedules)...')
  await prisma.schedule.createMany({
    data: [
      { schoolId: schoolAbc.id, name: 'Grade 2027', period: 'Anual', academicYear: '2027', status: 'draft' },
      { schoolId: schoolAbc.id, name: 'Grade 2026', period: 'Anual', academicYear: '2026', status: 'generated' },
    ],
  })

  console.log('Criando horários (momentos)...')
  const slots = []
  for (const [index, def] of SLOT_DEFS.entries()) {
    slots.push(await prisma.timeSlot.create({ data: { schoolId: schoolAbc.id, order: index, ...def } }))
  }
  const slotIds = slots.map((s) => s.id)

  console.log('Criando turmas...')
  const turma7a = await prisma.class.create({ data: { schoolId: schoolAbc.id, name: '7º Ano A', shift: 'Manhã', studentsCount: 28 } })
  const turma8b = await prisma.class.create({ data: { schoolId: schoolAbc.id, name: '8º Ano B', shift: 'Manhã', studentsCount: 25 } })
  const turmaEm = await prisma.class.create({ data: { schoolId: schoolAbc.id, name: '1º Ano EM', shift: 'Tarde', studentsCount: 32 } })

  console.log('Criando disciplinas...')
  const [matematica, fisica, quimica, biologia, historia, geografia, portugues, ingles] = await Promise.all([
    prisma.subject.create({ data: { schoolId: schoolAbc.id, name: 'Matemática', weeklyHours: 5 } }),
    prisma.subject.create({ data: { schoolId: schoolAbc.id, name: 'Física', weeklyHours: 3 } }),
    prisma.subject.create({ data: { schoolId: schoolAbc.id, name: 'Química', weeklyHours: 3 } }),
    prisma.subject.create({ data: { schoolId: schoolAbc.id, name: 'Biologia', weeklyHours: 2 } }),
    prisma.subject.create({ data: { schoolId: schoolAbc.id, name: 'História', weeklyHours: 2 } }),
    prisma.subject.create({ data: { schoolId: schoolAbc.id, name: 'Geografia', weeklyHours: 2 } }),
    prisma.subject.create({ data: { schoolId: schoolAbc.id, name: 'Português', weeklyHours: 5 } }),
    prisma.subject.create({ data: { schoolId: schoolAbc.id, name: 'Inglês', weeklyHours: 2 } }),
  ])

  console.log('Criando salas...')
  await prisma.room.createMany({
    data: [
      { schoolId: schoolAbc.id, name: 'Sala 101', capacity: 30 },
      { schoolId: schoolAbc.id, name: 'Sala 102', capacity: 30 },
      { schoolId: schoolAbc.id, name: 'Laboratório de Ciências', capacity: 24 },
    ],
  })

  console.log('Criando regras...')
  await prisma.rule.createMany({
    data: [
      { schoolId: schoolAbc.id, description: 'Professor não pode estar em duas turmas ao mesmo tempo', type: 'hard', weight: 10 },
      { schoolId: schoolAbc.id, description: 'Turma não pode ter duas disciplinas no mesmo horário', type: 'hard', weight: 10 },
      { schoolId: schoolAbc.id, description: 'Evitar janelas na grade dos professores', type: 'soft', weight: 6 },
      { schoolId: schoolAbc.id, description: 'Distribuir aulas de Educação Física ao longo da semana', type: 'soft', weight: 4 },
    ],
  })

  console.log('Criando professores...')
  const ana = await prisma.teacher.create({
    data: {
      schoolId: schoolAbc.id,
      name: 'Profa. Ana Ribeiro',
      email: 'ana.ribeiro@escolaabc.com.br',
      unit: 'Escola ABC · Sede',
      subjects: ['Matemática', 'Física'],
      contractType: 'CLT',
      maxWeeklyClasses: 20,
      preferredShift: 'Manhã',
      twinClasses: true,
      avoidGaps: true,
      emailNotifications: false,
    },
  })
  const carlos = await prisma.teacher.create({
    data: {
      schoolId: schoolAbc.id,
      name: 'Prof. Carlos Mendes',
      email: 'carlos.mendes@escolaabc.com.br',
      unit: 'Escola ABC · Sede',
      subjects: ['História', 'Geografia'],
      contractType: 'CLT',
      maxWeeklyClasses: 18,
      preferredShift: 'Manhã',
      twinClasses: false,
      avoidGaps: true,
      emailNotifications: true,
    },
  })
  const bia = await prisma.teacher.create({
    data: {
      schoolId: schoolAbc.id,
      name: 'Profa. Beatriz Lima',
      email: 'beatriz.lima@escolaabc.com.br',
      unit: 'Escola ABC · Sede',
      subjects: ['Química', 'Biologia'],
      contractType: 'PJ',
      maxWeeklyClasses: 20,
      preferredShift: 'Manhã',
      twinClasses: true,
      avoidGaps: false,
      emailNotifications: false,
    },
  })

  // Disponibilidades desenhadas para que a carga horária atribuída a cada turma
  // (ver "Criando atribuições" abaixo) preencha exatamente sua disponibilidade
  // total — o solver exige essa consistência nas checagens de pré-validação.
  console.log('Criando disponibilidade de professores...')
  await prisma.teacherAvailabilitySlot.createMany({
    data: [
      // Ana e Bia: disponíveis Seg/Ter/Qua em todos os momentos (superset da 7º Ano A)
      ...buildAvailability('teacherId', ana.id, slotIds, ['11100', '11100', '11100', '11100', '11100']),
      ...buildAvailability('teacherId', bia.id, slotIds, ['11100', '11100', '11100', '11100', '11100']),
      // Carlos: disponível Seg/Ter em todos os momentos (superset da 8º Ano B)
      ...buildAvailability('teacherId', carlos.id, slotIds, ['11000', '11000', '11000', '11000', '11000']),
    ],
  })

  console.log('Criando disponibilidade de turmas...')
  await prisma.classAvailabilitySlot.createMany({
    data: [
      // 7º Ano A: Seg/Ter completos + Qua (Aula 1-3) = 13 aulas/semana (Matemática 5 + Física 3 + Química 3 + Biologia 2)
      ...buildAvailability('classId', turma7a.id, slotIds, ['11100', '11100', '11100', '11000', '11000']),
      // 8º Ano B: Seg/Ter (Aula 1-2) = 4 aulas/semana (História 2 + Geografia 2)
      ...buildAvailability('classId', turma8b.id, slotIds, ['11000', '11000', '00000', '00000', '00000']),
      // 1º Ano EM: sem disponibilidade cadastrada ainda (sem atribuições nesta demo)
      ...buildAvailability('classId', turmaEm.id, slotIds, ['00000', '00000', '00000', '00000', '00000']),
    ],
  })

  console.log('Criando atribuições (professor x turma x disciplina)...')
  await prisma.assignment.createMany({
    data: [
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: matematica.id, teacherId: ana.id, weeklyMinClasses: 5, dailyMaxClasses: 3 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: fisica.id, teacherId: ana.id, weeklyMinClasses: 3, dailyMaxClasses: 3 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: quimica.id, teacherId: bia.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: biologia.id, teacherId: bia.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: historia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: geografia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
    ],
  })

  console.log(`Seed concluído. Senha de demonstração para todos os usuários: "${DEMO_PASSWORD}"`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
