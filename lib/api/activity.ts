import axios from 'axios'
import type { Activity, ActivityListResponse } from '@/app/types/activity'

export interface ActivityPayload extends Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'fasilitas'> {
  fasilitas?: string 
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const ActivityService = {

  // GET ALL
  async getAll(): Promise<ActivityListResponse> {
    const res = await api.get<ActivityListResponse>('/activities')
    return res.data
  },

  // CREATE
  async create(data: ActivityPayload) {
    const res = await api.post('/activities', data)
    return res.data
  },

  // UPDATE
  async update(id: number, data: ActivityPayload) {
    const res = await api.put(`/activities/${id}`, data)
    return res.data
  },

  // DELETE
  async delete(id: number) {
    const res = await api.delete(`/activities/${id}`)
    return res.data
  }
}