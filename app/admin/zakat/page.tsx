"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Coins,
  Search,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Calculator,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function AdminZakatPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const zakatStats = [
    {
      title: "Total Zakat Hari Ini",
      value: formatCurrency(8750000),
      change: "+12.3%",
      icon: <Coins className="h-6 w-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Muzakki Aktif",
      value: "156",
      change: "+8.7%",
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Zakat Fitrah",
      value: formatCurrency(2450000),
      change: "+15.2%",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Zakat Mal",
      value: formatCurrency(6300000),
      change: "+9.8%",
      icon: <Calculator className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const zakatPayments = [
    {
      id: "ZK001234",
      muzakki: "Ahmad Hidayat",
      email: "ahmad@email.com",
      type: "Zakat Fitrah",
      amount: 35000,
      jiwa: 5,
      method: "Transfer Bank",
      date: "2024-12-14 10:30",
      status: "success",
    },
    {
      id: "ZK001235",
      muzakki: "Siti Khadijah",
      email: "siti@email.com",
      type: "Zakat Mal",
      amount: 2500000,
      jiwa: 1,
      method: "E-Wallet",
      date: "2024-12-14 09:15",
      status: "pending",
    },
    {
      id: "ZK001236",
      muzakki: "Budi Rahman",
      email: "budi@email.com",
      type: "Zakat Profesi",
      amount: 1250000,
      jiwa: 1,
      method: "QRIS",
      date: "2024-12-14 08:45",
      status: "success",
    },
  ]

  const zakatSettings = [
    { name: "Harga Emas per Gram", value: "1,150,000", unit: "IDR" },
    { name: "Harga Perak per Gram", value: "15,500", unit: "IDR" },
    { name: "Nisab Emas", value: "85", unit: "gram" },
    { name: "Nisab Perak", value: "595", unit: "gram" },
    { name: "Zakat Fitrah per Jiwa", value: "35,000", unit: "IDR" },
    { name: "Fidyah per Hari", value: "15,000", unit: "IDR" },
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
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Zakat</h1>
              <p className="text-gray-600">Kelola pembayaran zakat jamaah</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Calculator className="mr-2 h-4 w-4" />
              Kalkulator Zakat
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {zakatStats.map((stat, index) => (
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

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="payments">Pembayaran</TabsTrigger>
            <TabsTrigger value="calculator">Kalkulator</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Coins className="h-6 w-6 text-emerald-600" />
                    <span>Daftar Pembayaran Zakat</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari muzakki..."
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
                        <th className="text-left p-3 font-semibold">Muzakki</th>
                        <th className="text-left p-3 font-semibold">Jenis</th>
                        <th className="text-left p-3 font-semibold">Jumlah</th>
                        <th className="text-left p-3 font-semibold">Jiwa</th>
                        <th className="text-left p-3 font-semibold">Metode</th>
                        <th className="text-left p-3 font-semibold">Tanggal</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zakatPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{payment.id}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-semibold">{payment.muzakki}</p>
                              <p className="text-xs text-gray-600">{payment.email}</p>
                            </div>
                          </td>
                          <td className="p-3">{payment.type}</td>
                          <td className="p-3 font-bold text-emerald-600">{formatCurrency(payment.amount)}</td>
                          <td className="p-3">{payment.jiwa} jiwa</td>
                          <td className="p-3">{payment.method}</td>
                          <td className="p-3 text-xs">{payment.date}</td>
                          <td className="p-3">{getStatusBadge(payment.status)}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {payment.status === "pending" && (
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

          <TabsContent value="calculator" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Kalkulator Zakat</CardTitle>
                <CardDescription>Tools untuk menghitung berbagai jenis zakat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Zakat Emas</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Jumlah Emas (gram)</label>
                        <Input type="number" placeholder="85" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Harga per Gram</label>
                        <Input type="number" placeholder="1150000" />
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Hitung Zakat Emas</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Zakat Perak</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Jumlah Perak (gram)</label>
                        <Input type="number" placeholder="595" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Harga per Gram</label>
                        <Input type="number" placeholder="15500" />
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Hitung Zakat Perak</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Zakat Penghasilan</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Penghasilan per Bulan</label>
                        <Input type="number" placeholder="10000000" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Pengeluaran Pokok</label>
                        <Input type="number" placeholder="5000000" />
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Hitung Zakat Penghasilan</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Zakat Fitrah</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Jumlah Jiwa</label>
                        <Input type="number" placeholder="4" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tarif per Jiwa</label>
                        <Input type="number" placeholder="35000" disabled />
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Hitung Zakat Fitrah</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Pengaturan Zakat</CardTitle>
                <CardDescription>Kelola tarif dan nisab zakat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {zakatSettings.map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{setting.name}</h3>
                        <p className="text-sm text-gray-600">
                          Nilai saat ini: {setting.value} {setting.unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Input className="w-32" placeholder={setting.value} />
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Pengaturan Notifikasi</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Reminder Zakat Bulanan</p>
                        <p className="text-sm text-gray-600">Kirim pengingat zakat setiap bulan</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifikasi Zakat Fitrah</p>
                        <p className="text-sm text-gray-600">Pengingat menjelang Ramadan</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Update Harga Emas/Perak</p>
                        <p className="text-sm text-gray-600">Update otomatis harga logam mulia</p>
                      </div>
                      <Switch />
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
