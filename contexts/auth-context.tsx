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
  name: string
  email: string
  phone?: string
  role: "user" | "admin"
  avatar?: string
  joinDate?: string
  membershipType?: string
}

export interface RegisterPayload {
  full_name: string
  email: string
  password: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
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

  // ==================== LOGIN ====================
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const res = await loginApi({ email, password })
      if (res.error) {
        console.error("❌ Login failed:", res.error)
        return false
      }

      // ✅ Ambil profil dari backend setelah login sukses
      const profile = await fetchProfile()
      if (profile.user) {
        setUser(profile.user)
        console.log("✅ Login success:", profile.user)
        return true
      }

      return false
    } catch (err) {
      console.error("⚠️ Login error:", err)
      return false
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

      // Setelah register, bisa langsung login otomatis
      const loginSuccess = await login(payload.email, payload.password)
      return loginSuccess
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
