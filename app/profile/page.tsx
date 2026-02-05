"use client"

import { useState, useEffect, useRef } from "react"
import { 
  User, Mail, Phone, MapPin, Shield, 
  Save, Loader2, Key, Camera, AlertTriangle,
  Eye, EyeOff, X, Calendar, Activity, 
  Wallet, HeartHandshake, History as HistoryIcon,
  ArrowLeft, ChevronLeft, ChevronRight, LogOut 
} from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation" 

// Helper
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)

const getInitials = (name: string) => name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U"

interface ProfileState {
  id: number
  name: string
  email: string
  phone: string
  address: string
  role: string
  avatar: string
  status: string
  joinDate: string
  membershipType: string
}

export default function UserProfilePage() {
  const router = useRouter() 
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false) 
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  const [fileRaw, setFileRaw] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userActivities, setUserActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [activeActivityType, setActiveActivityType] = useState<"donasi" | "zakat" | "qurban">("donasi")

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const [profile, setProfile] = useState<ProfileState>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "user",
    avatar: "",
    status: "",
    joinDate: "",
    membershipType: "Jamaah"
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  // 1. FETCH DATA
  const fetchProfileData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:8080/me", { 
          method: "GET", 
          credentials: "include"
      })
      
      if (res.ok) {
        const json = await res.json()
        const u = json.user || json
        
        let cleanAvatar = u.avatar || "";
        if (cleanAvatar.includes("placeholder.svg")) {
            cleanAvatar = ""; 
        } else if (cleanAvatar.startsWith("http")) {
            cleanAvatar = `${cleanAvatar}?t=${new Date().getTime()}`
        }

        setProfile({
            id: u.id,
            name: u.name || u.full_name || "",
            email: u.email || "",
            phone: u.phone || "",
            address: u.address || "",
            role: u.role || "user",
            avatar: cleanAvatar, 
            status: u.status || "active",
            joinDate: u.joinDate || u.created_at || new Date().toISOString(),
            membershipType: u.membershipType || "Jamaah"
        })
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Gagal memuat profil.")
    } finally {
      setIsLoading(false)
    }
  }

  // 2. FETCH ACTIVITIES
  const fetchActivities = async () => {
    if (!profile.id) return;
    setLoadingActivities(true);
    
    try {
        const uid = profile.id;
        // Pastikan Base URL sesuai backend Anda
        const API_BASE = "http://localhost:8080/api/v1"; 

        const [resDonasi, resZakat, resQurban] = await Promise.all([
            fetch(`${API_BASE}/user-donations?user_id=${uid}`, { credentials: "include" }),
            fetch(`${API_BASE}/zakat?user_id=${uid}`, { credentials: "include" }),
            // Ini endpoint Qurban yang benar (sesuai lib/api anda)
            fetch(`${API_BASE}/qurban/history?user_id=${uid}`, { credentials: "include" })
        ]);

        const donasiData = resDonasi.ok ? await resDonasi.json() : [];
        const zakatData = resZakat.ok ? await resZakat.json() : [];
        const qurbanData = resQurban.ok ? await resQurban.json() : [];

        // console.log("DEBUG QURBAN:", qurbanData);

        // Helper Mapping yang Kuat (Handle Huruf Besar/Kecil dari Backend)
        const mapItem = (item: any, type: string, titleKey: string) => {
            const id = item.id || item.ID || Math.random();
            
            // Cek Key Title (Go PascalCase vs JS camelCase)
            let title = item[titleKey]; 
            if (!title && titleKey === 'program_name') title = item.ProgramName;
            if (!title && titleKey === 'zakat_type') title = item.ZakatType;
            if (!title && titleKey === 'package_name') title = item.PackageName; // Penting untuk Qurban

            // Fallback Title
            if (!title) title = (type === 'donasi' ? 'Donasi Umum' : type === 'zakat' ? 'Zakat' : 'Qurban');

            // Cek Amount (amount / price / Price / Amount)
            const amount = Number(item.amount || item.Amount || item.price || item.Price || 0);

            // Cek Date
            const created_at = item.created_at || item.CreatedAt || new Date().toISOString();

            // Cek Status
            const status = item.status || item.Status || "pending";

            return { id, type, title, amount, created_at, status };
        };

        const all = [
            ...(Array.isArray(donasiData) ? donasiData.map((d:any) => ({
                ...mapItem(d, 'donasi', 'program_name'), 
                title: d.program_id ? (d.program_name || d.ProgramName) : 'Donasi Cepat'
            })) : []),
            ...(Array.isArray(zakatData) ? zakatData.map((z:any) => mapItem(z, 'zakat', 'zakat_type')) : []),
            ...(Array.isArray(qurbanData) ? qurbanData.map((q:any) => mapItem(q, 'qurban', 'package_name')) : [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setUserActivities(all);

    } catch (e) {
        console.error("Activity fetch error:", e)
    } finally {
        setLoadingActivities(false);
    }
  }

  // --- USE EFFECTS ---
  useEffect(() => { 
      fetchProfileData() 
  }, []) // Run sekali saat mount

  useEffect(() => { 
      if(profile.id) fetchActivities() 
  }, [profile.id]) // Run kalau ID user sudah dapat
  
  useEffect(() => {
    setCurrentPage(1)
  }, [activeActivityType])

  // 3. HANDLER FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error("Ukuran file maksimal 2MB")

    setFileRaw(file)
    const previewUrl = URL.createObjectURL(file)
    setProfile(prev => ({ ...prev, avatar: previewUrl }))
  }

  // 4. UPDATE PROFILE
  const executeUpdateProfile = async () => {
    setIsSavingProfile(true)
    const toastId = toast.loading("Menyimpan ke server...") 

    try {
      const payload = new FormData() 
      
      payload.append("name", profile.name)
      payload.append("phone", profile.phone)
      payload.append("address", profile.address)
      
      if (fileRaw) {
        payload.append("avatar", fileRaw) 
      } else {
        const currentAvatar = profile.avatar.split('?')[0]; 
        if (currentAvatar && currentAvatar.startsWith("http")) {
            payload.append("avatar", currentAvatar)
        }
      }

      const res = await fetch("http://localhost:8080/me", { 
          method: "PUT",
          body: payload, 
          credentials: "include"
      })

      if (!res.ok) throw new Error(await res.text())

      const jsonResponse = await res.json()
      const u = jsonResponse.user || jsonResponse 

      let newAvatarUrl = u.avatar || profile.avatar
      if (newAvatarUrl && newAvatarUrl.startsWith("http")) {
          newAvatarUrl = `${newAvatarUrl}?t=${new Date().getTime()}`
      }

      setProfile(prev => ({
          ...prev,
          name: u.name || u.full_name || prev.name,
          phone: u.phone || prev.phone,
          address: (u.address !== null && u.address !== undefined) ? u.address : prev.address,
          avatar: newAvatarUrl
      }))
      
      setFileRaw(null) 
      toast.success("Berhasil! Profil diperbarui.", { id: toastId, duration: 3000 })

    } catch (error: any) {
      console.error("Update Error:", error)
      toast.error(`Gagal: ${error.message}`, { id: toastId, duration: 4000 })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const onProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.name.trim()) return toast.error("Nama Lengkap wajib diisi")

    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[250px]">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Konfirmasi Simpan
        </div>
        <div className="flex gap-2 justify-end mt-1">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Batal</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" 
            onClick={() => { toast.dismiss(t.id); executeUpdateProfile() }}>
            Ya, Simpan
          </Button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" })
  }

  // 5. UPDATE PASSWORD (LOGIC FIXED)
  const executeChangePassword = async () => {
    setIsSavingPassword(true)
    const toastId = toast.loading("Mengenkripsi password baru...")
    
    try {
        // PERBAIKAN: Gunakan endpoint /me/password agar ID diambil dari Token
        // Ini menjamin update ke user yang benar
        const res = await fetch("http://localhost:8080/me/password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_password: passwords.new }),
            credentials: "include"
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Gagal update password");
        }
        
        // Success Handler
        toast.success("Sukses! Password berhasil diganti. Silakan login ulang.", { id: toastId, duration: 3000 })
        setPasswords({ current: "", new: "", confirm: "" })
        
        // Opsional: Logout otomatis agar user login pakai password baru
        // setTimeout(() => executeLogout(), 2000); 

    } catch (error: any) {
        console.error("Pass error:", error);
        toast.error(`Gagal: ${error.message || "Terjadi kesalahan server"}`, { id: toastId, duration: 3000 })
    } finally {
        setIsSavingPassword(false)
    }
  }

  // 5. UPDATE PASSWORD (UI & VALIDASI)
  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi
    if (!passwords.new || passwords.new.length < 6) {
        return toast.error("Password minimal 6 karakter")
    }
    if (passwords.new !== passwords.confirm) {
        return toast.error("Konfirmasi password tidak cocok")
    }

    // Toast Konfirmasi
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[250px]">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Ganti Password?
        </div>
        <p className="text-xs text-gray-500">
            Pastikan Anda mengingat password baru ini.
        </p>
        <div className="flex gap-2 justify-end mt-1">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Batal</Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" 
            onClick={() => { 
                toast.dismiss(t.id); 
                executeChangePassword(); 
            }}>
            Ya, Ganti
          </Button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" })
  }

  // --- NEW: LOGIC LOGOUT ---
  const executeLogout = async () => {
    const toastId = toast.loading("Sedang keluar...")
    try {
        await fetch("http://localhost:8080/logout", {
            method: "POST", 
            credentials: "include"
        })

        toast.success("Berhasil keluar.", { id: toastId, duration: 2000 })
        
        setTimeout(() => {
            window.location.href = "/"
        }, 1000)

    } catch (error) {
        console.error("Logout error", error)
        toast.error("Gagal koneksi, memaksa keluar...", { id: toastId, duration: 2000 })
        setTimeout(() => window.location.href = "/login", 1500)
    }
  }

  const onLogoutClick = () => {
    toast((t) => (
        <div className="flex flex-col gap-3 min-w-[250px]">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <LogOut className="h-5 w-5 text-red-500" />
            Konfirmasi Keluar
          </div>
          <p className="text-xs text-gray-500">
              Apakah Anda yakin ingin keluar dari akun ini?
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Batal</Button>
            <Button size="sm" variant="destructive" 
              onClick={() => { 
                  toast.dismiss(t.id); 
                  executeLogout(); 
              }}>
              Ya, Keluar
            </Button>
          </div>
        </div>
      ), { duration: 5000, position: "top-center" })
  }

  // --- LOGIC PAGINATION ---
  const filteredHistory = userActivities.filter(a => a.type === activeActivityType)
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const currentHistoryItems = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading && profile.id === 0) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600"/></div>
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto max-w-[1600px] px-6 md:px-12 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full -ml-3">
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kelola Akun</h1>
                <p className="text-xs text-gray-500">Perbarui profil dan keamanan Anda</p>
              </div>
            </div>

            <Button 
                variant="destructive" 
                size="sm" 
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm"
                onClick={onLogoutClick}
            >
                <LogOut className="h-4 w-4 mr-2" /> Keluar
            </Button>

          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-[1600px] px-6 md:px-12 py-10 space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 h-full">
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden h-full">
              <div className="h-36 bg-emerald-600 relative"></div>
              
              <CardHeader className="text-center pt-0 relative -mt-16 pb-6 px-6">
                <div className="mx-auto w-36 h-36 relative mb-4 group">
                  <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogTrigger asChild>
                      <div className="w-full h-full rounded-full border-[6px] border-white shadow-md cursor-pointer overflow-hidden bg-white hover:opacity-90 transition-opacity">
                          <Avatar className="w-full h-full">
                            <AvatarImage key={profile.avatar} src={profile.avatar} className="object-cover" />
                            <AvatarFallback className="bg-emerald-50 text-emerald-600 text-3xl font-bold flex items-center justify-center h-full w-full">
                              {getInitials(profile.name)}
                            </AvatarFallback>
                          </Avatar>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
                        <DialogTitle className="sr-only">Preview</DialogTitle>
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                          <button onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-50"><X className="h-5 w-5" /></button>
                          {profile.avatar ? (
                              <img src={profile.avatar} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                          ) : (
                              <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center text-emerald-600 text-6xl font-bold">{getInitials(profile.name)}</div>
                          )}
                        </div>
                    </DialogContent>
                  </Dialog>

                  <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="absolute bottom-1 right-1 bg-emerald-600 text-white p-2.5 rounded-full shadow-md hover:bg-emerald-700 transition-all border-4 border-white"
                      title="Ganti Foto"
                  >
                      <Camera className="h-4 w-4" />
                  </button>
                </div>

                <CardTitle className="text-2xl font-bold text-gray-900">{profile.name}</CardTitle>
                
                <div className="mt-4 flex justify-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] uppercase tracking-wide border border-emerald-100">{profile.status}</Badge>
                  <div className="text-xs text-gray-400 flex items-center gap-1 px-2 border-l border-gray-300">
                      <Calendar className="h-3 w-3"/> Bergabung sejak {new Date(profile.joinDate).getFullYear()}
                  </div>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="space-y-8 pt-8 px-8 pb-10">
                  <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-600 shrink-0 border border-gray-100">
                          <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Akun</p>
                          <p className="text-sm font-medium text-gray-900 truncate" title={profile.email}>{profile.email}</p>
                      </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 shrink-0 border border-gray-100">
                          <Phone className="h-5 w-5" />
                      </div>
                      <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Telepon</p>
                          <p className="text-sm font-medium text-gray-900">{profile.phone || "-"}</p>
                      </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-orange-600 shrink-0 border border-gray-100">
                          <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Alamat</p>
                          <p className="text-sm font-medium text-gray-900 leading-relaxed">{profile.address || "-"}</p>
                      </div>
                  </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-14 bg-white border border-gray-200 rounded-xl p-1 mb-8 shadow-sm">
                  <TabsTrigger value="edit" className="rounded-lg h-full data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-medium transition-all">
                      <User className="mr-2 h-4 w-4"/> Edit Profil
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-lg h-full data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-medium transition-all">
                      <Shield className="mr-2 h-4 w-4"/> Keamanan
                  </TabsTrigger>
                  <TabsTrigger value="history" className="rounded-lg h-full data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 font-medium transition-all">
                      <HistoryIcon className="mr-2 h-4 w-4"/> Aktivitas
                  </TabsTrigger>
              </TabsList>

              <TabsContent value="edit">
                  <Card className="border-none shadow-xl rounded-2xl">
                      <CardHeader className="pb-4 border-b border-gray-100 px-8 pt-8">
                          <div className="flex items-center justify-between">
                              <div>
                                  <CardTitle className="text-xl font-bold text-gray-900">Edit Informasi</CardTitle>
                                  <CardDescription>Perbarui data pribadi Anda di sini.</CardDescription>
                              </div>
                              <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                                  <User className="h-6 w-6" />
                              </div>
                          </div>
                      </CardHeader>
                      
                      <form onSubmit={onProfileSubmit}>
                          <CardContent className="space-y-8 p-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                                      <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 transition-all" required />
                                  </div>
                                  <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">No. Telepon</Label>
                                      <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="08..." className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 transition-all" />
                                  </div>
                              </div>
                              
                              <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Alamat Lengkap</Label>
                                  <Textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} rows={4} className="bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 resize-none p-4 leading-relaxed" />
                              </div>
                          </CardContent>
                          
                          <CardFooter className="py-6 px-8 bg-gray-50/30 border-t border-gray-100 flex justify-end rounded-b-2xl">
                              <Button type="submit" disabled={isSavingProfile} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg h-11 px-8 rounded-lg">
                                  {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Simpan Perubahan
                              </Button>
                          </CardFooter>
                      </form>
                  </Card>
              </TabsContent>

              <TabsContent value="security">
                  <Card className="border-none shadow-xl rounded-2xl">
                      <CardHeader className="pb-4 border-b border-gray-100 px-8 pt-8">
                          <div className="flex items-center justify-between">
                              <div>
                                  <CardTitle className="text-xl font-bold text-gray-900">Keamanan Akun</CardTitle>
                                  <CardDescription>Ganti password untuk menjaga keamanan.</CardDescription>
                              </div>
                              <div className="p-3 bg-red-50 rounded-full text-red-600">
                                  <Shield className="h-6 w-6" />
                              </div>
                          </div>
                      </CardHeader>
                      <form onSubmit={onPasswordSubmit}>
                          <CardContent className="space-y-8 p-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Password Baru</Label>
                                      <div className="relative">
                                          <Input type={showPassword ? "text" : "password"} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="h-12 pr-10 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500" placeholder="Min. 6 karakter" />
                                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}</button>
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Konfirmasi Password</Label>
                                      <div className="relative">
                                          <Input type={showPassword ? "text" : "password"} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="h-12 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500" placeholder="Ulangi password" />
                                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}</button>
                                      </div>
                                  </div>
                              </div>
                          </CardContent>
                          <CardFooter className="py-6 px-8 bg-gray-50/30 border-t border-gray-100 flex justify-end rounded-b-2xl">
                              <Button type="submit" variant="destructive" disabled={isSavingPassword || !passwords.new} className="shadow-lg h-11 px-8 rounded-lg">
                                  {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Key className="mr-2 h-4 w-4"/>} Update Password
                              </Button>
                          </CardFooter>
                      </form>
                  </Card>
              </TabsContent>

              <TabsContent value="history">
                  <Card className="border-none shadow-xl rounded-2xl flex flex-col min-h-[500px]">
                      <CardHeader className="pb-4 border-b border-gray-100 px-8 pt-8">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                  <CardTitle className="text-xl font-bold text-gray-900">Riwayat Transaksi</CardTitle>
                                  <CardDescription>Catatan donasi, zakat, dan qurban Anda.</CardDescription>
                              </div>
                              
                              <div className="flex bg-gray-100 p-1 rounded-lg">
                                  {["donasi", "zakat", "qurban"].map((type) => (
                                      <button
                                          key={type}
                                          onClick={() => setActiveActivityType(type as any)}
                                          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all uppercase tracking-wide ${
                                              activeActivityType === type 
                                              ? "bg-white text-emerald-700 shadow-sm" 
                                              : "text-gray-500 hover:text-gray-700"
                                          }`}
                                      >
                                          {type}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </CardHeader>

                      <CardContent className="p-0 flex-1">
                          {loadingActivities ? (
                              <div className="p-12 text-center text-gray-400">
                                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2"/> Memuat data...
                              </div>
                          ) : filteredHistory.length === 0 ? (
                              <div className="p-16 text-center">
                                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <Activity className="h-8 w-8 text-gray-300" />
                                  </div>
                                  <p className="text-gray-500 font-medium">Belum ada riwayat {activeActivityType}.</p>
                              </div>
                          ) : (
                              <div className="divide-y divide-gray-100">
                                  {/* RENDER DATA PAGINATION */}
                                  {currentHistoryItems.map((item) => (
                                      <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                          <div className="flex items-center gap-4">
                                              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                                  item.type === 'donasi' ? 'bg-emerald-100 text-emerald-600' :
                                                  item.type === 'zakat' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
                                              }`}>
                                                  {item.type === 'donasi' ? <HeartHandshake className="h-5 w-5"/> : 
                                                   item.type === 'zakat' ? <Wallet className="h-5 w-5"/> : <Activity className="h-5 w-5" />}
                                              </div>
                                              <div>
                                                  <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{item.title}</p>
                                                  <p className="text-xs text-gray-500 mt-0.5">
                                                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                      })}
                                                  </p>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                                              <Badge variant="outline" className={`mt-1 text-[10px] uppercase font-normal border-gray-200 ${
                                                  item.status === 'Selesai' || item.status === 'Diterima' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-gray-500'
                                              }`}>
                                                  {item.status}
                                              </Badge>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </CardContent>

                      {filteredHistory.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-b-2xl">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1"/> Sebelumnya
                            </Button>
                            
                            <span className="text-xs font-medium text-gray-500">
                                Halaman {currentPage} dari {totalPages}
                            </span>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200"
                            >
                                Selanjutnya <ChevronRight className="h-4 w-4 ml-1"/>
                            </Button>
                        </div>
                      )}
                  </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}