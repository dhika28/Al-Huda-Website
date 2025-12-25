"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Truck,
  Bell,
  Settings,
  FileText,
  Plus,
  Download,
  Search,
  Menu,
  Home,
  HandHeart,
  Calculator,
  ChurchIcon as Mosque,
  Clock,
  AlertTriangle,
  Heart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const sidebarItems = [
    { icon: <BarChart3 className="h-5 w-5" />, label: "Dashboard", href: "/admin", active: true },
    { icon: <Users className="h-5 w-5" />, label: "Manajemen Jamaah", href: "/admin/users" },
    { icon: <HandHeart className="h-5 w-5" />, label: "Donasi & Infaq", href: "/admin/donations" },
    { icon: <Calculator className="h-5 w-5" />, label: "Zakat", href: "/admin/zakat" },
    { icon: <Mosque className="h-5 w-5" />, label: "Qurban", href: "/admin/qurban" },
    { icon: <Truck className="h-5 w-5" />, label: "Ambulan", href: "/admin/ambulance" },
    { icon: <Clock className="h-5 w-5" />, label: "Jadwal Sholat", href: "/admin/prayer-times" },
    { icon: <Calendar className="h-5 w-5" />, label: "Kegiatan", href: "/admin/events" },
    { icon: <FileText className="h-5 w-5" />, label: "Laporan Keuangan", href: "/admin/reports" },
    { icon: <Settings className="h-5 w-5" />, label: "Pengaturan", href: "/admin/settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-emerald-600 to-blue-600">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
              <Mosque className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-emerald-100">Masjid Al Huda</p>
            </div>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-600">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Selamat datang kembali, Admin</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Cari..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center">
                  3
                </Badge>
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Lihat Website
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 125,000,000</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Zakat Collected</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 35,000,000</div>
                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 events this week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">New donation received</p>
                        <p className="text-sm text-muted-foreground">Rp 500,000 from Ahmad Suharto</p>
                      </div>
                      <div className="ml-auto font-medium">+Rp 500,000</div>
                    </div>
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Zakat payment</p>
                        <p className="text-sm text-muted-foreground">Rp 35,000 from Siti Nurhaliza</p>
                      </div>
                      <div className="ml-auto font-medium">+Rp 35,000</div>
                    </div>
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">New user registered</p>
                        <p className="text-sm text-muted-foreground">Muhammad Ridwan joined</p>
                      </div>
                      <div className="ml-auto font-medium">+1</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Approvals */}
            <div>
              <Card className="border-0 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span>Perlu Persetujuan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">{/* Pending Approvals List */}</div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kegiatan
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Laporan
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Kirim Notifikasi
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan Sistem
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
