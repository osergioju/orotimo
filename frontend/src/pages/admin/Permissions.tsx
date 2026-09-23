import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody, Table, type TableColumn } from '../../components/ui'
import { api } from '../../lib/api'
import type { User } from '../../types'

interface Permission {
  systemId: string
  systemName: string
  enabled: boolean
}

export function Permissions() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])

  useEffect(() => {
    api.adminListUsers().then(({ users }) => setUsers(users))
  }, [])

  useEffect(() => {
    if (!userId) return
    api.adminGetUserPermissions(userId).then(({ permissions }) => setPermissions(permissions))
  }, [userId])

  async function togglePermission(permission: Permission) {
    if (!userId) return
    const enabled = !permission.enabled
    await api.adminUpdateUserPermission(userId, permission.systemId, enabled)
    setPermissions((current) =>
      current.map((item) => (item.systemId === permission.systemId ? { ...item, enabled } : item)),
    )
  }

  if (!userId) {
    const columns: TableColumn<User>[] = [
      { key: 'name', header: 'Nome' },
      { key: 'email', header: 'E-mail' },
    ]

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-ink">Permissões</h1>
          <p className="mt-1 text-sm text-brand-ink-soft">Selecione um usuário para configurar os sistemas habilitados</p>
        </div>
        <Table columns={columns} data={users} rowKey={(row) => row.id} onRowClick={(row) => navigate(`/admin/permissoes/${row.id}`)} />
      </div>
    )
  }

  const user = users.find((item) => item.id === userId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-ink">Permissões</h1>
        <p className="mt-1 text-sm text-brand-ink-soft">Usuário: {user?.name ?? userId}</p>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3">
          {permissions.map((permission) => (
            <label key={permission.systemId} className="flex items-center gap-3 text-sm text-brand-ink">
              <input
                type="checkbox"
                checked={permission.enabled}
                onChange={() => togglePermission(permission)}
                className="h-4 w-4 rounded border-brand-border accent-brand-primary focus:ring-brand-primary/40"
              />
              {permission.systemName}
            </label>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
