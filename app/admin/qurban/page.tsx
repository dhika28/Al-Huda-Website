"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Beef,
  Search,
  Download,
  Eye,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
  Package,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function AdminQurbanPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const qurbanStats = [
    {
      title: "Total Pendaftar",
      value: "342",
      change: "+18.5%",
      icon: <Users className="h-6 w-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Hewan Terdaftar",
      value: "89",
      change: "+12.3%",
      icon: <Beef className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Pembayaran",
      value: formatCurrency(245000000),
      change: "+22.1%",
      icon: <Package className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Menunggu Konfirmasi",
      value: "23",
      change: "-5.2%",
      icon: <Clock className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const qurbanRegistrations = [
    {
      id: "QB001234",
      name: "Ahmad Fauzi",
      email: "ahmad@email.com",
      phone: "081234567890",
      package: "Kambing - Paket A",
      shares: 1,
      amount: 3500000,
      method: "Transfer Bank",
      date: "2024-12-14 10:30",
      status: "confirmed",
      location: "Masjid Al-Huda",
    },
    {
      id: "QB001235",
      name: "Siti Nurhaliza",
      email: "siti@email.com",
      phone: "081234567891",
      package: "Sapi - Paket B",
      shares: 2,
      amount: 5000000,
      method: "E-Wallet",
      date: "2024-12-14 09:15",
      status: "pending",
      location: "Masjid Al-Huda",
    },
    {
      id: "QB001236",
      name: "Budi Santoso",
      email: "budi@email.com",
      phone: "081234567892",
      package: "Kambing - Paket B",
      shares: 1,
      amount: 4000000,
      method: "QRIS",
      date: "2024-12-14 08:45",
      status: "confirmed",
      location: "Rumah Pribadi",
    },
  ]

  const qurbanPackages = [
    {
      id: 1,
      name: "Kambing Paket A",
      type: "Kambing",
      price: 3500000,
      maxShares: 1,
      description: "Kambing lokal berkualitas, berat 35-40kg",
      available: 25,
      registered: 18,
      status: "active",
    },
    {
      id: 2,
      name: "Kambing Paket B",
      type: "Kambing",
      price: 4000000,
      maxShares: 1,
      description: "Kambing etawa premium, berat 40-45kg",
      available: 20,
      registered: 15,
      status: "active",
    },
    {
      id: 3,
      name: "Sapi Paket A",
      type: "Sapi",
      price: 18000000,
      maxShares: 7,
      description: "Sapi lokal, berat 400-450kg",
      available: 10,
      registered: 42,
      status: "active",
    },
    {
      id: 4,
      name: "Sapi Paket B",
      type: "Sapi",
      price: 25000000,
      maxShares: 7,
      description: "Sapi limosin premium, berat 500-550kg",
      available: 8,
      registered: 28,
      status: "active",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-100 text-emerald-800">Terkonfirmasi</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPackageProgress = (registered: number, available: number, maxShares: number) => {
    const totalSlots = available * maxShares
    return Math.round((registered / totalSlots) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Qurban</h1>
              <p className="text-gray-600">Kelola pendaftaran dan paket qurban</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Paket
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {qurbanStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm font-medium ${stat.color} mt-1`}>{stat.change} dari kemarin</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="registrations">Pendaftaran</TabsTrigger>
            <TabsTrigger value="packages">Paket</TabsTrigger>
            <TabsTrigger value="schedule">Jadwal</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Beef className="h-6 w-6 text-emerald-600" />
                    <span>Daftar Pendaftaran Qurban</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari pendaftar..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Semua Status</option>
                      <option value="confirmed">Terkonfirmasi</option>
                      <option value="pending">Menunggu</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">ID</th>
                        <th className="text-left p-3 font-semibold">Pendaftar</th>
                        <th className="text-left p-3 font-semibold">Paket</th>
                        <th className="text-left p-3 font-semibold">Bagian</th>
                        <th className="text-left p-3 font-semibold">Total</th>
                        <th className="text-left p-3 font-semibold">Lokasi</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qurbanRegistrations.map((registration) => (
                        <tr key={registration.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{registration.id}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-semibold">{registration.name}</p>
                              <p className="text-xs text-gray-600">{registration.email}</p>
                              <p className="text-xs text-gray-600">{registration.phone}</p>
                            </div>
                          </td>
                          <td className="p-3">{registration.package}</td>
                          <td className="p-3">{registration.shares} bagian</td>
                          <td className="p-3 font-bold text-emerald-600">{formatCurrency(registration.amount)}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-xs">{registration.location}</span>
                            </div>
                          </td>
                          <td className="p-3">{getStatusBadge(registration.status)}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {registration.status === "pending" && (
                                <>
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Paket Qurban Tersedia</CardTitle>
                <CardDescription>Kelola paket dan ketersediaan hewan qurban</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {qurbanPackages.map((pkg) => (
                    <div key={pkg.id} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                          <p className="text-emerald-600 font-bold text-lg">{formatCurrency(pkg.price)}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Switch checked={pkg.status === "active"} />
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{pkg.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{pkg.available}</p>
                          <p className="text-sm text-gray-600">Tersedia</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">{pkg.registered}</p>
                          <p className="text-sm text-gray-600">Terdaftar</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {getPackageProgress(pkg.registered, pkg.available, pkg.maxShares)}%</span>
                          <span>Max {pkg.maxShares} bagian per hewan</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${getPackageProgress(pkg.registered, pkg.available, pkg.maxShares)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Jadwal Penyembelihan</CardTitle>
                <CardDescription>Atur jadwal dan lokasi penyembelihan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Pengaturan Jadwal</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Tanggal Penyembelihan</label>
                          <Input type="date" defaultValue="2024-06-17" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Waktu Mulai</label>
                          <Input type="time" defaultValue="06:00" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Waktu Selesai</label>
                          <Input type="time" defaultValue="12:00" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Lokasi Penyembelihan</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Lokasi Utama</label>
                          <Input defaultValue="Masjid Al-Huda" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Alamat</label>
                          <Input defaultValue="Jl. Raya Bogor No. 123" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Koordinator</label>
                          <Input defaultValue="Ustadz Ahmad" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-4">Pengaturan Distribusi</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Distribusi Otomatis</p>
                          <p className="text-sm text-gray-600">Bagikan daging secara otomatis setelah penyembelihan</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notifikasi Pengambilan</p>
                          <p className="text-sm text-gray-600">Kirim notifikasi kepada pendaftar</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dokumentasi</p>
                          <p className="text-sm text-gray-600">Ambil foto dan video proses penyembelihan</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Laporan Qurban</CardTitle>
                <CardDescription>Generate dan unduh laporan qurban</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Laporan Pendaftaran</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Daftar Pendaftar Lengkap
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Pembayaran
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Statistik Paket
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Laporan Distribusi</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Jadwal Penyembelihan
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Daftar Distribusi
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Dokumentasi Kegiatan
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
