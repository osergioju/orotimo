import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../../components/ui'
import { useSchool } from '../../../contexts/SchoolContext'
import { api } from '../../../lib/api'
import type { Room } from '../../../types'

export function Rooms() {
  const { currentSchool } = useSchool()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentSchool) return
    api
      .listRooms(currentSchool.id)
      .then(({ rooms }) => setRooms(rooms))
      .finally(() => setIsLoading(false))
  }, [currentSchool])

  if (!currentSchool) return null

  function openCreateModal() {
    setEditingId(null)
    setName('')
    setCapacity('')
    setIsModalOpen(true)
  }

  function openEditModal(room: Room) {
    setEditingId(room.id)
    setName(room.name)
    setCapacity(room.capacity ? String(room.capacity) : '')
    setIsModalOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!currentSchool) return
    setIsSubmitting(true)

    try {
      const payload = { name, capacity: capacity ? Number(capacity) : undefined }

      if (editingId) {
        const { room: updated } = await api.updateRoom(editingId, payload)
        setRooms((current) => current.map((item) => (item.id === editingId ? updated : item)))
      } else {
        const { room: created } = await api.createRoom({ schoolId: currentSchool.id, ...payload })
        setRooms((current) => [...current, created])
      }

      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta sala?')) return
    setDeletingId(id)
    try {
      await api.deleteRoom(id)
      setRooms((current) => current.filter((item) => item.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-ink-soft">Cadastros</span>
          </div>
          <h1 className="mt-3.5 font-display text-[32px] font-semibold tracking-tight text-brand-ink">Salas</h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="h-11 shrink-0 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-ink"
        >
          + Nova sala
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-brand-ink-soft">Carregando salas...</p>
      ) : rooms.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border-[1.5px] border-dashed border-brand-dashed bg-white p-10 text-center">
          <p className="text-sm text-brand-ink-soft">Nenhuma sala cadastrada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="flex flex-col gap-3 rounded-[24px] bg-white p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-canvas text-brand-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-4h4v4" />
                  </svg>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(room)}
                    aria-label="Editar sala"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink-soft hover:bg-brand-canvas hover:text-brand-primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(room.id)}
                    disabled={deletingId === room.id}
                    aria-label="Remover sala"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink-soft hover:bg-red-50 hover:text-brand-error disabled:opacity-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-brand-ink">{room.name}</p>
                <p className="mt-1 text-sm text-brand-ink-soft">{room.capacity ? `${room.capacity} lugares` : 'Capacidade não informada'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar sala' : 'Nova sala'}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sala-nome" className="text-sm font-semibold text-brand-ink">
              Nome da sala
            </label>
            <input
              id="sala-nome"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Sala 101"
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sala-capacidade" className="text-sm font-semibold text-brand-ink">
              Capacidade
            </label>
            <input
              id="sala-capacidade"
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className="h-11 rounded-xl border border-brand-border bg-brand-input px-3.5 text-sm text-brand-ink outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 rounded-full bg-brand-primary text-sm font-semibold text-white hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar sala'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
