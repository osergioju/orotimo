import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui'
import { api } from '../../lib/api'
import type { SchoolMember } from '../../types'

export function AdminSchoolMembers() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()
  const [owner, setOwner] = useState<{ id: string; name: string; email: string } | null>(null)
  const [members, setMembers] = useState<SchoolMember[]>([])
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!schoolId) return
    load()
  }, [schoolId])

  function load() {
    if (!schoolId) return
    api.adminListSchoolMembers(schoolId).then(({ owner, members }) => {
      setOwner(owner)
      setMembers(members)
    })
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    if (!schoolId) return
    setIsSubmitting(true)
    setError(null)

    try {
      await api.adminAddSchoolMember(schoolId, email)
      setEmail('')
      load()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível adicionar o membro.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemove(userId: string) {
    if (!schoolId) return
    setRemovingId(userId)
    try {
      await api.adminRemoveSchoolMember(schoolId, userId)
      setMembers((current) => current.filter((m) => m.userId !== userId))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <button type="button" onClick={() => navigate('/admin/escolas')} className="text-sm font-semibold text-brand-primary hover:underline">
            ← Escolas
          </button>
          <h1 className="mt-2 text-2xl font-semibold text-brand-ink">Membros da escola</h1>
        </div>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">Dono</p>
            <p className="mt-1 text-sm text-brand-ink">
              {owner ? `${owner.name} (${owner.email})` : '—'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">Membros ({members.length})</p>
            {members.length === 0 ? (
              <p className="mt-2 text-sm text-brand-ink-soft">Nenhum membro adicional ainda.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-xl border border-brand-divider px-3.5 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">{member.name}</p>
                      <p className="text-xs text-brand-ink-soft">{member.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(member.userId)}
                      disabled={removingId === member.userId}
                      className="text-sm font-semibold text-brand-error-ink hover:underline disabled:opacity-50"
                    >
                      {removingId === member.userId ? 'Removendo...' : 'Remover'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className="flex flex-col gap-2 border-t border-brand-divider pt-4 sm:flex-row sm:items-end" onSubmit={handleAdd}>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="member-email" className="text-sm font-semibold text-brand-ink">
                Adicionar membro por e-mail
              </label>
              <input
                id="member-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="pessoa@dominio.com"
                className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-brand-error-ink">{error}</p>}
          <p className="text-xs text-brand-ink-soft">
            O usuário precisa já existir (crie em Usuários) e passa a ver esta escola em "Minhas escolas".
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
