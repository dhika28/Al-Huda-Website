import axios from "axios"
import type {
  AmbulanceRequestPayload,
  AmbulanceHistoryResponse,
  CreateAmbulanceResponse,
} from "@/app/types/ambulance"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const AmbulanceService = {

  create(payload: AmbulanceRequestPayload) {
    return api.post<CreateAmbulanceResponse>("/ambulance", payload)
  },

  history() {
    return api.get<AmbulanceHistoryResponse>("/ambulance/history")
  },
}
