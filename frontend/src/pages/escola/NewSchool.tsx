import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, Input } from '../../components/ui'
import { Header } from '../../components/layout/Header'
import { useSchool } from '../../contexts/SchoolContext'
import { api } from '../../lib/api'

export function NewSchool() {
  const navigate = useNavigate()
  const { setCurrentSchool } = useSchool()
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [description, setDescription] = useState('')
  const [unitsCount, setUnitsCount] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const { school } = await api.createSchool({
        name,
        cnpj,
        description,
        unitsCount: Number(unitsCount) || 1,
      })
      setCurrentSchool(school)
      setSuccess(true)
      setTimeout(() => navigate(`/escalas/escola/${school.id}`), 900)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-sm text-center">
          <CardBody>
            <div className="text-3xl">✅</div>
            <p className="mt-3 text-base font-semibold text-slate-900">Escola criada com sucesso</p>
            <p className="mt-1 text-sm text-slate-500">Redirecionando para o dashboard...</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Nova escola" />
      <main className="mx-auto max-w-lg px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Nova escola</h1>
        <p className="mt-1 text-slate-500">Preencha os dados iniciais da escola</p>

        <Card className="mt-6">
          <CardBody>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                label="Nome da escola"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <Input label="CNPJ" name="cnpj" value={cnpj} onChange={(event) => setCnpj(event.target.value)} />
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">Descrição</span>
                <textarea
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <Input
                label="Quantidade de unidades"
                name="unitsCount"
                type="number"
                min={1}
                value={unitsCount}
                onChange={(event) => setUnitsCount(event.target.value)}
              />
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">Foto/logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
              </label>

              <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
                {isSubmitting ? 'Salvando...' : 'Salvar escola'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
