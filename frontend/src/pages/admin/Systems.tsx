import { useEffect, useState } from 'react'
import { Badge, Table, type TableColumn } from '../../components/ui'
import { api } from '../../lib/api'
import type { SystemModule } from '../../types'

export function Systems() {
  const [systems, setSystems] = useState<SystemModule[]>([])

  useEffect(() => {
    api.adminListSystems().then(({ systems }) => setSystems(systems))
  }, [])

  const columns: TableColumn<SystemModule>[] = [
    { key: 'name', header: 'Sistema' },
    { key: 'description', header: 'Descrição' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'active' ? 'success' : 'neutral'}>
          {row.status === 'active' ? 'Ativo' : 'Em breve'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brand-ink">Sistemas</h1>
      <Table columns={columns} data={systems} rowKey={(row) => row.id} />
    </div>
  )
}
