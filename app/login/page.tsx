"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
// Import Library Toast
import { toast, Toaster } from "react-hot-toast"

export default function AuthPage() {
  // REGISTER state
  const [registerFullName, setRegisterFullName] = useState("")
  const [registerPhoneNumber, setRegisterPhoneNumber] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  
  const [registerPassword, setRegisterPassword] = useState("")
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)

  // LOGIN state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const router = useRouter()
  const { login, register, isLoading } = useAuth()

  // Helper Validasi Email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // --- LOGIN HANDLER ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Validasi Input Kosong
    if (!loginEmail || !loginPassword) {
      toast.error("Email dan password wajib diisi", { id: "login-empty" })
      return
    }

    // 2. Validasi Format Email
    if (!isValidEmail(loginEmail)) {
      toast.error("Format email tidak valid", { id: "login-email-invalid" })
      return
    }

    const loadingToast = toast.loading("Sedang masuk...")

    try {
      const result = await login(loginEmail, loginPassword)

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success("Login berhasil! Mengalihkan...", { duration: 3000 })
        
        // Redirect logic
        setTimeout(() => {
          if (result.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/")
          }
        }, 1000)
      } else {
        // Handle Error dari Backend (Password salah / User not found)
        toast.error(result.error || "Email atau password salah", { duration: 4000 })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Terjadi kesalahan koneksi")
    }
  }

  // --- REGISTER HANDLER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Validasi Kolom Kosong
    if (!registerFullName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      toast.error("Mohon lengkapi semua data pendaftaran")
      return
    }

    // 2. Validasi Format Email
    if (!isValidEmail(registerEmail)) {
      toast.error("Format email tidak valid (contoh: user@gmail.com)")
      return
    }

    // 3. Validasi Panjang Password
    if (registerPassword.length < 6) {
      toast.error("Password terlalu pendek (Minimal 6 karakter)")
      return
    }

    // 4. Validasi Kecocokan Password
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Konfirmasi password tidak cocok")
      return
    }

    const loadingToast = toast.loading("Mendaftarkan akun...")

    try {
      const success = await register({
        full_name: registerFullName,
        phone: registerPhoneNumber,
        email: registerEmail,
        password: registerPassword,
      })

      toast.dismiss(loadingToast)

      if (success) {
        toast.success("Registrasi berhasil! Silakan login.", { duration: 5000 })
        
        // Reset Form
        setRegisterFullName("")
        setRegisterPhoneNumber("")
        setRegisterEmail("")
        setRegisterPassword("")
        setRegisterConfirmPassword("")
        
        // Reload halaman untuk pindah ke state login yang bersih
        setTimeout(() => {
            window.location.reload()
        }, 1500)
      } else {
        // Asumsi error paling umum jika validasi frontend lolos adalah duplikat email
        toast.error("Registrasi gagal. Email mungkin sudah terdaftar.", { duration: 4000 })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Terjadi kesalahan server saat mendaftar.")
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/login"
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Toast Container Config */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden relative">
        
        {/* LEFT - REGISTER */}
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 relative z-10 bg-white">
          <Link href="/" className="inline-flex items-center mb-8 text-black-300 hover:text-emerald-800 font-medium transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Beranda
          </Link>
          
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Buat Akun Baru</h2>
            <p className="text-gray-500 mt-2 text-sm">Bergabunglah dengan jamaah Masjid Al Huda</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <Label className="text-gray-700">Nama Lengkap <span className="text-red-500">*</span></Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Contoh: Ahmad Fulan"
                  className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 transition-all"
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Nomor HP <span className="text-red-500">*</span></Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Contoh: 08123456789"
                  className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 transition-all"
                  value={registerPhoneNumber}
                  onChange={(e) => setRegisterPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Email <span className="text-red-500">*</span></Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text" // Pakai text biar validasi regex kita yang handle
                  placeholder="nama@gmail.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Register Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Password <span className="text-red-500">*</span></Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Min. 6 karakter"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 transition-all"
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

              <div>
                <Label className="text-gray-700">Konfirmasi <span className="text-red-500">*</span></Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi Password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
                type="submit" 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all mt-2" 
                disabled={isLoading}
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Memproses...</> : "Daftar Sekarang"}
            </Button>
          </form>
        </div>

        {/* RIGHT - LOGIN */}
        <div className="p-8 md:p-12 pt-20 relative z-10 bg-gray-50/50 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Selamat Datang Kembali</h2>
                <p className="text-gray-500 mt-2 text-sm">Silakan masuk untuk mengakses akun Anda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label className="text-gray-700">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10 h-12 bg-white border-gray-200 focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <Label className="text-gray-700">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Masukkan Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white border-gray-200 focus:border-emerald-500 transition-all shadow-sm"
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

              <Button 
                type="submit" 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all" 
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Memeriksa...</> : "Masuk ke Akun"}
              </Button>
            </form>

            {/* Google Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 px-2 text-gray-500">Atau lanjutkan dengan</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  onClick={handleGoogleLogin}
                >
                  <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" />
                  Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}