"use client"

import { useState, useEffect, useRef } from "react"
import { 
  User, Mail, Phone, MapPin, Shield, 
  Save, Loader2, Key, Camera, AlertTriangle,
  Eye, EyeOff, X
} from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

import { UserService } from "@/lib/api/user" 

interface ProfileState {
  id: number
  name: string
  email: string
  phone: string
  address: string
  role: string
  avatar: string
  status: string
}

export default function AdminProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false) 
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  const [fileRaw, setFileRaw] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

  const [profile, setProfile] = useState<ProfileState>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    avatar: "",
    status: ""
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
      const response = await UserService.getMe()
      
      if (response && response.user) {
        const u = response.user
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
            status: u.status || "active"
        })
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Gagal memuat profil.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  // 2. HANDLER FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error("Ukuran file maksimal 2MB")

    setFileRaw(file)
    const previewUrl = URL.createObjectURL(file)
    setProfile(prev => ({ ...prev, avatar: previewUrl }))
  }

  // 3. UPDATE PROFILE
  const executeUpdateProfile = async () => {
    setIsSavingProfile(true)
    const toastId = toast.loading("Menyimpan ke server...")

    try {
      const formData = new FormData()
      formData.append("name", profile.name)
      formData.append("phone", profile.phone)
      formData.append("address", profile.address)
      
      if (fileRaw) {
        formData.append("avatar", fileRaw) 
      } else {
        const currentAvatar = profile.avatar.split('?')[0]; 
        if (currentAvatar && currentAvatar.startsWith("http")) {
            formData.append("avatar", currentAvatar)
        }
      }

      const res = await fetch(`${API_BASE_URL}/users/${profile.id}`, {
          method: "PUT",
          body: formData,
          credentials: "include"
      })

      if (!res.ok) throw new Error(await res.text())

      const jsonResponse = await res.json()
      let newAvatarUrl = jsonResponse.user?.avatar || profile.avatar
      if (newAvatarUrl && newAvatarUrl.startsWith("http")) {
          newAvatarUrl = `${newAvatarUrl}?t=${new Date().getTime()}`
      }

      setProfile(prev => ({
          ...prev,
          name: jsonResponse.user?.name || prev.name,
          phone: jsonResponse.user?.phone || prev.phone,
          address: jsonResponse.user?.address || prev.address,
          avatar: newAvatarUrl
      }))
      
      setFileRaw(null) 
      toast.success("Berhasil! Profil diperbarui.", { id: toastId })

    } catch (error: any) {
      console.error("Update Error:", error)
      toast.error(`Gagal: ${error.message}`, { id: toastId })
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

  // 4. UPDATE PASSWORD
  const executeUpdatePassword = async () => {
    setIsSavingPassword(true)
    const toastId = toast.loading("Updating password...")
    try {
        await UserService.updatePassword(profile.id, { new_password: passwords.new })
        toast.success("Password diganti!", { id: toastId })
        setPasswords({ current: "", new: "", confirm: "" })
    } catch {
        toast.error("Gagal ganti password", { id: toastId })
    } finally {
        setIsSavingPassword(false)
    }
  }

  const onPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwords.new || passwords.new.length < 6 || passwords.new !== passwords.confirm) {
        return toast.error("Password minimal 6 karakter")
    }
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="font-semibold text-red-600 flex gap-2"><Key className="h-4 w-4"/> Ganti Password?</div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Batal</Button>
          <Button size="sm" variant="destructive" onClick={() => { toast.dismiss(t.id); executeUpdatePassword() }}>Ya</Button>
        </div>
      </div>
    ))
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()

  if (isLoading && profile.id === 0) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600"/></div>
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-6">
      <Toaster position="top-center" />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Akun Saya</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ================================================= */}
        {/* KIRI: PROFILE CARD (Memanjang ke bawah)           */}
        {/* ================================================= */}
        <div className="lg:col-span-1 h-full">
          <Card className="border-none shadow-lg rounded-2xl overflow-hidden h-full">
            {/* Header dengan Gradient */}
            <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700 relative">
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <CardHeader className="text-center pt-0 relative -mt-16 pb-6 px-6">
              {/* Avatar Wrapper */}
              <div className="mx-auto w-40 h-40 relative mb-4 group">
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <div className="w-full h-full rounded-full border-[6px] border-white shadow-md cursor-pointer overflow-hidden bg-white">
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

                {/* Tombol Upload (Camera) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="absolute bottom-1 right-1 bg-emerald-600 text-white p-2.5 rounded-full shadow-md hover:bg-emerald-700 transition-all border-4 border-white"
                    title="Ganti Foto"
                >
                    <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Identitas */}
              <CardTitle className="text-3xl font-bold text-gray-900">{profile.name}</CardTitle>
              <CardDescription className="text-sm font-medium text-emerald-600 uppercase tracking-widest mt-1">{profile.role}</CardDescription>
              
              <div className="mt-4 flex justify-center gap-2">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] uppercase tracking-wide border border-emerald-100">{profile.status}</Badge>
                <Badge variant="outline" className="text-gray-500 border-gray-200 px-3 py-1 text-[10px] font-normal">ID: #{profile.id}</Badge>
              </div>
            </CardHeader>
            
            <Separator />
            
            {/* List Informasi Akun (Memanjang ke bawah) */}
            <CardContent className="space-y-6 pt-8 px-6 pb-10">
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

        {/* ================================================= */}
        {/* KANAN: FORM EDIT & PASSWORD                       */}
        {/* ================================================= */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* CARD KANAN ATAS: EDIT PROFILE */}
          <Card className="border-none shadow-lg rounded-2xl">
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
                <CardContent className="space-y-6 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                            <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="h-11 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 transition-all" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">No. Telepon</Label>
                            <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="08..." className="h-11 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 transition-all" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Alamat Lengkap</Label>
                        <Textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} rows={3} className="bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 resize-none min-h-[100px] p-4 leading-relaxed" />
                    </div>
                </CardContent>
                
                <CardFooter className="py-5 px-8 bg-gray-50/50 border-t border-gray-100 flex justify-end rounded-b-2xl">
                    <Button type="submit" disabled={isSavingProfile} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md h-10 px-6">
                        {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Simpan Perubahan
                    </Button>
                </CardFooter>
            </form>
          </Card>

          {/* CARD KANAN BAWAH: GANTI PASSWORD */}
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="pb-4 border-b border-gray-100 px-8 pt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Keamanan Akun</CardTitle>
                        <CardDescription>Ganti password untuk menjaga keamanan.</CardDescription>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                        <Shield className="h-6 w-6" />
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={onPasswordSubmit}>
                <CardContent className="space-y-6 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Password Baru</Label>
                            <div className="relative">
                                <Input type={showPassword ? "text" : "password"} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="h-11 pr-10 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500" placeholder="Min. 6 karakter" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Konfirmasi Password</Label>
                            <div className="relative">
                                <Input type={showPassword ? "text" : "password"} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="h-11 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500" placeholder="Ulangi password" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}</button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="py-5 px-8 bg-gray-50/50 border-t border-gray-100 flex justify-end rounded-b-2xl">
                    <Button type="submit" variant="outline" disabled={isSavingPassword || !passwords.new} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-10 px-6">
                        {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Key className="mr-2 h-4 w-4"/>} Update Password
                    </Button>
                </CardFooter>
            </form>
          </Card>

        </div>
      </div>
    </div>
  )
}