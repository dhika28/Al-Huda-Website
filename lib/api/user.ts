import axios from "axios"

// ==========================================
// TIPE DATA (Sesuai JSON Response Backend)
// ==========================================

export interface User {
  gambar: string | undefined
  id: number
  name: string        // Backend mengirim key "name"
  full_name?: string  // Optional, mapping manual jika perlu
  email: string
  phone: string
  role: "admin" | "user"
  status: "active" | "inactive" 
  address?: string
  
  // --- KOLOM BARU (Untuk Klasifikasi) ---
  life_status?: "alive" | "deceased"
  classification?: "umum" | "fakir" | "miskin" | "yatim" | "piatu" | "yatim piatu" | "janda" | "mualaf" | "lansia"
  // --------------------------------------

  avatar?: string
  created_at?: string
}

// Payload untuk Create/Update
// Kita buat optional (?) agar mendukung Partial Update
export interface UserPayload {
  name?: string       // Backend mengharapkan "name"
  email?: string
  phone?: string
  password?: string   // Optional (hanya wajib saat create / ganti pass)
  role?: "admin" | "user"
  status?: "active" | "inactive"
  address?: string

  // --- KOLOM BARU ---
  life_status?: "alive" | "deceased"
  classification?: string
  
  // --- TAMBAHAN AGAR UPDATE AVATAR TIDAK ERROR TS ---
  avatar?: string 
  // -----------------------------------
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  full_name: string 
  email: string
  phone: string
  password: string
}

export interface UserListResponse {
  data: User[]
}

// ==========================================
// KONFIGURASI AXIOS
// ==========================================

// URL untuk Auth (Login, Register, Logout, Me) - Di Root
const AUTH_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"

// URL untuk Data API (Users, Activities, dll) - Di /api/v1
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

// Instance Axios dengan Credential (Cookies)
const api = axios.create({
  withCredentials: true, // PENTING: Agar cookie token dikirim/diterima
  headers: {
    "Content-Type": "application/json",
  },
})

// ==========================================
// SERVICE METHODS
// ==========================================

export const UserService = {
  // --- AUTHENTICATION ---
  
  async login(data: LoginPayload) {
    const res = await api.post(`${AUTH_URL}/login-local`, data)
    return res.data
  },

  async register(data: RegisterPayload) {
    const res = await api.post(`${AUTH_URL}/register`, data)
    return res.data
  },

  async logout() {
    const res = await api.post(`${AUTH_URL}/logout`)
    return res.data
  },

  async getMe() {
    // Backend mengirim: { user: { ... } }
    const res = await api.get<{ user: User }>(`${AUTH_URL}/me`)
    return res.data
  },

  // --- ADMIN USER MANAGEMENT (CRUD) ---

  async getAll() {
    const res = await api.get<UserListResponse>(`${API_URL}/users`)
    return res.data
  },

  async create(data: UserPayload) {
    const res = await api.post(`${API_URL}/users`, data)
    return res.data
  },

  // Mendukung Partial Update
  async update(id: number, data: Partial<UserPayload>) {
    const res = await api.put(`${API_URL}/users/${id}`, data)
    return res.data
  },

  async delete(id: number) {
    const res = await api.delete(`${API_URL}/users/${id}`)
    return res.data
  },

  // --- SELF PROFILE UPDATE ---
  
  async updateProfile(id: number, data: Partial<UserPayload>) {
    const res = await api.put(`${API_URL}/users/${id}`, data)
    return res.data
  },

  // --- UPDATE PASSWORD ---
  async updatePassword(id: number, data: { new_password: string }) {
    const payload = {
        password: data.new_password
    }
    const res = await api.put(`${API_URL}/users/${id}`, payload)
    return res.data
  },

  // --- UPLOAD AVATAR (NEXTCLOUD/LOCAL) ---
  // Parameter ID dihapus karena endpoint upload bersifat umum dan mengembalikan URL
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append("avatar", file) 

    const res = await api.post(`${API_URL}/upload/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return res.data
  }
}