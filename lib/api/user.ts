import axios from "axios"

// ==========================================
// TIPE DATA (Sesuai JSON Response Backend)
// ==========================================

export interface User {
  id: number
  name: string        // Backend mengirim key "name" (bukan full_name)
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
  // ------------------
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  full_name: string // Endpoint register biasanya pakai full_name (sesuaikan jika perlu)
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
    // Ke: http://localhost:8080/login-local
    const res = await api.post(`${AUTH_URL}/login-local`, data)
    return res.data
  },

  async register(data: RegisterPayload) {
    // Ke: http://localhost:8080/register
    const res = await api.post(`${AUTH_URL}/register`, data)
    return res.data
  },

  async logout() {
    // Ke: http://localhost:8080/logout
    const res = await api.post(`${AUTH_URL}/logout`)
    return res.data
  },

  async getMe() {
    // Ke: http://localhost:8080/me
    const res = await api.get<{ user: User }>(`${AUTH_URL}/me`)
    return res.data
  },

  // --- ADMIN USER MANAGEMENT (CRUD) ---

  async getAll() {
    // Ke: http://localhost:8080/api/v1/users
    const res = await api.get<UserListResponse>(`${API_URL}/users`)
    return res.data
  },

  async create(data: UserPayload) {
    // Ke: http://localhost:8080/api/v1/users
    const res = await api.post(`${API_URL}/users`, data)
    return res.data
  },

  // Mendukung Partial Update (misal: hanya update klasifikasi)
  async update(id: number, data: Partial<UserPayload>) {
    // Ke: http://localhost:8080/api/v1/users/{id}
    const res = await api.put(`${API_URL}/users/${id}`, data)
    return res.data
  },

  async delete(id: number) {
    // Ke: http://localhost:8080/api/v1/users/{id}
    const res = await api.delete(`${API_URL}/users/${id}`)
    return res.data
  },

  // --- SELF PROFILE UPDATE ---
  
  async updateProfile(id: number, data: Partial<UserPayload>) {
    // PERBAIKAN: Menggunakan endpoint 'users' (jamak), bukan 'user'
    // Ke: http://localhost:8080/api/v1/users/{id}
    const res = await api.put(`${API_URL}/users/${id}`, data)
    return res.data
  }
}