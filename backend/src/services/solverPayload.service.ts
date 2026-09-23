import { prisma } from '../lib/prisma'
import { BadRequestError } from '../lib/errors'

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

/**
 * Monta o dicionário `configuracoes` no formato exato que o modelo Python
 * legado (solver/modelo/cronogrid.py) espera — ver solver/checagens e
 * solver/restricoes para o contrato de cada chave. Only teachers/classes
 * that have at least one Assignment are fed to the solver: an entity with
 * no assignment would create an unconstrained "phantom" decision variable
 * (nothing in the legacy constraints stops the solver from using it),
 * so we keep them out entirely rather than sending empty structures.
 */
export async function buildSolverPayload(schoolId: string) {
  const [teachersAll, classesAll, subjects, timeSlots, assignments] = await Promise.all([
    prisma.teacher.findMany({ where: { schoolId } }),
    prisma.class.findMany({ where: { schoolId } }),
    prisma.subject.findMany({ where: { schoolId } }),
    prisma.timeSlot.findMany({ where: { schoolId }, orderBy: { order: 'asc' } }),
    prisma.assignment.findMany({ where: { schoolId } }),
  ])

  if (assignments.length === 0) {
    throw new BadRequestError(
      'Nenhuma atribuição (professor x turma x disciplina) cadastrada. Configure as atribuições antes de gerar a escala.',
    )
  }
  if (timeSlots.length === 0) {
    throw new BadRequestError('Nenhum horário (momento) cadastrado para esta escola.')
  }

  const assignedTeacherIds = new Set(assignments.map((a) => a.teacherId))
  const assignedClassIds = new Set(assignments.map((a) => a.classId))
  const teachers = teachersAll.filter((t) => assignedTeacherIds.has(t.id))
  const classes = classesAll.filter((c) => assignedClassIds.has(c.id))

  const [teacherAvailability, classAvailability] = await Promise.all([
    prisma.teacherAvailabilitySlot.findMany({ where: { teacherId: { in: [...assignedTeacherIds] } } }),
    prisma.classAvailabilitySlot.findMany({ where: { classId: { in: [...assignedClassIds] } } }),
  ])

  const momentos: Record<number, string> = {}
  timeSlots.forEach((slot, index) => {
    momentos[index] = slot.label
  })

  const dias: Record<number, string> = {}
  DIAS.forEach((day, index) => {
    dias[index] = day
  })

  const professores: Record<number, string> = {}
  teachers.forEach((teacher, index) => {
    professores[index] = teacher.name
  })

  const turmas: Record<number, string> = {}
  classes.forEach((klass, index) => {
    turmas[index] = klass.name
  })

  const materias: Record<number, string> = {}
  subjects.forEach((subject, index) => {
    materias[index] = subject.name
  })

  const preferenciasMateria: Record<string, number> = {}
  subjects.forEach((subject) => {
    preferenciasMateria[subject.name] = subject.preference
  })

  const preferenciasProfessor: Record<string, number> = {}
  teachers.forEach((teacher) => {
    preferenciasProfessor[teacher.name] = teacher.preference
  })

  const aulasMinimasSemanais: Record<string, Record<string, number>> = {}
  subjects.forEach((subject) => {
    aulasMinimasSemanais[subject.name] = {}
    classes.forEach((klass) => {
      aulasMinimasSemanais[subject.name][klass.name] = 0
    })
  })

  const professoresTurmasMaterias: Record<string, Record<string, string[]>> = {}
  teachers.forEach((teacher) => {
    professoresTurmasMaterias[teacher.name] = {}
  })

  const dailyMaxByTeacherClass = new Map<string, number>()

  for (const assignment of assignments) {
    const teacher = teachers.find((t) => t.id === assignment.teacherId)
    const klass = classes.find((c) => c.id === assignment.classId)
    const subject = subjects.find((s) => s.id === assignment.subjectId)
    if (!teacher || !klass || !subject) continue

    aulasMinimasSemanais[subject.name][klass.name] = assignment.weeklyMinClasses

    const perTeacherClass = professoresTurmasMaterias[teacher.name]
    if (!perTeacherClass[klass.name]) perTeacherClass[klass.name] = []
    perTeacherClass[klass.name].push(subject.name)

    const key = `${teacher.name}::${klass.name}`
    const current = dailyMaxByTeacherClass.get(key)
    dailyMaxByTeacherClass.set(key, current === undefined ? assignment.dailyMaxClasses : Math.min(current, assignment.dailyMaxClasses))
  }

  const aulasMaximasDiarias: Record<string, Record<string, number>> = {}
  teachers.forEach((teacher) => {
    aulasMaximasDiarias[teacher.name] = {}
  })
  for (const [key, value] of dailyMaxByTeacherClass.entries()) {
    const [teacherName, className] = key.split('::')
    aulasMaximasDiarias[teacherName][className] = value
  }

  const teacherAvailMap = new Map<string, boolean>()
  teacherAvailability.forEach((row) => {
    teacherAvailMap.set(`${row.teacherId}::${row.timeSlotId}::${row.day}`, row.available)
  })

  const dfDisponibilidades = teachers.flatMap((teacher) =>
    timeSlots.map((slot) => {
      const record: Record<string, string | number> = { professor: teacher.name, momento: slot.label }
      DIAS.forEach((day) => {
        record[day] = teacherAvailMap.get(`${teacher.id}::${slot.id}::${day}`) ? 1 : 0
      })
      return record
    }),
  )

  const classAvailMap = new Map<string, boolean>()
  classAvailability.forEach((row) => {
    classAvailMap.set(`${row.classId}::${row.timeSlotId}::${row.day}`, row.available)
  })

  const dictDisponibilidadesAulas: Record<string, Record<string, number>[]> = {}
  classes.forEach((klass) => {
    dictDisponibilidadesAulas[klass.name] = timeSlots.map((slot) => {
      const record: Record<string, string | number> = { momento: slot.label }
      DIAS.forEach((day) => {
        record[day] = classAvailMap.get(`${klass.id}::${slot.id}::${day}`) ? 1 : 0
      })
      return record as Record<string, number>
    })
  })

  return {
    A: teachers.length,
    B: classes.length,
    C: momentos ? Object.keys(momentos).length : 0,
    D: Object.keys(dias).length,
    turmas,
    professores,
    dias,
    momentos,
    materias,
    preferencias_materia: preferenciasMateria,
    preferencias_professor: preferenciasProfessor,
    aulas_minimas_semanais: aulasMinimasSemanais,
    aulas_maximas_diarias: aulasMaximasDiarias,
    professores_turmas_materias: professoresTurmasMaterias,
    df_disponibilidades: dfDisponibilidades,
    dict_disponibilidades_aulas: dictDisponibilidadesAulas,
  }
}
