import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-dashed bg-brand-input px-6 py-12 text-center">
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-brand-ink-soft">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
