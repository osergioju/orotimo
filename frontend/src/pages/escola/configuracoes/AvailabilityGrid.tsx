import { useMemo } from 'react'
import type { TimeSlot } from '../../../types'

export const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
export const SHORT_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

export function emptyGrid(timeSlots: TimeSlot[]): boolean[][] {
  return timeSlots.map(() => DAYS.map(() => false))
}

interface EntityOption {
  id: string
  label: string
  subtitle: string
  initials: string
}

interface AvailabilityGridProps {
  breadcrumb: string
  title: string
  selectorLabel: string
  entities: EntityOption[]
  entityId: string
  onEntityChange: (id: string) => void
  timeSlots: TimeSlot[]
  grid: boolean[][]
  onToggleCell: (row: number, col: number) => void
  onSelectAll: () => void
  onClearAll: () => void
  onSave: () => void
  isSaving: boolean
  isLoadingGrid: boolean
  savedAt: number | null
}

export function AvailabilityGrid({
  breadcrumb,
  title,
  selectorLabel,
  entities,
  entityId,
  onEntityChange,
  timeSlots,
  grid,
  onToggleCell,
  onSelectAll,
  onClearAll,
  onSave,
  isSaving,
  isLoadingGrid,
  savedAt,
}: AvailabilityGridProps) {
  const entity = entities.find((item) => item.id === entityId)
  const total = timeSlots.length * DAYS.length

  const stats = useMemo(() => {
    let count = 0
    grid.forEach((row) => row.forEach((v) => v && count++))

    const perDayCounts = DAYS.map((_, col) => grid.reduce((n, row) => n + (row[col] ? 1 : 0), 0))
    const max = Math.max(...perDayCounts, 0)
    const bestIndex = perDayCounts.indexOf(max)

    return {
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      perDayCounts,
      max,
      bestDay:
        max > 0
          ? `Mais livre na ${DAYS[bestIndex].toLowerCase()}, com ${max} ${max === 1 ? 'aula.' : 'aulas.'}`
          : 'Nenhum horário marcado ainda.',
    }
  }, [grid, total])

  if (timeSlots.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <h1 className="font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-brand-ink">{title}</h1>
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">
            Cadastre ao menos um horário em Configurações → Horários para montar a grade.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* Título + seleção */}
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2.5 text-[14.5px] text-brand-ink-soft">
            <span>Configurações</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
            <span className="font-semibold text-brand-ink">{breadcrumb}</span>
          </div>
          <h1 className="mt-4 font-display text-[38px] font-semibold leading-[1.1] tracking-tight text-brand-ink">{title}</h1>
        </div>

        {entity && (
          <label
            htmlFor="entity"
            className="group flex w-full cursor-pointer items-center gap-4 rounded-3xl border-[1.5px] border-brand-border bg-white p-4 transition-colors hover:border-brand-primary hover:bg-brand-muted lg:w-[440px]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-brand-orange font-display text-[17px] font-semibold text-brand-ink">
              {entity.initials}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-primary">
                {selectorLabel} · trocar
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
              <div className="relative">
                <select
                  id="entity"
                  value={entityId}
                  onChange={(event) => onEntityChange(event.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg border-none bg-transparent py-0.5 pr-6 font-sans text-lg font-bold text-brand-ink outline-none"
                >
                  {entities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="truncate text-[13.5px] text-brand-ink-soft">{entity.subtitle}</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden="true">
              <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
            </svg>
          </label>
        )}
      </div>

      {/* Grade + indicadores */}
      <div className="flex flex-1 flex-col gap-5 xl:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-[22px] rounded-[28px] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="m-0 font-display text-[19px] font-semibold text-brand-ink">Grade semanal</h2>
              <p className="mt-1.5 text-sm text-brand-ink-soft">Toque nos horários disponíveis.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="h-11 rounded-full border border-brand-border bg-white px-[18px] text-sm font-semibold text-brand-ink hover:bg-brand-muted"
              >
                Selecionar todos
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className="h-11 rounded-full border border-brand-border bg-white px-[18px] text-sm font-semibold text-brand-ink hover:bg-brand-muted"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving || isLoadingGrid}
                className="h-11 rounded-full bg-brand-primary px-[18px] text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : savedAt ? 'Salvo ✓' : 'Salvar disponibilidade'}
              </button>
            </div>
          </div>

          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <div className="flex flex-col gap-2.5" style={{ minWidth: '620px' }}>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: '132px repeat(5, minmax(0, 1fr))' }}>
                <div />
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-[13px] font-bold uppercase tracking-[0.06em] text-brand-ink-soft">
                    {day}
                  </div>
                ))}
              </div>

              {timeSlots.map((slot, row) => (
                <div key={slot.id} className="grid gap-2.5" style={{ gridTemplateColumns: '132px repeat(5, minmax(0, 1fr))' }}>
                  <div className="flex flex-col justify-center gap-0.5">
                    <span className="text-[15px] font-bold text-brand-ink">{slot.label}</span>
                    <span className="text-[13px] text-brand-ink-soft">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                  {DAYS.map((day, col) => {
                    const on = grid[row]?.[col] ?? false
                    return (
                      <label key={day} className="relative block h-[88px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => onToggleCell(row, col)}
                          aria-label={`${slot.label}, ${day}`}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <span
                          className={`flex h-full w-full items-center justify-center rounded-2xl border-[1.5px] transition-colors ${
                            on ? 'border-brand-primary bg-brand-primary' : 'border-dashed border-brand-dashed bg-brand-input'
                          }`}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={on ? 'opacity-100' : 'opacity-0'}
                          >
                            <path d="m5 12.5 4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                      </label>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-[22px] text-[13.5px] text-brand-ink-soft">
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded-[5px] bg-brand-primary" />
              Disponível
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded-[5px] border-[1.5px] border-dashed border-brand-dashed bg-brand-input" />
              Indisponível
            </span>
          </div>
        </section>

        <div className="flex flex-col gap-5 sm:flex-row xl:w-[300px] xl:shrink-0 xl:flex-col">
          <div className="flex flex-1 flex-col justify-between rounded-[28px] bg-white p-6">
            <span className="text-sm font-semibold text-brand-ink-soft">Horários disponíveis</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[52px] font-semibold tracking-tight text-brand-ink">{stats.count}</span>
              <span className="font-display text-xl font-medium text-brand-ink-soft">/ {total}</span>
            </div>
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={`h-[30px] rounded-[4px] ${i < stats.count ? 'bg-brand-primary' : 'bg-brand-canvas'}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-[1.3] flex-col gap-4 rounded-[28px] bg-white p-6">
            <span className="text-sm font-semibold text-brand-ink-soft">Aulas livres por dia</span>
            <div className="grid flex-1 grid-cols-5 gap-2.5">
              {SHORT_DAYS.map((short, i) => {
                const n = stats.perDayCounts[i]
                const isMax = n === stats.max && n > 0
                return (
                  <div key={short} className="flex flex-col items-center gap-2">
                    <span className="font-display text-sm font-semibold text-brand-ink">{n}</span>
                    <div className="flex w-full flex-1 items-end overflow-hidden rounded-xl bg-brand-muted">
                      <div
                        className={`w-full rounded-xl ${isMax ? 'bg-brand-orange' : 'bg-brand-primary'}`}
                        style={{ height: `${Math.max((n / Math.max(timeSlots.length, 1)) * 100, 6)}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-semibold text-brand-ink-soft">{short}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between rounded-[28px] bg-brand-ink p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-lavender">Cobertura da semana</span>
              <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
            </div>
            <span className="font-display text-[52px] font-semibold tracking-tight text-brand-orange">{stats.pct}%</span>
            <span className="text-sm leading-snug text-brand-lavender">{stats.bestDay}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
