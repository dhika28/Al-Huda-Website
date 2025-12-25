"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
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
  Star,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminEventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const eventStats = [
    {
      title: "Total Kegiatan",
      value: "24",
      change: "+8.3%",
      icon: <Calendar className="h-6 w-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Kegiatan Aktif",
      value: "12",
      change: "+15.2%",
      icon: <Star className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Peserta",
      value: "1,247",
      change: "+22.1%",
      icon: <Users className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Menunggu Approval",
      value: "5",
      change: "-12.5%",
      icon: <Clock className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const events = [
    {
      id: "EV001234",
      title: "Kajian Rutin Jumat",
      category: "Kajian",
      date: "2024-12-20",
      time: "19:30",
      location: "Masjid Al-Huda",
      speaker: "Ustadz Ahmad Hidayat",
      capacity: 200,
      registered: 156,
      status: "active",
      description: "Kajian rutin setiap hari Jumat setelah Maghrib",
    },
    {
      id: "EV001235",
      title: "Pelatihan Tahfidz Anak",
      category: "Pendidikan",
      date: "2024-12-22",
      time: "08:00",
      location: "Ruang Kelas Masjid",
      speaker: "Ustadzah Fatimah",
      capacity: 50,
      registered: 42,
      status: "active",
      description: "Program pelatihan menghafal Al-Quran untuk anak-anak",
    },
    {
      id: "EV001236",
      title: "Bakti Sosial Ramadan",
      category: "Sosial",
      date: "2024-12-25",
      time: "06:00",
      location: "Desa Sukamaju",
      speaker: "Tim Relawan",
      capacity: 100,
      registered: 89,
      status: "pending",
      description: "Kegiatan bakti sosial menyambut bulan Ramadan",
    },
    {
      id: "EV001237",
      title: "Seminar Ekonomi Syariah",
      category: "Seminar",
      date: "2024-12-28",
      time: "09:00",
      location: "Aula Masjid",
      speaker: "Dr. Abdullah Rahman",
      capacity: 300,
      registered: 245,
      status: "active",
      description: "Seminar tentang prinsip-prinsip ekonomi Islam",
    },
  ]

  const eventCategories = [
    { name: "Kajian", count: 8, color: "bg-emerald-100 text-emerald-800" },
    { name: "Pendidikan", count: 6, color: "bg-blue-100 text-blue-800" },
    { name: "Sosial", count: 4, color: "bg-purple-100 text-purple-800" },
    { name: "Seminar", count: 3, color: "bg-orange-100 text-orange-800" },
    { name: "Pelatihan", count: 3, color: "bg-pink-100 text-pink-800" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800">Aktif</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Selesai</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCapacityPercentage = (registered: number, capacity: number) => {
    return Math.round((registered / capacity) * 100)
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
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Kegiatan</h1>
              <p className="text-gray-600">Kelola kegiatan dan acara masjid</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kegiatan
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {eventStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm font-medium ${stat.color} mt-1`}>{stat.change} dari bulan lalu</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="events">Kegiatan</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-emerald-600" />
                    <span>Daftar Kegiatan</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari kegiatan..."
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
                      <option value="active">Aktif</option>
                      <option value="pending">Menunggu</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                            {getStatusBadge(event.status)}
                            <Badge variant="outline">{event.category}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{event.date} • {event.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{event.registered}/{event.capacity} peserta</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Kapasitas: {getCapacityPercentage(event.registered, event.capacity)}%</span>
                              <span>{event.capacity - event.registered} slot tersisa</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getCapacityPercentage(event.registered, event.capacity)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {event.status === "pending" && (
                            <>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button variant="outline" size="sm">
                                <XCircle className="h-4 w-4 mr-1" />
                                Tolak
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Kategori Kegiatan</CardTitle>
                <CardDescription>Kelola kategori dan jenis kegiatan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {eventCategories.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge className={category.color}>{category.count}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-4">Tambah Kategori Baru</h3>
                  <div className="flex space-x-3">
                    <Input placeholder="Nama kategori" className="flex-1" />
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Kalender Kegiatan</CardTitle>
                <CardDescription>Lihat jadwal kegiatan dalam bentuk kalender</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Kalender Kegiatan</h3>
                  <p className="text-gray-600 mb-4">Fitur kalender akan segera tersedia</p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Integrasikan Kalender
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Laporan Kegiatan</CardTitle>
                <CardDescription>Generate dan unduh laporan kegiatan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Laporan Kegiatan</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Daftar Kegiatan Aktif
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Peserta
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Statistik Kehadiran
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Laporan Periodik</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Bulanan
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Tahunan
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Evaluasi Kegiatan
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            \
