import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-primary text-white font-semibold hover:bg-brand-ink focus-visible:outline-brand-primary',
  secondary: 'bg-white text-brand-ink border border-brand-border hover:bg-brand-muted focus-visible:outline-brand-primary',
  ghost: 'bg-transparent text-brand-ink-soft hover:bg-brand-muted focus-visible:outline-brand-primary',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
