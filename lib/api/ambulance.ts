import axios from "axios"
import { ReactNode } from "react"

// --- TYPES & INTERFACES ---

// 1. Tipe Data untuk Request Peminjaman (Booking)
export interface AmbulanceRequest {
  [x: string]: ReactNode
  id: number
  user_id?: number
  request_type: "urgent" | "scheduled"
  urgency?: string
  scheduled_date?: string // YYYY-MM-DD
  
  // Patient Info
  patient_name: string
  patient_age: number
  patient_gender: string
  patient_phone: string
  
  // Medical
  medical_condition: string 
  
  // Location
  pickup_address: string
  destination: string
  landmark?: string
  contact_person: string
  
  // Meta
  notes?: string
  status: string // pending | active | completed | cancelled | dispatched
  created_at: string
  
  // Admin Only (Virtual Fields from Backend Join)
  assigned_driver?: string
  assigned_unit?: string
}

// 2. Tipe Data untuk Payload Create Request (Input Form)
export interface AmbulanceRequestPayload {
  request_type: "urgent" | "scheduled"
  scheduled_date?: string
  patient_name: string
  patient_age: number
  patient_gender: string
  patient_phone: string
  medical_condition: string
  pickup_address: string
  destination: string
  landmark?: string
  contact_person: string
  notes?: string
}

// 3. Tipe Data untuk Armada (Fleet)
export interface AmbulanceUnit {
  id: number
  name: string
  plate_number: string
  status: "available" | "maintenance" | "busy"
  facilities: string
  created_at?: string
}

// 4. Tipe Data untuk Driver (BARU)
export interface AmbulanceDriver {
  id: number
  name: string
  phone: string
  status: "available" | "busy" | "off"
  created_at?: string
}

// --- RESPONSE WRAPPERS ---

export interface AmbulanceResponse {
  filter(arg0: (a: any) => boolean): unknown
  data: AmbulanceRequest[]
}

export interface AmbulanceFleetResponse {
  data: AmbulanceUnit[]
}

export interface AmbulanceDriverResponse {
  data: AmbulanceDriver[]
}

export interface CreateResponse {
  message: string
  id: number
  status: string
}

// --- AXIOS INSTANCE ---

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

// --- SERVICE METHODS ---

export const AmbulanceService = {
  // ==========================
  // BOOKING / REQUESTS
  // ==========================

  // Admin: Get All Requests
  getAll: () => {
    return api.get<AmbulanceResponse>("/ambulance")
  },

  // User/Admin: Create Request
  create: (payload: AmbulanceRequestPayload) => {
    return api.post<CreateResponse>("/ambulance", payload)
  },

  // User: Get History
  history: () => {
    return api.get<AmbulanceResponse>("/ambulance/history")
  },

  // Admin: Update Status & Assign Driver
  updateStatus: (id: number, status: string, driver?: string, unit?: string) => {
    return api.put(`/ambulance/status?id=${id}`, {
      status,
      assigned_driver: driver || "",
      assigned_unit: unit || "",
    })
  },

  // ==========================
  // FLEET MANAGEMENT (ARMADA)
  // ==========================

  getFleet: () => {
    return api.get<AmbulanceFleetResponse>("/ambulance/units")
  },

  addUnit: (payload: Omit<AmbulanceUnit, "id" | "created_at">) => {
    return api.post("/ambulance/units", payload)
  },

  updateUnit: (id: number, payload: Omit<AmbulanceUnit, "id" | "created_at">) => {
    return api.put(`/ambulance/units?id=${id}`, payload)
  },

  deleteUnit: (id: number) => {
    return api.delete(`/ambulance/units?id=${id}`)
  },

  // ==========================
  // DRIVER MANAGEMENT (BARU)
  // ==========================

  getDrivers: () => {
    return api.get<AmbulanceDriverResponse>("/ambulance/drivers")
  },

  addDriver: (payload: Omit<AmbulanceDriver, "id" | "created_at">) => {
    return api.post("/ambulance/drivers", payload)
  },

  deleteDriver: (id: number) => {
    return api.delete(`/ambulance/drivers?id=${id}`)
  }
}