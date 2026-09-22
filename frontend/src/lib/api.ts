import type { School, Schedule, SystemModule, User } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('scale-engine:token')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.error ?? 'Erro ao comunicar com a API')
  }

  return body as T
}

export const api = {
  async login(email: string, password: string) {
    return request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async listSystems() {
    return request<{ systems: SystemModule[] }>('/systems')
  },

  async listSchools() {
    return request<{ schools: School[] }>('/schools')
  },

  async createSchool(input: { name: string; cnpj: string; description: string; unitsCount: number }) {
    return request<{ school: School }>('/schools', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async getSchoolDashboard(schoolId: string) {
    return request<{ school: School; overview: { turmas: number; professores: number; salas: number; disciplinas: number } }>(
      `/schools/${schoolId}/dashboard`,
    )
  },

  async listSchedules(schoolId: string) {
    return request<{ schedules: Schedule[] }>(`/schedules?schoolId=${schoolId}`)
  },

  async getSchedule(id: string) {
    return request<{ schedule: Schedule }>(`/schedules/${id}`)
  },

  async adminListUsers() {
    return request<{ users: User[] }>('/admin/users')
  },

  async adminListSystems() {
    return request<{ systems: SystemModule[] }>('/admin/systems')
  },

  async adminListSchools() {
    return request<{ schools: School[] }>('/admin/schools')
  },

  async adminGetUserPermissions(userId: string) {
    return request<{ userId: string; permissions: { systemId: string; systemName: string; enabled: boolean }[] }>(
      `/admin/users/${userId}/permissions`,
    )
  },

  async adminUpdateUserPermission(userId: string, systemId: string, enabled: boolean) {
    return request<{ userId: string; systemId: string; enabled: boolean }>(`/admin/users/${userId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ systemId, enabled }),
    })
  },
}
