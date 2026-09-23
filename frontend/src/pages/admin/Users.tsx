import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, type TableColumn } from '../../components/ui'
import { api } from '../../lib/api'
import type { User } from '../../types'

export function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    api.adminListUsers().then(({ users }) => setUsers(users))
  }, [])

  const columns: TableColumn<User>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-brand-ink">Usuários</h1>
      <Table columns={columns} data={users} rowKey={(row) => row.id} onRowClick={(row) => navigate(`/admin/permissoes/${row.id}`)} />
    </div>
  )
}
