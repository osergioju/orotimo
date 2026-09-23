import { useEffect, useState } from 'react'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { Class, TimeSlot } from '../../../types'
import { AvailabilityGrid, DAYS, emptyGrid } from './AvailabilityGrid'

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function DisponibilidadeTurmas() {
  const { currentSchool } = useSchool()
  const [classes, setClasses] = useState<Class[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [classId, setClassId] = useState('')
  const [grid, setGrid] = useState<boolean[][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingGrid, setIsLoadingGrid] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    Promise.all([api.listClasses(currentSchool.id), api.listTimeSlots(currentSchool.id)])
      .then(([{ classes }, { timeSlots }]) => {
        setClasses(classes)
        setTimeSlots(timeSlots)
        if (classes.length > 0) setClassId(classes[0].id)
      })
      .finally(() => setIsLoading(false))
  }, [currentSchool])

  useEffect(() => {
    if (!classId || timeSlots.length === 0) return
    setIsLoadingGrid(true)
    api
      .getClassAvailability(classId)
      .then(({ slots }) => {
        const next = emptyGrid(timeSlots)
        slots.forEach((slot) => {
          const row = timeSlots.findIndex((t) => t.id === slot.timeSlotId)
          const col = DAYS.indexOf(slot.day)
          if (row >= 0 && col >= 0) next[row][col] = slot.available
        })
        setGrid(next)
      })
      .finally(() => setIsLoadingGrid(false))
  }, [classId, timeSlots])

  if (!currentSchool) return null

  if (!isLoading && classes.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <h1 className="font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-brand-ink">
          Disponibilidade de turmas
        </h1>
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">
            Cadastre uma turma em Cadastros → Turmas para configurar a disponibilidade.
          </p>
        </div>
      </div>
    )
  }

  function toggleCell(row: number, col: number) {
    setGrid((current) => current.map((r, ri) => r.map((v, ci) => (ri === row && ci === col ? !v : v))))
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const slots = grid.flatMap((row, rowIndex) =>
        row.map((available, colIndex) => ({
          day: DAYS[colIndex],
          timeSlotId: timeSlots[rowIndex].id,
          available,
        })),
      )
      await api.replaceClassAvailability(classId, slots)
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt(null), 2500)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AvailabilityGrid
      breadcrumb="Disponibilidade"
      selectorLabel="Turma"
      title="Disponibilidade de turmas"
      entities={classes.map((klass) => ({
        id: klass.id,
        label: klass.name,
        subtitle: `${klass.shift}${klass.studentsCount ? ` · ${klass.studentsCount} alunos` : ''}`,
        initials: getInitials(klass.name),
      }))}
      entityId={classId}
      onEntityChange={setClassId}
      timeSlots={timeSlots}
      grid={grid}
      onToggleCell={toggleCell}
      onSelectAll={() => setGrid((current) => current.map((row) => row.map(() => true)))}
      onClearAll={() => setGrid((current) => current.map((row) => row.map(() => false)))}
      onSave={handleSave}
      isSaving={isSaving}
      isLoadingGrid={isLoadingGrid}
      savedAt={savedAt}
    />
  )
}
