import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = '', ...props },
  ref,
) {
  const inputId = id ?? props.name

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-brand-ink">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={`rounded-2xl border bg-brand-input px-4 py-2.5 text-sm text-brand-ink placeholder:text-brand-placeholder focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-primary/15 ${
          error ? 'border-brand-error' : 'border-brand-border'
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-brand-ink-soft">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
})
