"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function AuthPage() {
  // REGISTER state
  const [registerFullName, setRegisterFullName] = useState("")
  const [registerPhoneNumber, setRegisterPhoneNumber] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [registerError, setRegisterError] = useState("")

  // LOGIN state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginError, setLoginError] = useState("")

  // Toast
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  const router = useRouter()
  const { login, register, isLoading } = useAuth()

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(""), 3000)
  }

  // LOGIN handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (!loginEmail || !loginPassword) {
      setLoginError("Email dan password harus diisi")
      return
    }

    const success = await login(loginEmail, loginPassword)
    if (success) {
      showToast("Login berhasil!", "success")
      router.push("/")
    } else {
      setLoginError("Email atau password salah")
      showToast("Login gagal!", "error")
    }
  }

// REGISTER handler
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setRegisterError("")

  if (!registerFullName || !registerEmail || !registerPassword) {
    setRegisterError("Nama, email, dan password harus diisi")
    return
  }

  const success = await register({
    full_name: registerFullName,
    phone: registerPhoneNumber,
    email: registerEmail,
    password: registerPassword,
  })

  if (success) {
    showToast("Register berhasil! Silakan login.", "success")
    // reset form register
    setRegisterFullName("")
    setRegisterPhoneNumber("")
    setRegisterEmail("")
    setRegisterPassword("")
    setShowRegisterPassword(false)
    router.push("/login")
  } else {
    setRegisterError("Gagal register")
    showToast("Register gagal!", "error")
  }
}


  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/login"
  }

  return (
    <div className="font-sans min-h-screen bg-white flex items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden relative">
        {/* LEFT - REGISTER */}
        <div className="p-8 border-b md:border-b-0 md:border-r relative z-10">
          <Link href="/" className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-10">Sign Up</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nama Lengkap"
                  className="pl-9"
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Nomor HP</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nomor HP"
                  className="pl-9"
                  value={registerPhoneNumber}
                  onChange={(e) => setRegisterPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  placeholder="Alamat Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Register"}
            </Button>

            {registerError && (
              <Alert className="border-red-200 bg-red-50 mt-2">
                <AlertDescription className="text-red-800">{registerError}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* RIGHT - LOGIN */}
        <div className="p-8 pt-20 relative z-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-10">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{loginError}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  placeholder="Alamat Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Login"}
            </Button>
          </form>

          {/* Google Login */}
          <div className="mt-6 text-center">
            <span className="text-gray-500">atau</span>
          </div>
          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              className="bg-light px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
              onClick={handleGoogleLogin}
            >
              <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google logo" />
              Login dengan Google
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow text-white ${toastType === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}
