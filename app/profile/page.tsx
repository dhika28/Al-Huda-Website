"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, User, Calendar, Edit, Camera } from "lucide-react"

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

  // FETCH PROFILE
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

  // FETCH DONATION + ACTIVITIES
  useEffect(() => {
  if (!profileData.id) return;
  setLoadingActivities(true);

  const fetchActivities = async () => {
    try {
      const uid = Number(profileData.id);

      // FETCH DONASI
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

      // FETCH ZAKAT
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
      // FETCH QURBAN
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

      // GABUNGKAN SEMUA
      const all = [...mappedDonations, ...mappedZakat, ...mappedQurban]
        .filter((x) => x.created_at) // buang yg ga ada tanggal
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
          name:
            updatedData.full_name ||
            updatedData.name ||
            prev.name,
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

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "zakat":
        return "bg-yellow-500"
      case "qurban":
        return "bg-red-600"
      case "ambulans":
        return "bg-blue-600"
      default:
        return "bg-gray-400"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 animate-pulse">
          Memuat profil...
        </p>
      </div>
    )
  }

  const filteredActivities = userActivities.filter(
    (a) => a.type === activeType
  )

  return (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 pb-20">
    {/* HEADER */}
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b shadow-sm z-20">
      <div className="mx-auto px-4 py-4 flex items-center gap-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-emerald-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Profil Saya
          </h1>
          <p className="text-sm text-slate-500">
            Kelola akun dan riwayat aktivitas
          </p>
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">

      {/* LEFT SIDEBAR */}
      <div className="space-y-6 lg:col-span-1">
        <Card className="border-0 shadow-xl rounded-2xl">
          <CardContent className="pt-8 pb-6 text-center">

            {/* AVATAR */}
            <div className="relative inline-block">
              <Avatar className="w-28 h-28 shadow-md border-4 border-white rounded-full">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="text-xl">
                  {profileData.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full bg-emerald-600 hover:bg-emerald-700 w-9 h-9 p-0 shadow-md"
              >
                <Camera className="h-4 w-4 text-white" />
              </Button>
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              {profileData.name}
            </h3>

            <Badge className="mt-2 bg-emerald-600 text-white px-3 py-1 rounded-full">
              {profileData.membershipType}
            </Badge>

            <p className="mt-4 text-sm text-slate-500 flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Bergabung {profileData.joinDate}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT CONTENT */}
      <div className="lg:col-span-3">

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full rounded-xl bg-slate-100 p-1">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg"
            >
              Profil
            </TabsTrigger>

            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg"
            >
              Riwayat
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="flex justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-emerald-600" />
                  Informasi Pribadi
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* NAME */}
                  <div>
                    <Label>Nama Lengkap</Label>
                    <Input
                      value={profileData.name}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={profileData.email}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                    />
                  </div>

                  {/* PHONE */}
                  <div>
                    <Label>Nomor Telepon</Label>
                    <Input
                      value={profileData.phone}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                    />
                  </div>

                  {/* MEMBERSHIP */}
                  <div>
                    <Label>Jenis Keanggotaan</Label>
                    <Input value={profileData.membershipType} disabled />
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <Label>Alamat Lengkap</Label>
                  <Textarea
                    rows={3}
                    value={profileData.address}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 ml-auto"
                >
                  <Edit className="h-4 w-4" />
                  {isEditing ? "Batal" : "Edit"}
                </Button>


                {isEditing && (
                  <div className="flex gap-4">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={saveProfile}
                    >
                      Simpan
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Batal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history">
            <div className="flex gap-2 mb-4">
              {["donasi", "zakat", "qurban", "ambulans"].map((type) => (
                <Button
                  key={type}
                  variant={activeType === type ? "default" : "outline"}
                  className={`rounded-full px-4 ${
                    activeType === type ? "bg-emerald-600 text-white" : ""
                  }`}
                  onClick={() => setActiveType(type as any)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>

            <Card className="border-0 shadow-xl rounded-2xl">
              <CardContent className="space-y-4 py-6">

                {loadingActivities ? (
                  <p className="text-slate-500">Memuat riwayat...</p>
                ) : filteredActivities.length === 0 ? (
                  <p className="text-slate-500">Belum ada riwayat {activeType}.</p>
                ) : (
                  <ul className="space-y-3">
                    {filteredActivities.map((a) => (
                      <li
                        key={a.id}
                        className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{a.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(a.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {a.amount && (
                            <span className="font-semibold text-slate-800">
                              {formatCurrency(a.amount)}
                            </span>
                          )}

                          {a.type === "donasi" && (
                            <Badge className="bg-purple-600 text-white rounded-full">
                              {a.donasiLabel}
                            </Badge>
                          )}

                          <Badge className="rounded-full text-white px-3">
                            {a.type.toUpperCase()}
                          </Badge>
                        </div>
                      </li>
                    ))}
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

