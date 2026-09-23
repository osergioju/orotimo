import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-brand-divider px-5 py-4">
          {title && <h2 className="font-display text-base font-semibold text-brand-ink">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-brand-ink-soft hover:bg-brand-muted hover:text-brand-ink"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
