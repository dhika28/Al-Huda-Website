"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Download,
  Plus,
  Search,
  Eye,
  Check,
  X,
  FileText,
} from "lucide-react"

export default function FinancialReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
              <p className="text-gray-600">Kelola keuangan masjid</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Simple Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pemasukan</p>
                  <p className="text-xl font-bold text-green-600">Rp 125M</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pengeluaran</p>
                  <p className="text-xl font-bold text-red-600">Rp 85M</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saldo</p>
                  <p className="text-xl font-bold text-blue-600">Rp 40M</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-orange-600">15</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 m-4 mb-0">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="transactions">Transaksi</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="reports">Laporan</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Simple Income Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pemasukan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Donasi</span>
                          <span className="font-semibold">Rp 45M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Zakat</span>
                          <span className="font-semibold">Rp 35M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Qurban</span>
                          <span className="font-semibold">Rp 25M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Infaq</span>
                          <span className="font-semibold">Rp 15M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Simple Expense Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pengeluaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Operasional</span>
                          <span className="font-semibold">Rp 30M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Program</span>
                          <span className="font-semibold">Rp 20M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sosial</span>
                          <span className="font-semibold">Rp 15M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Maintenance</span>
                          <span className="font-semibold">Rp 12M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">Donasi Bapak Ahmad</p>
                          <p className="text-sm text-gray-600">18 Jan 2024</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">+Rp 500,000</p>
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">Listrik Januari</p>
                          <p className="text-sm text-gray-600">17 Jan 2024</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">-Rp 2,500,000</p>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">Zakat Ibu Siti</p>
                          <p className="text-sm text-gray-600">16 Jan 2024</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">+Rp 35,000</p>
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="p-4">
                <div className="space-y-4">
                  {/* Simple Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Kelola Transaksi</h3>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah
                    </Button>
                  </div>

                  {/* Simple Search */}
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Cari transaksi..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                      <option>Semua Status</option>
                      <option>Approved</option>
                      <option>Pending</option>
                      <option>Rejected</option>
                    </select>
                  </div>

                  {/* Simple Table */}
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Deskripsi</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Jumlah</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">18 Jan 2024</td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">Donasi Bapak Ahmad</p>
                                  <p className="text-sm text-gray-600">Transfer Bank</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-green-600">+Rp 500,000</td>
                              <td className="px-4 py-3">
                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">17 Jan 2024</td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">Listrik Januari</p>
                                  <p className="text-sm text-gray-600">PLN</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-red-600">-Rp 2,500,000</td>
                              <td className="px-4 py-3">
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="text-green-600 bg-transparent">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">16 Jan 2024</td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">Zakat Ibu Siti</p>
                                  <p className="text-sm text-gray-600">E-Wallet</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-blue-600">+Rp 35,000</td>
                              <td className="px-4 py-3">
                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">15 Jan 2024</td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">Konsumsi Kajian</p>
                                  <p className="text-sm text-gray-600">Catering</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-purple-600">-Rp 750,000</td>
                              <td className="px-4 py-3">
                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">14 Jan 2024</td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium">Infaq Jumat</p>
                                  <p className="text-sm text-gray-600">Kotak Infaq</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-orange-600">+Rp 1,250,000</td>
                              <td className="px-4 py-3">
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="text-green-600 bg-transparent">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="budget" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Budget Monitoring</h3>
                    <Button variant="outline">Atur Budget</Button>
                  </div>

                  {/* Simple Budget Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Total Budget</p>
                        <p className="text-2xl font-bold text-blue-600">Rp 150M</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Terpakai</p>
                        <p className="text-2xl font-bold text-green-600">Rp 85M</p>
                        <p className="text-sm text-gray-500">56.7%</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Sisa</p>
                        <p className="text-2xl font-bold text-orange-600">Rp 65M</p>
                        <p className="text-sm text-gray-500">43.3%</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Simple Budget Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Budget per Kategori</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Operasional</span>
                            <span className="text-sm">Rp 30M / Rp 45M</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: "67%" }}></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">67% terpakai</p>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Program Dakwah</span>
                            <span className="text-sm">Rp 20M / Rp 35M</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "57%" }}></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">57% terpakai</p>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Bantuan Sosial</span>
                            <span className="text-sm">Rp 15M / Rp 25M</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">60% terpakai</p>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Maintenance</span>
                            <span className="text-sm">Rp 12M / Rp 20M</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">60% terpakai</p>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Kegiatan Ramadan</span>
                            <span className="text-sm">Rp 8M / Rp 25M</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: "32%" }}></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">32% terpakai</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Simple Alerts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Peringatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium text-orange-800">Budget Operasional</p>
                            <p className="text-sm text-orange-700">Sudah terpakai 67%, perlu perhatian</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-800">Persiapan Ramadan</p>
                            <p className="text-sm text-blue-700">Budget Ramadan masih tersedia Rp 17M</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Laporan Bulanan</h3>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b">
                          <div>
                            <p className="font-medium">Januari 2024</p>
                            <p className="text-sm text-gray-600">31 hari</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pemasukan</p>
                              <p className="font-semibold text-green-600">Rp 95M</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pengeluaran</p>
                              <p className="font-semibold text-red-600">Rp 70M</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Saldo</p>
                              <p className="font-semibold text-blue-600">Rp 25M</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b">
                          <div>
                            <p className="font-medium">Februari 2024</p>
                            <p className="text-sm text-gray-600">29 hari</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pemasukan</p>
                              <p className="font-semibold text-green-600">Rp 105M</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pengeluaran</p>
                              <p className="font-semibold text-red-600">Rp 75M</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Saldo</p>
                              <p className="font-semibold text-blue-600">Rp 30M</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b">
                          <div>
                            <p className="font-medium">Maret 2024</p>
                            <p className="text-sm text-gray-600">31 hari</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pemasukan</p>
                              <p className="font-semibold text-green-600">Rp 115M</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pengeluaran</p>
                              <p className="font-semibold text-red-600">Rp 80M</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Saldo</p>
                              <p className="font-semibold text-blue-600">Rp 35M</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100">
                          <div>
                            <p className="font-medium">April 2024</p>
                            <p className="text-sm text-gray-600">Bulan ini</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pemasukan</p>
                              <p className="font-semibold text-green-600">Rp 125M</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Pengeluaran</p>
                              <p className="font-semibold text-red-600">Rp 85M</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-600">Saldo</p>
                              <p className="font-semibold text-blue-600">Rp 40M</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
