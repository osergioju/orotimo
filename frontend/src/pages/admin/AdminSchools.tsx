import { useEffect, useState } from 'react'
import { Table, type TableColumn } from '../../components/ui'
import { api } from '../../lib/api'
import type { School } from '../../types'

export function AdminSchools() {
  const [schools, setSchools] = useState<School[]>([])

  useEffect(() => {
    api.adminListSchools().then(({ schools }) => setSchools(schools))
  }, [])

  const columns: TableColumn<School>[] = [
    { key: 'name', header: 'Escola' },
    { key: 'cnpj', header: 'CNPJ' },
    { key: 'unitsCount', header: 'Unidades', align: 'right' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brand-ink">Escolas</h1>
      <Table columns={columns} data={schools} rowKey={(row) => row.id} />
    </div>
  )
}
