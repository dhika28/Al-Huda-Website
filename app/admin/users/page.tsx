"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  Eye,
  Edit,
  Plus,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const userStats = [
    {
      title: "Total Jamaah",
      value: "2,847",
      change: "+12.5%",
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Jamaah Aktif",
      value: "2,156",
      change: "+8.2%",
      icon: <UserCheck className="h-6 w-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Donatur Aktif",
      value: "1,234",
      change: "+15.1%",
      icon: <Award className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pendaftar Baru",
      value: "45",
      change: "+5.3%",
      icon: <UserX className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const users = [
    {
      id: 1,
      name: "Ahmad Suharto",
      email: "ahmad.suharto@email.com",
      phone: "0812-3456-7890",
      address: "Jakarta Selatan",
      joinDate: "2022-03-15",
      status: "active",
      membershipType: "Premium",
      totalDonations: 5500000,
      lastActivity: "2024-12-14",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Siti Aminah",
      email: "siti.aminah@email.com",
      phone: "0813-2345-6789",
      address: "Jakarta Timur",
      joinDate: "2022-07-20",
      status: "active",
      membershipType: "Regular",
      totalDonations: 2750000,
      lastActivity: "2024-12-13",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Budi Santoso",
      email: "budi.santoso@email.com",
      phone: "0814-3456-7890",
      address: "Jakarta Barat",
      joinDate: "2023-01-10",
      status: "inactive",
      membershipType: "Regular",
      totalDonations: 1250000,
      lastActivity: "2024-11-28",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Fatimah Zahra",
      email: "fatimah.zahra@email.com",
      phone: "0815-4567-8901",
      address: "Jakarta Utara",
      joinDate: "2023-05-18",
      status: "active",
      membershipType: "Premium",
      totalDonations: 8750000,
      lastActivity: "2024-12-14",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800">Aktif</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Tidak Aktif</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getMembershipBadge = (type: string) => {
    switch (type) {
      case "Premium":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      case "Regular":
        return <Badge className="bg-blue-100 text-blue-800">Regular</Badge>
      default:
        return <Badge variant="outline">Basic</Badge>
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Jamaah</h1>
              <p className="text-gray-600">Kelola data jamaah dan keanggotaan</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jamaah
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => (
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

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="users">Daftar Jamaah</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    <span>Daftar Jamaah</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari jamaah..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                              {getMembershipBadge(user.membershipType)}
                              {getStatusBadge(user.status)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{user.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{user.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-6 mb-2">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Total Donasi</p>
                              <p className="font-bold text-emerald-600">{formatCurrency(user.totalDonations)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Bergabung</p>
                              <p className="font-medium text-gray-900">{user.joinDate}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Aktivitas Terakhir</p>
                              <p className="font-medium text-gray-900">{user.lastActivity}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-1" />
                              Kontak
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Pertumbuhan Jamaah</CardTitle>
                  <CardDescription>Grafik pertumbuhan jamaah per bulan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart akan ditampilkan di sini</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Distribusi Keanggotaan</CardTitle>
                  <CardDescription>Perbandingan jenis keanggotaan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Premium</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">35%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Regular</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <span className="text-sm text-gray-600">65%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Pengaturan Keanggotaan</CardTitle>
                <CardDescription>Konfigurasi sistem keanggotaan jamaah</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Jenis Keanggotaan</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Premium</h4>
                          <Badge className="bg-purple-100 text-purple-800">Aktif</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Akses penuh ke semua fitur</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Regular</h4>
                          <Badge className="bg-blue-100 text-blue-800">Aktif</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Akses standar ke fitur dasar</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Pengaturan Notifikasi</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="mr-2 h-4 w-4" />
                        Kirim Email Welcome
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        Reminder Aktivitas
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Award className="mr-2 h-4 w-4" />
                        Notifikasi Achievement
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
