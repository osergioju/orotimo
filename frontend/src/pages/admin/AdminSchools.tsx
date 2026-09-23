import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, type TableColumn } from '../../components/ui'
import { api } from '../../lib/api'
import type { School } from '../../types'

export function AdminSchools() {
  const navigate = useNavigate()
  const [schools, setSchools] = useState<School[]>([])

  useEffect(() => {
    api.adminListSchools().then(({ schools }) => setSchools(schools))
  }, [])

  const columns: TableColumn<School>[] = [
    { key: 'name', header: 'Escola' },
    { key: 'owner', header: 'Dono', render: (row) => row.owner?.name ?? '—' },
    { key: 'members', header: 'Membros', align: 'right', render: (row) => String(row._count?.members ?? 0) },
    { key: 'cnpj', header: 'CNPJ' },
    { key: 'unitsCount', header: 'Unidades', align: 'right' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brand-ink">Escolas</h1>
      <Table columns={columns} data={schools} rowKey={(row) => row.id} onRowClick={(row) => navigate(`/admin/escolas/${row.id}`)} />
    </div>
  )
}
