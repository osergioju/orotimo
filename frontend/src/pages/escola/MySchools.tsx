import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, EmptyState } from '../../components/ui'
import { Header } from '../../components/layout/Header'
import { useSchool } from '../../contexts/SchoolContext'
import { api } from '../../lib/api'
import type { School } from '../../types'

export function MySchools() {
  const navigate = useNavigate()
  const { setCurrentSchool } = useSchool()
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .listSchools()
      .then(({ schools }) => setSchools(schools))
      .finally(() => setIsLoading(false))
  }, [])

  function handleSelect(school: School) {
    setCurrentSchool(school)
    navigate(`/escalas/escola/${school.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Minhas escolas" />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Minhas escolas</h1>
          <Button onClick={() => navigate('/escalas/escola/novo')}>+ Nova escola</Button>
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-slate-400">Carregando escolas...</p>
        ) : schools.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon="🏫"
              title="Nenhuma escola cadastrada"
              description="Cadastre sua primeira escola para começar a criar escalas."
              action={<Button onClick={() => navigate('/escalas/escola/novo')}>+ Nova escola</Button>}
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {schools.map((school) => (
              <Card key={school.id} className="cursor-pointer hover:shadow-md" onClick={() => handleSelect(school)}>
                <CardBody>
                  <h2 className="text-base font-semibold text-slate-900">{school.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{school.description}</p>
                  <p className="mt-3 text-xs text-slate-400">{school.unitsCount} unidade(s)</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
