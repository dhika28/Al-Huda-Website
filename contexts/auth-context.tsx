"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  loginApi,
  registerApi,
  logout as logoutApi,
  fetchProfile,
} from "@/lib/api/auth"

// ==================== TYPES ====================
export interface User {
  id: string
  name?: string
  full_name?: string // Sesuaikan dengan backend kamu
  email: string
  phone?: string
  role: "user" | "admin" | string // Tambahkan string agar fleksibel jika ada role lain
  avatar?: string
  joinDate?: string
}

export interface RegisterPayload {
  full_name: string
  email: string
  password: string
  phone?: string
}

// Tipe data hasil login agar AuthPage bisa baca role
export interface LoginResult {
  success: boolean
  role?: string
  error?: string
}

interface AuthContextType {
  user: User | null
  // Update return type login disini:
  login: (email: string, password: string) => Promise<LoginResult>
  register: (payload: RegisterPayload) => Promise<boolean>
  logout: () => Promise<void>
  loginWithOAuth: (userData: User) => void
  isLoading: boolean
}

// ==================== CONTEXT ====================
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ==================== PROVIDER ====================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ Ambil profil otomatis saat pertama kali load (cek cookie)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetchProfile()
        if (res.user) {
          setUser(res.user)
          console.log("👤 Auto-login from cookie:", res.user)
        } else {
          console.log("ℹ️ No active session")
        }
      } catch (err) {
        console.error("⚠️ Failed to fetch user:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  // ==================== LOGIN (Diperbaiki) ====================
  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true)
    try {
      // 1. Panggil API Login (Set Cookie)
      const res = await loginApi({ email, password })
      
      if (res.error) {
        console.error("❌ Login failed:", res.error)
        return { success: false, error: res.error }
      }

      // 2. Jika sukses, segera ambil data Profil User (untuk dapatkan Role)
      const profile = await fetchProfile()
      
      if (profile.user) {
        setUser(profile.user)
        console.log("✅ Login success:", profile.user)
        
        // 🔥 PENTING: Return role agar AuthPage bisa redirect
        return { success: true, role: profile.user.role }
      }

      return { success: false, error: "Gagal memuat profil user" }
    } catch (err: any) {
      console.error("⚠️ Login error:", err)
      return { success: false, error: err.message || "Terjadi kesalahan" }
    } finally {
      setIsLoading(false)
    }
  }

  // ==================== REGISTER ====================
  const register = async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await registerApi(payload)
      if (res.error) {
        console.error("❌ Register failed:", res.error)
        return false
      }

      // Setelah register, login otomatis
      // Kita panggil fungsi login yang baru
      const loginResult = await login(payload.email, payload.password)
      
      return loginResult.success
    } catch (err) {
      console.error("⚠️ Register error:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // ==================== LOGIN OAUTH ====================
  const loginWithOAuth = (userData: User) => {
    setUser(userData)
    console.log("🔑 OAuth login success:", userData)
  }

  // ==================== LOGOUT ====================
  const logout = async () => {
    try {
      await logoutApi()
      setUser(null)
      // Opsional: Redirect paksa ke login page disini atau di komponen
      // window.location.href = "/login" 
      console.log("👋 Logged out and cookie cleared")
    } catch (err) {
      console.error("⚠️ Logout error:", err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loginWithOAuth,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ==================== HOOK ====================
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}