"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  HandHeart,
  Search,
  Download,
  Eye,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDonationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const donationStats = [
    {
      title: "Total Donasi Hari Ini",
      value: formatCurrency(15750000),
      change: "+8.2%",
      icon: <DollarSign className="h-6 w-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Donatur Aktif",
      value: "247",
      change: "+12.5%",
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Rata-rata Donasi",
      value: formatCurrency(425000),
      change: "+5.1%",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Approval",
      value: "12",
      change: "-2.3%",
      icon: <Clock className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const donations = [
    {
      id: "DN001234",
      donor: "Ahmad Suharto",
      email: "ahmad@email.com",
      amount: 500000,
      type: "Donasi Umum",
      method: "Transfer Bank",
      date: "2024-12-14 10:30",
      status: "success",
      message: "Semoga berkah",
    },
    {
      id: "DN001235",
      donor: "Siti Aminah",
      email: "siti@email.com",
      amount: 1000000,
      type: "Pembangunan Masjid",
      method: "E-Wallet",
      date: "2024-12-14 09:15",
      status: "pending",
      message: "Untuk kemajuan masjid",
    },
    {
      id: "DN001236",
      donor: "Budi Santoso",
      email: "budi@email.com",
      amount: 250000,
      type: "Bantuan Sosial",
      method: "QRIS",
      date: "2024-12-14 08:45",
      status: "success",
      message: "",
    },
    {
      id: "DN001237",
      donor: "Fatimah Zahra",
      email: "fatimah@email.com",
      amount: 750000,
      type: "Donasi Umum",
      method: "Transfer Bank",
      date: "2024-12-13 16:20",
      status: "failed",
      message: "Barakallahu fiikum",
    },
  ]

  const donationPrograms = [
    {
      id: 1,
      name: "Pembangunan Masjid",
      target: 500000000,
      collected: 325000000,
      donors: 1247,
      status: "active",
    },
    {
      id: 2,
      name: "Program Pendidikan",
      target: 200000000,
      collected: 145000000,
      donors: 892,
      status: "active",
    },
    {
      id: 3,
      name: "Bantuan Sosial",
      target: 150000000,
      collected: 98000000,
      donors: 654,
      status: "active",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-emerald-100 text-emerald-800">Berhasil</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Gagal</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getProgress = (collected: number, target: number) => {
    return Math.round((collected / target) * 100)
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
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Donasi</h1>
              <p className="text-gray-600">Kelola donasi dan infaq jamaah</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Program
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {donationStats.map((stat, index) => (
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

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
            <TabsTrigger value="programs">Program</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <HandHeart className="h-6 w-6 text-emerald-600" />
                    <span>Daftar Transaksi Donasi</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari donatur..."
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
                      <option value="success">Berhasil</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Gagal</option>
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
                        <th className="text-left p-3 font-semibold">Donatur</th>
                        <th className="text-left p-3 font-semibold">Jumlah</th>
                        <th className="text-left p-3 font-semibold">Jenis</th>
                        <th className="text-left p-3 font-semibold">Metode</th>
                        <th className="text-left p-3 font-semibold">Tanggal</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{donation.id}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-semibold">{donation.donor}</p>
                              <p className="text-xs text-gray-600">{donation.email}</p>
                            </div>
                          </td>
                          <td className="p-3 font-bold text-emerald-600">{formatCurrency(donation.amount)}</td>
                          <td className="p-3">{donation.type}</td>
                          <td className="p-3">{donation.method}</td>
                          <td className="p-3 text-xs">{donation.date}</td>
                          <td className="p-3">{getStatusBadge(donation.status)}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {donation.status === "pending" && (
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

          <TabsContent value="programs" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Program Donasi Aktif</CardTitle>
                <CardDescription>Kelola program donasi dan target pencapaian</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {donationPrograms.map((program) => (
                    <div key={program.id} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{program.name}</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(program.collected)}</p>
                          <p className="text-sm text-gray-600">Terkumpul</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{formatCurrency(program.target)}</p>
                          <p className="text-sm text-gray-600">Target</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{program.donors}</p>
                          <p className="text-sm text-gray-600">Donatur</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {getProgress(program.collected, program.target)}%</span>
                          <span>{formatCurrency(program.target - program.collected)} lagi untuk mencapai target</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${getProgress(program.collected, program.target)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Laporan Donasi</CardTitle>
                <CardDescription>Generate dan unduh laporan donasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Laporan Harian</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Hari Ini
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Kemarin
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Laporan Periodik</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Mingguan
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Bulanan
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Laporan Tahunan
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
