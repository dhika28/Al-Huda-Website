export type AmbulanceStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'

export type AmbulanceRequestType = 'urgent' | 'scheduled'

export interface AmbulanceRequestPayload {
  request_type: AmbulanceRequestType

  scheduled_date?: string // YYYY-MM-DD

  urgency?: string

  patient_name: string
  patient_age?: number
  patient_gender?: 'male' | 'female'
  patient_phone: string

  medical_condition?: string

  pickup_address: string
  destination: string
  landmark?: string
  contact_person?: string
  notes?: string
}

export interface AmbulanceHistoryItem extends AmbulanceRequestPayload {
  id: number
  status: AmbulanceStatus
  created_at: string
}

export interface AmbulanceHistoryResponse {
  data: AmbulanceHistoryItem[]
}

export interface CreateAmbulanceResponse {
  message: string
  id: number
  status: AmbulanceStatus
}
