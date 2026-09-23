import type {
  Assignment,
  Class,
  ClassAvailabilitySlot,
  Room,
  Rule,
  Schedule,
  ScheduleSolution,
  School,
  Subject,
  SystemModule,
  Teacher,
  TeacherAvailabilitySlot,
  TimeSlot,
  User,
} from '../types'

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

  async getSchool(schoolId: string) {
    return request<{ school: School }>(`/schools/${schoolId}`)
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

  async createSchedule(input: { schoolId: string; name: string; period?: string; academicYear?: string }) {
    return request<{ schedule: Schedule }>('/schedules', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async updateScheduleStatus(id: string, status: 'draft' | 'generated') {
    return request<{ schedule: Schedule }>(`/schedules/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  async generateSchedule(id: string) {
    return request<{
      status: 'success' | 'infeasible' | 'error'
      messages: { mensagens: string[]; dica: string }[]
      solutions: unknown[]
    }>(`/schedules/${id}/generate`, { method: 'POST' })
  },

  async getScheduleSolutions(id: string) {
    return request<{ solutions: ScheduleSolution[] }>(`/schedules/${id}/solutions`)
  },

  async listTeachers(schoolId: string) {
    return request<{ teachers: Teacher[] }>(`/teachers?schoolId=${schoolId}`)
  },

  async createTeacher(input: Omit<Teacher, 'id' | 'createdAt' | 'preference'> & { preference?: number }) {
    return request<{ teacher: Teacher }>('/teachers', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async updateTeacher(id: string, input: Omit<Teacher, 'id' | 'createdAt' | 'schoolId' | 'preference'> & { preference?: number }) {
    return request<{ teacher: Teacher }>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  async deleteTeacher(id: string) {
    await request<void>(`/teachers/${id}`, { method: 'DELETE' })
  },

  async getTeacherAvailability(teacherId: string) {
    return request<{ slots: TeacherAvailabilitySlot[] }>(`/teachers/${teacherId}/availability`)
  },

  async replaceTeacherAvailability(teacherId: string, slots: Omit<TeacherAvailabilitySlot, 'teacherId'>[]) {
    return request<{ slots: TeacherAvailabilitySlot[] }>(`/teachers/${teacherId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ slots }),
    })
  },

  async listClasses(schoolId: string) {
    return request<{ classes: Class[] }>(`/classes?schoolId=${schoolId}`)
  },

  async createClass(input: { schoolId: string; name: string; shift: string; studentsCount?: number }) {
    return request<{ class: Class }>('/classes', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async updateClass(id: string, input: { name: string; shift: string; studentsCount?: number }) {
    return request<{ class: Class }>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  async deleteClass(id: string) {
    await request<void>(`/classes/${id}`, { method: 'DELETE' })
  },

  async getClassAvailability(classId: string) {
    return request<{ slots: ClassAvailabilitySlot[] }>(`/classes/${classId}/availability`)
  },

  async replaceClassAvailability(classId: string, slots: Omit<ClassAvailabilitySlot, 'classId'>[]) {
    return request<{ slots: ClassAvailabilitySlot[] }>(`/classes/${classId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ slots }),
    })
  },

  async listSubjects(schoolId: string) {
    return request<{ subjects: Subject[] }>(`/subjects?schoolId=${schoolId}`)
  },

  async createSubject(input: { schoolId: string; name: string; weeklyHours: number; preference?: number }) {
    return request<{ subject: Subject }>('/subjects', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async updateSubject(id: string, input: { name: string; weeklyHours: number; preference?: number }) {
    return request<{ subject: Subject }>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  async deleteSubject(id: string) {
    await request<void>(`/subjects/${id}`, { method: 'DELETE' })
  },

  async listRooms(schoolId: string) {
    return request<{ rooms: Room[] }>(`/rooms?schoolId=${schoolId}`)
  },

  async createRoom(input: { schoolId: string; name: string; capacity?: number }) {
    return request<{ room: Room }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async updateRoom(id: string, input: { name: string; capacity?: number }) {
    return request<{ room: Room }>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  async deleteRoom(id: string) {
    await request<void>(`/rooms/${id}`, { method: 'DELETE' })
  },

  async listTimeSlots(schoolId: string) {
    return request<{ timeSlots: TimeSlot[] }>(`/time-slots?schoolId=${schoolId}`)
  },

  async createTimeSlot(input: { schoolId: string; label: string; startTime: string; endTime: string; order?: number }) {
    return request<{ timeSlot: TimeSlot }>('/time-slots', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async deleteTimeSlot(id: string) {
    await request<void>(`/time-slots/${id}`, { method: 'DELETE' })
  },

  async listRules(schoolId: string) {
    return request<{ rules: Rule[] }>(`/rules?schoolId=${schoolId}`)
  },

  async createRule(input: { schoolId: string; description: string; type: 'hard' | 'soft'; weight: number }) {
    return request<{ rule: Rule }>('/rules', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async deleteRule(id: string) {
    await request<void>(`/rules/${id}`, { method: 'DELETE' })
  },

  async listAssignments(schoolId: string) {
    return request<{ assignments: Assignment[] }>(`/assignments?schoolId=${schoolId}`)
  },

  async createAssignment(input: {
    schoolId: string
    classId: string
    subjectId: string
    teacherId: string
    weeklyMinClasses: number
    dailyMaxClasses: number
  }) {
    return request<{ assignment: Assignment }>('/assignments', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async updateAssignment(
    id: string,
    input: { classId: string; subjectId: string; teacherId: string; weeklyMinClasses: number; dailyMaxClasses: number },
  ) {
    return request<{ assignment: Assignment }>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  async deleteAssignment(id: string) {
    await request<void>(`/assignments/${id}`, { method: 'DELETE' })
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
