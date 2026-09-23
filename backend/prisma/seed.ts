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
      { schoolId: schoolAbc.id, name: 'Grade 2026', period: 'Anual', academicYear: '2026', status: 'draft' },
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
  const camila = await prisma.teacher.create({
    data: {
      schoolId: schoolAbc.id,
      name: 'Profa. Camila Santos',
      email: 'camila.santos@escolaabc.com.br',
      unit: 'Escola ABC · Sede',
      subjects: ['Português'],
      contractType: 'CLT',
      maxWeeklyClasses: 20,
      preferredShift: 'Manhã',
      twinClasses: false,
      avoidGaps: true,
      emailNotifications: true,
    },
  })
  const diego = await prisma.teacher.create({
    data: {
      schoolId: schoolAbc.id,
      name: 'Prof. Diego Alves',
      email: 'diego.alves@escolaabc.com.br',
      unit: 'Escola ABC · Sede',
      subjects: ['Inglês'],
      contractType: 'PJ',
      maxWeeklyClasses: 8,
      preferredShift: 'Manhã',
      twinClasses: false,
      avoidGaps: false,
      emailNotifications: false,
    },
  })
  const eduardo = await prisma.teacher.create({
    data: {
      schoolId: schoolAbc.id,
      name: 'Prof. Eduardo Nascimento',
      email: 'eduardo.nascimento@escolaabc.com.br',
      unit: 'Escola ABC · Sede',
      subjects: ['Matemática', 'Física'],
      contractType: 'CLT',
      maxWeeklyClasses: 20,
      preferredShift: 'Tarde',
      twinClasses: true,
      avoidGaps: true,
      emailNotifications: false,
    },
  })
  const gabriela = await prisma.teacher.create({
    data: {
      schoolId: schoolAbc.id,
      name: 'Profa. Gabriela Rocha',
      email: 'gabriela.rocha@escolaabc.com.br',
      unit: 'Escola ABC · Sede',
      subjects: ['Química', 'Biologia'],
      contractType: 'Temporário',
      maxWeeklyClasses: 16,
      preferredShift: 'Tarde',
      twinClasses: false,
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
      // Ana, Carlos, Bia, Eduardo e Gabriela: disponíveis a semana inteira (Seg-Sex), todos os momentos.
      ...buildAvailability('teacherId', ana.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', carlos.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', bia.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', eduardo.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      ...buildAvailability('teacherId', gabriela.id, slotIds, ['11111', '11111', '11111', '11111', '11111']),
      // Camila: só disponibilizou Seg/Ter/Qua (todos os momentos) — 15 horários/semana.
      ...buildAvailability('teacherId', camila.id, slotIds, ['11100', '11100', '11100', '11100', '11100']),
      // Diego: preencheu disponibilidade quase vazia — só 3 horários na semana toda.
      ...buildAvailability('teacherId', diego.id, slotIds, ['11000', '10000', '00000', '00000', '00000']),
    ],
  })

  console.log('Criando disponibilidade de turmas...')
  await prisma.classAvailabilitySlot.createMany({
    data: [
      // 7º Ano A e 8º Ano B: semana cheia menos Quinta/Aula 5 = 24 aulas/semana (bate com o currículo completo).
      ...buildAvailability('classId', turma7a.id, slotIds, ['11111', '11111', '11111', '11111', '11101']),
      ...buildAvailability('classId', turma8b.id, slotIds, ['11111', '11111', '11111', '11111', '11101']),
      // 1º Ano EM: mesma grade "padrão" de 24 aulas/semana — mas o currículo abaixo só usa 22
      // (faltou atribuir um professor de Inglês), então o total cadastrado não bate com a
      // disponibilidade da turma.
      ...buildAvailability('classId', turmaEm.id, slotIds, ['11111', '11111', '11111', '11111', '11101']),
    ],
  })

  console.log('Criando atribuições (professor x turma x disciplina)...')
  await prisma.assignment.createMany({
    data: [
      // 7º Ano A — currículo completo (24 aulas/semana), sem inconsistências.
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: matematica.id, teacherId: ana.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: fisica.id, teacherId: ana.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: quimica.id, teacherId: bia.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: biologia.id, teacherId: bia.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: historia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: geografia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: portugues.id, teacherId: camila.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma7a.id, subjectId: ingles.id, teacherId: diego.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },

      // 8º Ano B — currículo completo (24 aulas/semana), mas com 2 pequenos erros de cadastro:
      // Português com máximo diário de 1 aula (Camila não consegue cobrir 5 aulas/semana só
      // com 3 dias disponíveis e 1 aula/dia) e Inglês dependendo do Diego, que quase não deu
      // disponibilidade.
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: matematica.id, teacherId: ana.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: fisica.id, teacherId: ana.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: quimica.id, teacherId: bia.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: biologia.id, teacherId: bia.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: historia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: geografia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: portugues.id, teacherId: camila.id, weeklyMinClasses: 5, dailyMaxClasses: 1 },
      { schoolId: schoolAbc.id, classId: turma8b.id, subjectId: ingles.id, teacherId: diego.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },

      // 1º Ano EM — falta a atribuição de Inglês (22 de 24 aulas cadastradas).
      { schoolId: schoolAbc.id, classId: turmaEm.id, subjectId: matematica.id, teacherId: eduardo.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turmaEm.id, subjectId: fisica.id, teacherId: eduardo.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turmaEm.id, subjectId: quimica.id, teacherId: gabriela.id, weeklyMinClasses: 3, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turmaEm.id, subjectId: biologia.id, teacherId: gabriela.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turmaEm.id, subjectId: historia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turmaEm.id, subjectId: geografia.id, teacherId: carlos.id, weeklyMinClasses: 2, dailyMaxClasses: 2 },
      { schoolId: schoolAbc.id, classId: turmaEm.id, subjectId: portugues.id, teacherId: camila.id, weeklyMinClasses: 5, dailyMaxClasses: 2 },
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
