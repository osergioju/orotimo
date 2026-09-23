import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Modal, Table, type TableColumn } from '../../components/ui'
import { api } from '../../lib/api'
import type { User, UserRole } from '../../types'

export function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  function loadUsers() {
    setIsLoading(true)
    api.adminListUsers().then(({ users }) => setUsers(users)).finally(() => setIsLoading(false))
  }

  function openCreateModal() {
    setName('')
    setEmail('')
    setPassword('')
    setRole('user')
    setError(null)
    setIsModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await api.adminCreateUser({ name, email, password, role })
      setIsModalOpen(false)
      loadUsers()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível criar o usuário.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: TableColumn<User>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    {
      key: 'role',
      header: 'Papel',
      render: (row) => <Badge tone={row.role === 'admin' ? 'info' : 'neutral'}>{row.role === 'admin' ? 'Admin' : 'Usuário'}</Badge>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-ink">Usuários</h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="h-11 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink"
        >
          + Novo usuário
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-ink-soft">Carregando usuários...</p>
      ) : (
        <Table columns={columns} data={users} rowKey={(row) => row.id} onRowClick={(row) => navigate(`/admin/permissoes/${row.id}`)} />
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo usuário">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-brand-error-ink">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-nome" className="text-sm font-semibold text-brand-ink">
              Nome
            </label>
            <input
              id="user-nome"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-email" className="text-sm font-semibold text-brand-ink">
              E-mail
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-senha" className="text-sm font-semibold text-brand-ink">
              Senha
            </label>
            <input
              id="user-senha"
              type="text"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-brand-ink">Papel</span>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-brand-muted p-[5px]">
              {(['user', 'admin'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`h-10 rounded-full text-sm font-semibold transition-colors ${
                    role === option ? 'bg-brand-ink text-white' : 'text-brand-ink-soft'
                  }`}
                >
                  {option === 'admin' ? 'Admin' : 'Usuário'}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 rounded-full bg-brand-primary text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
