import axios from 'axios'
import type { ActivityListResponse } from '@/app/types/activity'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const ActivityService = {

  async getAll(): Promise<ActivityListResponse> {
    const res = await api.get<ActivityListResponse>('/activities')
    return res.data
  },
}
