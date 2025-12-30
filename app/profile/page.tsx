"use client"

import { useState, useEffect } from "react"

import { ArrowLeft, User, Calendar, Edit, Camera, Sparkles, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    joinDate: "",
    membershipType: "Jamaah",
    avatar: "/placeholder.svg",
  })

  const [userActivities, setUserActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [activeType, setActiveType] = useState<
    "donasi" | "zakat" | "qurban" | "ambulans"
  >("donasi")

  const dummyActivities = [
    {
      id: 103,
      type: "ambulans",
      message: "Peminjaman Ambulans RS XYZ",
      created_at: "2025-09-05T14:30:00Z",
    },
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch("http://localhost:8080/me", {
          method: "GET",
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          const user = data.user || data

          setProfileData({
            id: user.id?.toString() || "",
            name: user.full_name || user.name || "Pengguna",
            email: user.email || "",
            phone: user.phone || "-",
            address: user.address || "",
            avatar: user.avatar || "/placeholder.svg",
            joinDate: user.joinDate || new Date().toISOString(),
            membershipType: user.membershipType || "Jamaah",
          })

          localStorage.setItem("user", JSON.stringify(user))
        }
      } catch (err) {
        console.error("⚠️ Error fetch profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    if (!profileData.id) return;
    setLoadingActivities(true);

    const fetchActivities = async () => {
      try {
        const uid = Number(profileData.id);

        const res = await fetch(`http://localhost:8080/api/v1/user-donations?user_id=${uid}`, {
          credentials: "include",
        });

        let donations: any[] = [];
        if (res.ok) {
          const data = await res.json();
          donations = Array.isArray(data) ? data : [];
        }

        const mappedDonations = donations.map((d) => ({
          id: d.id,
          type: "donasi",
          title: d.program_id ? d.program_name || "Program" : "Donasi Cepat",
          donasiLabel: d.program_id ? "Program" : "Donasi Cepat",
          amount: d.amount ?? 0,
          created_at: d.created_at,
        }));

        const resZakat = await fetch(`http://localhost:8080/api/v1/zakat?user_id=${uid}`, {
          credentials: "include",
        });

        let zakat: any[] = [];
        if (resZakat.ok) {
          const data = await resZakat.json();
          zakat = Array.isArray(data) ? data : [];
        }

        const mappedZakat = zakat.map((z) => ({
          id: z.id,
          type: "zakat",
          title: z.zakat_type === "fitrah" ? "Zakat Fitrah" :
                 z.zakat_type === "mal" ? "Zakat Mal" : "Zakat",
          amount: z.amount,
          created_at: z.created_at,
        }));

        const resQurban = await fetch(`http://localhost:8080/api/v1/qurban-history?user_id=${uid}`, {
          credentials: "include",
        });

        let qurban: any[] = [];
        if (resQurban.ok) {
          const data = await resQurban.json();
          qurban = Array.isArray(data) ? data : [];
        }

        const mappedQurban = qurban.map((q) => ({
          id: q.id,
          type: "qurban",
          title: q.package_name ?? "Paket Qurban",
          amount: Number(q.price ?? q.amount ?? 0),
          created_at: q.created_at ?? q.createdAt,
        }));

        const all = [...mappedDonations, ...mappedZakat, ...mappedQurban]
          .filter((x) => x.created_at)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setUserActivities(all);
      } catch (err) {
        console.error(err);
        setUserActivities(dummyActivities);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [profileData.id]);

  const saveProfile = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/user/${profileData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            full_name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            address: profileData.address,
          }),
        }
      )

      if (res.ok) {
        const updatedData = await res.json()
        setProfileData((prev) => ({
          ...prev,
          ...updatedData,
          name: updatedData.full_name || updatedData.name || prev.name,
        }))
        localStorage.setItem("user", JSON.stringify(updatedData))
        setIsEditing(false)
        alert("✅ Perubahan profil berhasil disimpan!")
      } else {
        alert("❌ Gagal menyimpan profil")
      }
    } catch (err) {
      console.error(err)
      alert("⚠️ Terjadi kesalahan")
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)

  const getTypeConfig = (type: string) => {
    const configs = {
      donasi: { 
        color: "bg-gradient-to-r from-emerald-500 to-emerald-1000",
        lightBg: "bg-emerald-50",
        border: "border-emerald-200"
      },
      zakat: { 
        color: "bg-gradient-to-r from-blue-500 to-blue-500",
        lightBg: "bg-blue-50",
        border: "border-blue-200"
      },
      qurban: { 
        color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
        lightBg: "bg-yellow-50",
        border: "border-yellow-200"
      },
      ambulans: { 
        color: "bg-gradient-to-r from-red-500 to-red-600",
        lightBg: "bg-red-50",
        border: "border-red-200"
      }
    }
    return configs[type as keyof typeof configs] || configs.donasi
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat profil...</p>
        </div>
      </div>
    )
  }

  const filteredActivities = userActivities.filter((a) => a.type === activeType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = '/'}
            className="hover:bg-emerald-100 hover:text-emerald-700 transition-all duration-300 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-black bg-clip-text text-transparent">
              Profil Saya
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Kelola akun dan riwayat aktivitas Anda
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 relative">

        {/* LEFT SIDEBAR */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-white to-emerald-50/30 backdrop-blur">
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            
            <CardContent className="pt-0 pb-8 text-center -mt-14">
              {/* AVATAR */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <Avatar className="relative w-32 h-32 shadow-2xl border-4 border-white rounded-full ring-4 ring-emerald-100">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    {profileData.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <Button
                  size="sm"
                  className="absolute bottom-1 right-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 w-10 h-10 p-0 shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <Camera className="h-4 w-4 text-white" />
                </Button>
              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">
                {profileData.name}
              </h3>

              <Badge className="mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                {profileData.membershipType}
              </Badge>

              <div className="mt-6 pt-6 border-t border-emerald-100">
                <p className="text-sm text-slate-600 flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Bergabung sejak {profileData.joinDate}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Total Aktivitas</span>
              </div>
              <p className="text-4xl font-bold">{userActivities.length}</p>
              <p className="text-sm opacity-75 mt-2">Kontribusi Anda</p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full rounded-2xl bg-white/80 backdrop-blur p-1.5 shadow-lg border border-emerald-100">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-medium"
              >
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-medium"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Riwayat
              </TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile">
              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <User className="h-5 w-5 text-emerald-700" />
                      </div>
                      Informasi Pribadi
                    </CardTitle>
                    
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 rounded-xl"
                    >
                      <Edit className="h-4 w-4" />
                      {isEditing ? "Batal" : "Edit Profil"}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Nama Lengkap</Label>
                      <Input
                        value={profileData.name}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-slate-50 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Email</Label>
                      <Input
                        type="email"
                        value={profileData.email}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-slate-50 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Nomor Telepon</Label>
                      <Input
                        value={profileData.phone}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-slate-50 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Jenis Keanggotaan</Label>
                      <Input 
                        value={profileData.membershipType} 
                        disabled 
                        className="rounded-xl border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Alamat Lengkap</Label>
                    <Textarea
                      rows={3}
                      value={profileData.address}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                      className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-slate-50 transition-all duration-300"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8"
                        onClick={saveProfile}
                      >
                        Simpan Perubahan
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="border-slate-300 hover:bg-slate-50 rounded-xl px-8"
                      >
                        Batal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history">
              <div className="flex flex-wrap gap-3 mb-6">
                {["donasi", "zakat", "qurban", "ambulans"].map((type) => {
                  const config = getTypeConfig(type)
                  return (
                    <Button
                      key={type}
                      variant={activeType === type ? "default" : "outline"}
                      className={`rounded-full px-6 py-2 font-medium transition-all duration-300 hover:scale-105 ${
                        activeType === type 
                          ? `${config.color} text-white shadow-lg` 
                          : "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"
                      }`}
                      onClick={() => setActiveType(type as any)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  )
                })}
              </div>

              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur">
                <CardContent className="space-y-4 p-8">
                  {loadingActivities ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600">Memuat riwayat...</p>
                    </div>
                  ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-10 w-10 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">Belum ada riwayat {activeType}</p>
                      <p className="text-slate-400 text-sm mt-2">Aktivitas Anda akan muncul di sini</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {filteredActivities.map((a) => {
                        const config = getTypeConfig(a.type)
                        return (
                          <li
                            key={a.id}
                            className={`group p-6 rounded-2xl border-2 ${config.border} ${config.lightBg} hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="font-bold text-slate-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors">
                                  {a.title}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(a.created_at).toLocaleDateString('id-ID', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {a.amount && (
                                  <span className="font-bold text-slate-900 text-lg">
                                    {formatCurrency(a.amount)}
                                  </span>
                                )}

                                <div className="flex gap-2">
                                  {a.type === "donasi" && a.donasiLabel && (
                                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full px-3 py-1 shadow-md">
                                      {a.donasiLabel}
                                    </Badge>
                                  )}

                                  <Badge className={`${config.color} text-white rounded-full px-3 py-1 shadow-md`}>
                                    {a.type.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}