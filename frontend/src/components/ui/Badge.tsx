import type { ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'info'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-indigo-100 text-indigo-700',
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}
