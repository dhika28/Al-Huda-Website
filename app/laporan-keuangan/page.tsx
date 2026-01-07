"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Filter,
  Eye,
  CheckCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LaporanKeuanganPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024")
  const [selectedMonth, setSelectedMonth] = useState("12")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const monthlyData = [
    { month: "Jan", income: 85000000, expense: 45000000 },
    { month: "Feb", income: 92000000, expense: 48000000 },
    { month: "Mar", income: 78000000, expense: 52000000 },
    { month: "Apr", income: 105000000, expense: 55000000 },
    { month: "May", income: 125000000, expense: 58000000 },
    { month: "Jun", income: 98000000, expense: 51000000 },
    { month: "Jul", income: 110000000, expense: 62000000 },
    { month: "Aug", income: 88000000, expense: 49000000 },
    { month: "Sep", income: 95000000, expense: 53000000 },
    { month: "Oct", income: 115000000, expense: 67000000 },
    { month: "Nov", income: 132000000, expense: 71000000 },
    { month: "Dec", income: 145000000, expense: 75000000 },
  ]

  const incomeCategories = [
    { category: "Donasi Umum", amount: 85000000, percentage: 45, color: "bg-emerald-500" },
    { category: "Zakat", amount: 45000000, percentage: 24, color: "bg-blue-500" },
    { category: "Infaq", amount: 35000000, percentage: 18, color: "bg-orange-500" },
    { category: "Qurban", amount: 15000000, percentage: 8, color: "bg-purple-500" },
    { category: "Lainnya", amount: 10000000, percentage: 5, color: "bg-gray-500" },
  ]

  const expenseCategories = [
    { category: "Operasional Masjid", amount: 35000000, percentage: 35, color: "bg-red-500" },
    { category: "Program Sosial", amount: 25000000, percentage: 25, color: "bg-yellow-500" },
    { category: "Pembangunan", amount: 20000000, percentage: 20, color: "bg-indigo-500" },
    { category: "Pendidikan", amount: 12000000, percentage: 12, color: "bg-pink-500" },
    { category: "Administrasi", amount: 8000000, percentage: 8, color: "bg-teal-500" },
  ]

  const recentTransactions = [
    { date: "2024-12-14", type: "Pemasukan", category: "Donasi", amount: 2500000, description: "Donasi Jum'at" },
    { date: "2024-12-13", type: "Pengeluaran", category: "Operasional", amount: -850000, description: "Listrik & Air" },
    { date: "2024-12-12", type: "Pemasukan", category: "Zakat", amount: 5000000, description: "Zakat Mal" },
    {
      date: "2024-12-11",
      type: "Pengeluaran",
      category: "Program Sosial",
      amount: -1200000,
      description: "Bantuan Dhuafa",
    },
    { date: "2024-12-10", type: "Pemasukan", category: "Infaq", amount: 750000, description: "Infaq Pembangunan" },
  ]

  const reports = [
    {
      title: "Laporan Keuangan Desember 2024",
      type: "Bulanan",
      date: "2024-12-14",
      size: "2.3 MB",
      status: "Tersedia",
    },
    {
      title: "Laporan Keuangan November 2024",
      type: "Bulanan",
      date: "2024-11-30",
      size: "2.1 MB",
      status: "Tersedia",
    },
    {
      title: "Laporan Tahunan 2024",
      type: "Tahunan",
      date: "2024-12-01",
      size: "5.7 MB",
      status: "Draft",
    },
    {
      title: "Laporan Zakat 2024",
      type: "Khusus",
      date: "2024-12-01",
      size: "1.8 MB",
      status: "Tersedia",
    },
  ]

  const totalIncome = monthlyData.reduce((sum, data) => sum + data.income, 0)
  const totalExpense = monthlyData.reduce((sum, data) => sum + data.expense, 0)
  const netIncome = totalIncome - totalExpense

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
              <p className="text-gray-600">Transparansi pengelolaan keuangan masjid</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Pemasukan</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Total Pengeluaran</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalExpense)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Saldo Bersih</p>
                  <p className="text-2xl font-bold">{formatCurrency(netIncome)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Efisiensi</p>
                  <p className="text-2xl font-bold">{Math.round((netIncome / totalIncome) * 100)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                <TabsTrigger value="income">Pemasukan</TabsTrigger>
                <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                <TabsTrigger value="reports">Laporan</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Monthly Chart */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <span>Grafik Keuangan Bulanan 2024</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyData.map((data, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{data.month}</span>
                            <div className="flex space-x-4">
                              <span className="text-emerald-600">+{formatCurrency(data.income)}</span>
                              <span className="text-red-600">-{formatCurrency(data.expense)}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${(data.income / 150000000) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${(data.expense / 150000000) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Transaksi Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "Pemasukan" ? "bg-emerald-100" : "bg-red-100"
                              }`}
                            >
                              {transaction.type === "Pemasukan" ? (
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{transaction.description}</p>
                              <p className="text-xs text-gray-600">
                                {transaction.category} • {transaction.date}
                              </p>
                            </div>
                          </div>
                          <div className={`font-bold ${transaction.amount > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="income" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-6 w-6 text-emerald-600" />
                      <span>Kategori Pemasukan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {incomeCategories.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{category.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{category.percentage}%</span>
                              <span className="font-bold text-emerald-600">{formatCurrency(category.amount)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`${category.color} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expense" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-6 w-6 text-red-600" />
                      <span>Kategori Pengeluaran</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {expenseCategories.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{category.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{category.percentage}%</span>
                              <span className="font-bold text-red-600">{formatCurrency(category.amount)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`${category.color} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${category.percentage}%` }}
                            ></div>
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
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <span>Unduh Laporan</span>
                    </CardTitle>
                    <CardDescription>Laporan keuangan lengkap dalam format PDF</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.map((report, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold">{report.title}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{report.type}</span>
                                <span>•</span>
                                <span>{report.date}</span>
                                <span>•</span>
                                <span>{report.size}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                report.status === "Tersedia"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-orange-100 text-orange-800"
                              }
                            >
                              {report.status}
                            </Badge>
                            {report.status === "Tersedia" && (
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Lihat
                                </Button>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Download className="h-4 w-4 mr-1" />
                                  Unduh
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Period Filter */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-purple-600" />
                  <span>Filter Periode</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tahun</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bulan</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Bulan</option>
                    <option value="12">Desember</option>
                    <option value="11">November</option>
                    <option value="10">Oktober</option>
                    <option value="9">September</option>
                    <option value="8">Agustus</option>
                    <option value="7">Juli</option>
                    <option value="6">Juni</option>
                    <option value="5">Mei</option>
                    <option value="4">April</option>
                    <option value="3">Maret</option>
                    <option value="2">Februari</option>
                    <option value="1">Januari</option>
                  </select>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Filter className="mr-2 h-4 w-4" />
                  Terapkan Filter
                </Button>
              </CardContent>
            </Card>

            {/* Transparency Info */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-800">
                  <CheckCircle className="h-5 w-5" />
                  <span>Jaminan Transparansi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Laporan real-time</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Audit independen</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Publikasi bulanan</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Akses publik 24/7</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Statistik Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Donatur Aktif</span>
                  <Badge className="bg-emerald-600">2,847</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Transaksi Bulan Ini</span>
                  <Badge className="bg-blue-600">1,234</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Program Berjalan</span>
                  <Badge className="bg-orange-600">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Penerima Bantuan</span>
                  <Badge className="bg-purple-600">856</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
