import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { useAuth } from '../../contexts/AuthContext'

const TILES = [
  { className: 'row-span-2 bg-brand-primary flex flex-col justify-between p-[18px]', number: '01', numberColor: 'text-white', label: 'Múltiplas soluções comparáveis', labelColor: 'text-white', labelWeight: 'font-semibold' },
  { className: 'col-span-2 bg-brand-orange flex flex-col justify-between p-[18px]', number: '02', numberColor: 'text-brand-ink', label: 'Regras obrigatórias e preferências', labelColor: 'text-brand-ink', labelWeight: 'font-bold' },
  { className: 'bg-brand-slate' },
  { className: 'bg-brand-link' },
  { className: 'bg-brand-cyan flex flex-col justify-between p-[18px]', number: '03', numberColor: 'text-brand-ink', label: 'Explicabilidade', labelColor: 'text-brand-ink', labelWeight: 'font-bold' },
  { className: 'bg-brand-lilac' },
]

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('junior@crtcomunicacao.com.br')
  const [password, setPassword] = useState('escala123')
  const [showPassword, setShowPassword] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/escalas')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen gap-5 bg-brand-canvas p-5">
      {/* Painel de marca */}
      <section className="hidden w-[780px] shrink-0 flex-col justify-between overflow-hidden rounded-[32px] bg-brand-ink p-11 lg:flex">
        <div className="flex items-center justify-between">
          <Logo variant="light" />
        </div>

        <div className="flex max-w-[640px] flex-col gap-5">
          <h1 className="m-0 font-display text-[50px] font-semibold leading-[1.08] tracking-tight text-white">
            Uma escala não é só preencher horários.
          </h1>
          <p className="m-0 max-w-[520px] text-[17px] leading-[1.55] text-brand-lavender">
            É explorar o espaço de soluções, comparar alternativas e entender por que cada escolha foi feita.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2" style={{ gridTemplateRows: 'repeat(2, 124px)' }}>
          {TILES.map((tile, index) => (
            <div key={index} className={`rounded-[14px] box-border ${tile.className}`}>
              {tile.number && (
                <>
                  <span className={`font-display text-[13px] font-semibold ${tile.numberColor}`}>{tile.number}</span>
                  <span className={`text-[15px] leading-[1.3] ${tile.labelWeight} ${tile.labelColor}`}>{tile.label}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Formulário */}
      <main className="flex flex-1 flex-col justify-between rounded-[32px] bg-white p-11">
        <div className="flex justify-end text-sm text-brand-ink-soft">
          <span>
            Sem acesso?{' '}
            <a href="#" className="font-semibold no-underline">
              Fale com o administrador
            </a>
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-col self-center">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Acesso</span>
          </div>
          <h2 className="mt-3.5 font-display text-[34px] font-semibold leading-[1.12] tracking-tight text-brand-ink">
            Bem-vindo de volta
          </h2>
          <p className="mt-2.5 text-base text-brand-ink-soft">Entre para acessar seus sistemas.</p>

          <form className="mt-9 flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-brand-ink">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@escola.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-[54px] rounded-2xl border border-brand-border bg-brand-input px-[18px] text-[15px] font-medium text-brand-ink outline-none transition-colors placeholder:text-brand-placeholder hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="senha" className="text-sm font-semibold text-brand-ink">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-[54px] w-full rounded-2xl border border-brand-border bg-brand-input py-0 pl-[18px] pr-14 text-[15px] font-medium text-brand-ink outline-none transition-colors placeholder:text-brand-placeholder hover:border-brand-lilac focus:border-brand-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(31,41,156,0.14)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-[5px] top-[5px] flex h-11 w-11 items-center justify-center rounded-xl border-none bg-transparent text-brand-ink-soft hover:bg-brand-canvas"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              <span className="text-xs text-brand-ink-soft">Senha de demonstração: escala123</span>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-brand-ink">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(event) => setKeepSignedIn(event.target.checked)}
                  className="h-[18px] w-[18px] accent-brand-primary"
                />
                Manter conectado
              </label>
              <a href="#" className="text-sm font-semibold no-underline">
                Esqueceu a senha?
              </a>
            </div>

            {error && <p className="text-sm text-brand-error-ink">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-[58px] items-center justify-between rounded-full bg-brand-primary py-0 pl-6 pr-2 text-base font-semibold text-white no-underline transition-colors hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16215B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </button>
          </form>
        </div>

        <div className="flex justify-between text-[13px] text-brand-ink-soft">
          <span>© 2026 Orotchimo</span>
          <span>Privacidade · Termos</span>
        </div>
      </main>
    </div>
  )
}

sudo - u postgres psql - c "CREATE USER orotimo WITH PASSWORD
/// 'WNBI32YHJWIBEG82YU12123WASJDBVU2YI@#@#KNBQWEU8C9UEIJ2KES';"