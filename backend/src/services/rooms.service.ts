import { roomsRepository } from '../repositories/rooms.repository'
import type { Room } from '../models/room.model'

export const roomsService = {
  async listBySchool(schoolId: string): Promise<Room[]> {
    return roomsRepository.listBySchool(schoolId)
  },

  async getById(id: string): Promise<Room | null> {
    return roomsRepository.findById(id)
  },

  async create(input: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
    return roomsRepository.create(input)
  },

  async update(id: string, input: Omit<Room, 'id' | 'createdAt' | 'schoolId'>): Promise<Room> {
    return roomsRepository.update(id, input)
  },

  async delete(id: string): Promise<void> {
    return roomsRepository.delete(id)
  },
}
