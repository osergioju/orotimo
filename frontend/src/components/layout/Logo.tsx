interface LogoProps {
  variant?: 'dark' | 'light'
  size?: number
  wordmarkClassName?: string
  showWordmark?: boolean
}

export function Logo({ variant = 'dark', size = 30, wordmarkClassName = '', showWordmark = true }: LogoProps) {
  const ringColor = variant === 'dark' ? '#1F299C' : '#FFFFFF'

  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="15" cy="17" r="11" fill="none" stroke={ringColor} strokeWidth="5.5" />
        <circle cx="25" cy="7" r="4.5" fill="#F25929" />
      </svg>
      {showWordmark && (
        <span
          className={`font-display text-xl font-bold tracking-tight ${
            variant === 'dark' ? 'text-brand-ink' : 'text-white'
          } ${wordmarkClassName}`}
        >
          Orotchimo
        </span>
      )}
    </div>
  )
}
