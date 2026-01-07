"use client"

import { useState, useEffect } from "react"
import {
  Coins,
  Search,
  TrendingUp,
  Users,
  Wallet,
  Calendar as CalendarIcon,
  Download,
  UserCheck,
  PieChart,
  Info,
  Save,
  Edit,
  FileSpreadsheet,
  Printer,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpDown,
  FileText, 
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Package, // Icon Beras/Paket
  MinusCircle, // Icon Pengeluaran
  Receipt // Icon Struk
} from "lucide-react"
import { Toaster, toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Import API
import { 
    getAllZakat, 
    getZakatDistribution, 
    updateZakatDistribution, 
    createZakatPayment, 
    updateZakatStatus,
    ZakatDistributionItem 
} from "@/lib/api/zakat"

// Definisi Tipe Data
interface ZakatPayment {
  id: number
  user_id: number
  name: string
  extra_names: string[] | null 
  zakat_type: string
  total_people: number
  amount: number
  phone: string
  email: string
  message: string
  created_at: string
  status: string
}

// Dummy Data untuk Riwayat Penyaluran (Karena belum ada API Real)
const MOCK_DISTRIBUTION_HISTORY = [
    { id: 1, date: "2024-04-05", category: "Fakir Miskin", amount: 5000000, recipient_count: 25, notes: "Penyaluran Tahap 1 Dusun A" },
    { id: 2, date: "2024-04-06", category: "Amil", amount: 1500000, recipient_count: 5, notes: "Operasional Panitia" },
]

/* ===================================================================================
   MAIN PAGE COMPONENT
   =================================================================================== */
export default function AdminZakatPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") 

  const [zakatList, setZakatList] = useState<ZakatPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // State for Distribution Tab
  const [distributionStats, setDistributionStats] = useState<ZakatDistributionItem[]>([])
  const [totalZakatPool, setTotalZakatPool] = useState(0)
  
  // State Mode Edit Distribusi
  const [isEditingDist, setIsEditingDist] = useState(false)
  const [tempDistStats, setTempDistStats] = useState<ZakatDistributionItem[]>([])

  // State Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false)
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false) // NEW: Modal Salurkan
  const [selectedZakat, setSelectedZakat] = useState<ZakatPayment | null>(null)

  // Fetch Data on Load
  useEffect(() => {
    fetchData()
    fetchDistribution()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await getAllZakat()
      if (Array.isArray(data)) {
        setZakatList(data)
      } else {
        setZakatList([])
      }
    } catch (error) {
      toast.error("Gagal memuat data zakat")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDistribution = async () => {
    try {
      const data = await getZakatDistribution()
      setDistributionStats(data.distribution)
      setTotalZakatPool(data.total_zakat)
      setTempDistStats(data.distribution) 
    } catch (err) {
      console.error("Gagal load distribusi", err)
    }
  }

  // --- HANDLE STATUS CHANGE ---
  const onStatusChange = async (id: number, newStatus: string) => {
    toast.promise(
        updateZakatStatus(id, newStatus).then(() => {
            setZakatList(prev => prev.map(z => z.id === id ? { ...z, status: newStatus } : z))
            fetchDistribution()
        }),
        {
            loading: 'Mengupdate status...',
            success: <b>Status berhasil diperbarui!</b>,
            error: <b>Gagal mengupdate status.</b>,
        }
    );
  };

  // --- HELPER STATUS VISUALS ---
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "failed": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      case "failed": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // --- STATS LOGIC ---
  const totalZakatToday = zakatList
    .filter(z => new Date(z.created_at).toDateString() === new Date().toDateString() && z.status === 'success')
    .reduce((sum, z) => sum + (z.amount || 0), 0)

  const totalMuzakki = new Set(zakatList.map(z => z.email)).size

  const totalFitrah = zakatList
    .filter(z => z.zakat_type?.toLowerCase().includes("fitrah") && z.status === 'success')
    .reduce((sum, z) => sum + (z.amount || 0), 0)

  // FEATURE 2: KONVERSI BERAS (ASUMSI 1 ORANG = 50.000 = 2.5 KG)
  const estimatedRiceKg = (totalFitrah / 50000) * 2.5;
  
  const totalTransactions = zakatList.length

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })

  // --- FILTERING & PAGINATION LOGIC ---
  const filteredZakat = zakatList.filter(z => {
    const matchesSearch = z.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          z.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          z.zakat_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || z.status === statusFilter;

    return matchesSearch && matchesStatus;
  })

  // Pagination Calculation
  const totalPages = Math.ceil(filteredZakat.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredZakat.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // --- HANDLERS DISTRIBUSI ---
  const handlePercentChange = (index: number, val: string) => {
    const newVal = parseFloat(val) || 0
    const newStats = [...tempDistStats]
    newStats[index].percentage = newVal
    newStats[index].amount = (newVal / 100) * totalZakatPool
    setTempDistStats(newStats)
  }

  const handleSaveDistribution = async () => {
    const totalPct = tempDistStats.reduce((acc, curr) => acc + curr.percentage, 0)
    if (Math.abs(totalPct - 100) > 0.1) {
        toast.error(`Total persentase harus 100%. Saat ini: ${totalPct.toFixed(1)}%`)
        return
    }
    try {
        const payload = tempDistStats.map(item => ({ id: item.id, percentage: item.percentage }))
        await updateZakatDistribution(payload)
        toast.success("Konfigurasi distribusi berhasil disimpan!")
        setIsEditingDist(false)
        fetchDistribution() 
    } catch (error) {
        toast.error("Gagal menyimpan perubahan")
    }
  }

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API Call
    toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
            loading: 'Mencatat penyaluran...',
            success: 'Dana berhasil disalurkan!',
            error: 'Gagal mencatat.',
        }
    ).then(() => {
        setIsDistributeModalOpen(false)
        // Idealnya refresh data distribution disini
    });
  }

  // --- EXPORT HANDLERS ---
  const handleExportExcel = () => {
    if(zakatList.length === 0) return toast.error("Data kosong")
    const headers = ["ID", "Tanggal", "Muzakki", "Email", "Telepon", "Tipe", "Jml Jiwa", "Nama Lain", "Nominal", "Status", "Pesan"]
    const rows = zakatList.map(z => [
        z.id, new Date(z.created_at).toISOString().split('T')[0], `"${z.name}"`, z.email, `'${z.phone}`,
        z.zakat_type, z.total_people || 0, `"${z.extra_names ? z.extra_names.join(", ") : "-"}"`, z.amount, z.status || 'pending', `"${z.message || ""}"`
    ])
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Laporan_Zakat_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Laporan Excel berhasil diunduh")
  }

  const handleExportPDF = () => {
    if (zakatList.length === 0) return toast.error("Tidak ada data.")
    const printWindow = window.open('', '', 'height=800,width=1000')
    if (!printWindow) return toast.error("Pop-up diblokir.")
    
    const htmlContent = `<html><head><title>Laporan Zakat</title><style>body{font-family:'Times New Roman';padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #000;padding:8px}</style></head><body><h2 style="text-align:center">LAPORAN ZAKAT</h2><table><thead><tr><th>No</th><th>Tanggal</th><th>Muzakki</th><th>Tipe</th><th>Status</th><th>Nominal</th></tr></thead><tbody>${zakatList.map((z,i)=>`<tr><td style="text-align:center">${i+1}</td><td>${new Date(z.created_at).toLocaleDateString('id-ID')}</td><td>${z.name}</td><td>${z.zakat_type}</td><td style="text-align:center; text-transform:capitalize;">${z.status || 'pending'}</td><td style="text-align:right">${formatCurrency(z.amount)}</td></tr>`).join('')}</tbody></table><script>window.onload=function(){window.print()}</script></body></html>`
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-8 print:bg-white print:p-0">
      <Toaster position="top-center" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Kelola Zakat</h2>
          <p className="text-sm text-slate-500 mt-1">Pantau arus kas zakat, kelola distribusi, dan cetak laporan keuangan.</p>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
            <Button 
                onClick={() => setIsManualModalOpen(true)} 
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-slate-200"
            >
                <Wallet className="mr-2 h-4 w-4" />
                Catat Manual
            </Button>

            <Button 
                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white" 
                onClick={() => setIsRecapModalOpen(true)}
            >
                <ClipboardList className="mr-2 h-4 w-4" /> Rekap Harian
            </Button>
        </div>
      </div>
      
      <div className="space-y-8 w-full"> 
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          {[
            { title: "Zakat Hari Ini", val: formatCurrency(totalZakatToday), icon: <Coins className="h-5 w-5 text-emerald-600" />, sub: "Realtime (Sukses)", bg: "bg-emerald-50" },
            { title: "Total Muzakki", val: totalMuzakki.toString(), icon: <Users className="h-5 w-5 text-blue-600" />, sub: "Unik (Email)", bg: "bg-blue-50" },
            
            // FEATURE 2: INDIKATOR BERAS DI CARD FITRAH
            { 
              title: "Total Fitrah", 
              val: formatCurrency(totalFitrah), 
              icon: <Package className="h-5 w-5 text-purple-600" />, 
              sub: `Setara ± ${estimatedRiceKg.toLocaleString()} Kg Beras`, // KONVERSI DISINI
              bg: "bg-purple-50" 
            },
            
            { title: "Transaksi", val: totalTransactions.toString(), icon: <UserCheck className="h-5 w-5 text-orange-600" />, sub: "Total Record", bg: "bg-orange-50" }
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.val}</h3>
                        <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* TABS NAVIGATION */}
        <Tabs defaultValue="list" className="space-y-6 w-full">
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent h-auto p-0 gap-6 w-full justify-start">
              <TabsTrigger value="list" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Riwayat Transaksi</TabsTrigger>
              <TabsTrigger value="distribution" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Penyaluran (Distribusi)</TabsTrigger>
              <TabsTrigger value="reports" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Laporan</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: LIST */}
          <TabsContent value="list" className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
               <div className="relative w-full sm:w-[350px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Cari muzakki, email, atau tipe..." 
                    className="pl-10 bg-gray-50 border-gray-200 w-full"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
               </div>

               <div className="flex flex-wrap gap-2">
                    {['all', 'success', 'pending', 'failed'].map(s => (
                        <Button 
                            key={s} 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleFilterChange(s)}
                            className={`capitalize border h-9 ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}
                        >
                            {s === 'all' ? 'All' : s}
                        </Button>
                    ))}
               </div>
            </div>

            <Card className="border-b border-slate-200 pb-1 print:hidden overflow-hidden">
              <div className="overflow-x-auto w-full min-h-[400px]">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Memuat data zakat...</div>
                ) : filteredZakat.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">Tidak ada data ditemukan.</div>
                ) : (
                    <table className="w-full text-sm text-left table-auto">
                    <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 uppercase text-xs font-semibold">
                        <tr>
                        <th className="px-6 py-4 whitespace-nowrap">ID & Tanggal</th>
                        <th className="px-6 py-4 whitespace-nowrap">Muzakki</th>
                        <th className="px-6 py-4 whitespace-nowrap">Jenis Zakat</th>
                        <th className="px-6 py-4 text-right whitespace-nowrap">Nominal</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-right whitespace-nowrap">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentItems.map((z) => (
                        <tr key={z.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-5 align-top whitespace-nowrap">
                                <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border">#{z.id}</span>
                                <div className="text-xs text-gray-500 mt-1">{formatDate(z.created_at)}</div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <div className="font-medium text-gray-900">{z.name}</div>
                                <div className="text-xs text-gray-500 max-w-[150px] truncate">{z.email}</div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <Badge variant="outline" className="capitalize bg-white text-gray-700 border-gray-300 mb-1">{z.zakat_type}</Badge>
                                {z.zakat_type.toLowerCase().includes("fitrah") && (
                                    <div className="text-[10px] text-gray-500 font-medium mt-1">
                                        {z.total_people} Jiwa
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-5 align-top font-bold text-emerald-600 text-right whitespace-nowrap">
                                {formatCurrency(z.amount)}
                            </td>
                            <td className="px-6 py-5 align-top">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(z.status || 'pending')}`}>
                                    {getStatusIcon(z.status || 'pending')}
                                    {z.status || 'Pending'}
                                </span>
                            </td>
                            <td className="px-6 py-5 align-top text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => setSelectedZakat(z)}
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-auto px-2 text-xs border border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-600 gap-1">
                                                <ArrowUpDown className="h-3 w-3" />
                                                <span className="hidden sm:inline">Ubah</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onStatusChange(z.id, "success")} className="cursor-pointer text-emerald-600">
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Success
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onStatusChange(z.id, "pending")} className="cursor-pointer text-yellow-600">
                                                <Clock className="mr-2 h-4 w-4" /> Mark as Pending
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onStatusChange(z.id, "failed")} className="cursor-pointer text-red-600">
                                                <XCircle className="mr-2 h-4 w-4" /> Mark as Failed
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
              </div>
              
              {/* PAGINATION */}
              {filteredZakat.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50">
                    <p className="text-xs text-slate-500">
                        Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">{Math.min(indexOfLastItem, filteredZakat.length)}</span> dari <span className="font-medium">{filteredZakat.length}</span> transaksi
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                        <div className="text-xs font-medium bg-white border px-3 py-1.5 rounded">Halaman {currentPage}</div>
                        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* TAB 2: DISTRIBUSI (UPDATED: FEATURE 3) */}
          <TabsContent value="distribution">
            <div className="space-y-6">
                
                {/* BAGIAN ATAS: CONFIG & SALDO */}
                <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-emerald-600"/> Distribusi Zakat</CardTitle>
                            <CardDescription>Atur alokasi dan pantau sisa dana yang belum disalurkan.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {/* FEATURE 3: TOMBOL SALURKAN DANA */}

                            {isEditingDist ? (
                                <>
                                    <Button size="sm" variant="outline" onClick={() => setIsEditingDist(false)}>Batal</Button>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveDistribution}><Save className="h-4 w-4 mr-1" /> Simpan</Button>
                                </>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => setIsEditingDist(true)}><Edit className="h-4 w-4 mr-1" /> Ubah Alokasi</Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-emerald-600 font-medium">Saldo Zakat Tersedia (Verified)</p>
                            <p className="text-3xl font-bold text-emerald-800 mt-1">{formatCurrency(totalZakatPool)}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-gray-500 mb-1">Status Alokasi</p>
                            <Badge className={Math.abs(tempDistStats.reduce((acc, curr) => acc + curr.percentage, 0) - 100) < 0.1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                Total: {tempDistStats.reduce((acc, curr) => acc + curr.percentage, 0).toFixed(1)}%
                            </Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {tempDistStats.map((item, i) => (
                        <div key={item.id || i} className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-800 text-lg">{item.category}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {isEditingDist ? (
                                            <div className="relative"><Input type="number" className="w-20 h-8 text-right pr-6" value={item.percentage} onChange={(e) => handlePercentChange(i, e.target.value)} /><span className="absolute right-2 top-1.5 text-xs text-gray-500">%</span></div>
                                        ) : <Badge variant="outline" className="bg-white">{item.percentage}%</Badge>}
                                        <span className="text-xs text-gray-400">dari total dana</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-700 text-lg">{formatCurrency(item.amount)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Estimasi: {item.recipients} Penerima</p>
                                </div>
                            </div>
                            <Progress value={item.percentage} className={`h-2 ${item.color}`} />
                        </div>
                        ))}
                    </div>
                </CardContent>
                </Card>
            </div>
          </TabsContent>

          {/* TAB 3: REPORTS */}
          <TabsContent value="reports" className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={handleExportExcel} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition"><FileSpreadsheet className="h-6 w-6" /></div>
                        <Download className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 transition" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">Export Excel (CSV)</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Unduh data mentah transaksi zakat dalam format .csv.</p>
                        <span className="text-[10px] text-green-600 font-medium mt-3 block bg-green-50 w-fit px-2 py-1 rounded">{zakatList.length} Data Siap Unduh</span>
                    </div>
                </div>
                <div onClick={handleExportPDF} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition"><Printer className="h-6 w-6" /></div>
                        <Download className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 transition" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">Cetak Laporan PDF</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Dokumen resmi siap cetak (A4) dengan Kop Yayasan.</p>
                        <span className="text-[10px] text-red-600 font-medium mt-3 block bg-red-50 w-fit px-2 py-1 rounded">Format Laporan Keuangan</span>
                    </div>
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* =======================================
          MODALS
      ======================================= */}
      {isManualModalOpen && (
        <ManualZakatModal 
            isOpen={isManualModalOpen} 
            onClose={() => setIsManualModalOpen(false)} 
            onSuccess={() => {
                fetchData()
                fetchDistribution()
            }}
        />
      )}

      {selectedZakat && (
        <ZakatDetailModal 
            data={selectedZakat}
            onClose={() => setSelectedZakat(null)}
        />
      )}

      {isRecapModalOpen && (
        <DailyRecapModal 
            isOpen={isRecapModalOpen} 
            onClose={() => setIsRecapModalOpen(false)} 
            data={zakatList}
        />
      )}

    </div>
  )
}

/* ===================================================================================
   SUB-COMPONENT: DETAIL MODAL (POPUP + PRINT STRUK - FEATURE 1)
   =================================================================================== */
function ZakatDetailModal({ data, onClose }: { data: ZakatPayment; onClose: () => void }) {
    if (!data) return null;

    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
    
    // FEATURE 1: HANDLE PRINT STRUK
    const handlePrintReceipt = () => {
        const printWindow = window.open('', '', 'height=600,width=400');
        if (!printWindow) return toast.error("Pop-up diblokir");
    
        printWindow.document.write(`
            <html>
                <head>
                    <title>Kwitansi Zakat - #${data.id}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
                        .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                        .total { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; font-weight: bold; font-size: 14px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h3>MASJID AL-HUDA</h3>
                        <p>Tabanan, Bali</p>
                        <p>Tanda Terima Zakat</p>
                    </div>
                    <div class="content">
                        <div class="row"><span>Tanggal:</span> <span>${new Date(data.created_at).toLocaleDateString("id-ID")}</span></div>
                        <div class="row"><span>No. Ref:</span> <span>#${data.id}</span></div>
                        <div class="row"><span>Muzakki:</span> <span>${data.name}</span></div>
                        <div class="row"><span>Tipe:</span> <span>${data.zakat_type}</span></div>
                        ${data.zakat_type.toLowerCase().includes('fitrah') ? `<div class="row"><span>Jiwa:</span> <span>${data.total_people} Orang</span></div>` : ''}
                        <div class="total row">
                            <span>TOTAL:</span>
                            <span>${formatCurrency(data.amount)}</span>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Semoga Allah menerima amal ibadah Anda.<br/>Aamiin.</p>
                        <p><em>(Dokumen ini sah dicetak komputer)</em></p>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">Detail Transaksi</h2>
                            <Badge variant="outline" className="bg-white">{data.zakat_type}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">ID: #{data.id} • {new Date(data.created_at).toLocaleString("id-ID")}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition"><X className="h-5 w-5" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${data.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-700'}`}>
                        {data.status === 'success' ? <CheckCircle2 className="h-5 w-5"/> : <Clock className="h-5 w-5"/>}
                        <div>
                            <p className="font-bold text-sm uppercase">Status: {data.status}</p>
                            <p className="text-xs opacity-80">Total Nominal: {formatCurrency(data.amount)}</p>
                        </div>
                    </div>

                    {/* Identitas Muzakki */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <User className="h-4 w-4 text-emerald-600"/> Data Muzakki
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1"><Label className="text-slate-500 text-xs">Nama Lengkap</Label><p className="font-medium text-slate-900">{data.name}</p></div>
                            <div className="space-y-1"><Label className="text-slate-500 text-xs">Nomor Telepon</Label><div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400"/><p className="font-medium text-slate-900">{data.phone || "-"}</p></div></div>
                            <div className="col-span-2 space-y-1"><Label className="text-slate-500 text-xs">Alamat Email</Label><div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400"/><p className="font-medium text-slate-900">{data.email}</p></div></div>
                        </div>
                    </div>

                    {/* Detail Zakat */}
                    {data.zakat_type.toLowerCase().includes("fitrah") && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600"/> Rincian Jiwa
                            </h3>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                <div className="flex justify-between mb-2 pb-2 border-b border-slate-200"><span className="text-slate-500">Total Jiwa</span><span className="font-bold">{data.total_people} Orang</span></div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Nama Anggota Keluarga:</p>
                                    <ul className="list-disc ml-4 text-slate-700"><li>{data.name} (Kepala Keluarga)</li>{data.extra_names && data.extra_names.map((name, idx) => (<li key={idx}>{name}</li>))}</ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pesan / Doa */}
                    {data.message && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><Info className="h-4 w-4 text-purple-600"/> Catatan / Doa</h3>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">"{data.message}"</div>
                        </div>
                    )}
                </div>

                {/* Footer with Print Button */}
                <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
                    <Button onClick={handlePrintReceipt} variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-white hover:text-emerald-600">
                        <Receipt className="h-4 w-4" /> Cetak Kwitansi
                    </Button>
                    <Button onClick={onClose}>Tutup</Button>
                </div>
            </div>
        </div>
    )
}

/* ===================================================================================
   SUB-COMPONENT: MANUAL ZAKAT MODAL (SAME AS BEFORE)
   =================================================================================== */
function ManualZakatModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", amount: "0", zakat_type: "fitrah", people_count: "1", message: "" })
  const [extraNames, setExtraNames] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (formData.zakat_type === "fitrah") {
        const count = parseInt(formData.people_count) || 0
        setFormData(prev => ({ ...prev, amount: (count * 50000).toString() }))
        setExtraNames(prev => {
            const targetLen = Math.max(0, count - 1)
            if (prev.length === targetLen) return prev
            const newArr = [...prev]; if (newArr.length > targetLen) return newArr.slice(0, targetLen); while (newArr.length < targetLen) newArr.push(""); return newArr
        })
    }
  }, [formData.people_count, formData.zakat_type])

  const handleExtraNameChange = (index: number, val: string) => { const updated = [...extraNames]; updated[index] = val; setExtraNames(updated) }
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
        const payload = {
            name: formData.name || "Hamba Allah", email: formData.email || "manual@offline.trx", phone: formData.phone || "-", address: "-", 
            zakat_type: formData.zakat_type, total_people: formData.zakat_type === 'fitrah' ? parseInt(formData.people_count) : 0,
            amount: parseInt(formData.amount), message: formData.message, extra_names: extraNames.filter(n => n.trim() !== "") 
        }
        const res = await createZakatPayment(payload)
        if (res) { toast.success("Zakat manual berhasil dicatat!"); onSuccess(); onClose() }
    } catch (error) { toast.error("Gagal mencatat zakat.") } finally { setIsSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
                <div><h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-600" /> Catat Zakat Manual</h2></div>
                <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-1"><Label>Jenis Zakat</Label><Select value={formData.zakat_type} onValueChange={(val) => setFormData({...formData, zakat_type: val})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="fitrah">Zakat Fitrah</SelectItem><SelectItem value="maal">Zakat Maal</SelectItem><SelectItem value="infaq">Infaq</SelectItem></SelectContent></Select></div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 space-y-3">
                    {formData.zakat_type === 'fitrah' ? (
                        <div className="space-y-3">
                            <div className="space-y-1"><Label>Jumlah Jiwa</Label><Input type="number" min="1" value={formData.people_count} onChange={(e) => setFormData({...formData, people_count: e.target.value})} required /></div>
                            {parseInt(formData.people_count) > 1 && (<div className="space-y-2"><Label>Nama Keluarga Lainnya</Label>{extraNames.map((name, i) => (<Input key={i} placeholder={`Nama ke-${i + 2}`} value={name} onChange={(e) => handleExtraNameChange(i, e.target.value)} />))}</div>)}
                            <div className="flex justify-between text-sm text-emerald-700 font-bold"><span>Total:</span><span>Rp {parseInt(formData.amount).toLocaleString('id-ID')}</span></div>
                        </div>
                    ) : (<div className="space-y-1"><Label>Nominal (Rp)</Label><Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required /></div>)}
                </div>
                <div className="space-y-3"><div className="space-y-1"><Label>Nama Muzakki</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1"><Label>No. HP</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div><div className="space-y-1"><Label>Email</Label><Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div></div></div>
                <div className="space-y-1"><Label>Doa / Pesan</Label><Textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} /></div>
            </form>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={handleSubmit} className="bg-emerald-600 text-white" disabled={isSubmitting}>Simpan</Button></div>
        </div>
    </div>
  )
}

/* ===================================================================================
   SUB-COMPONENT: DAILY RECAP MODAL (SAME AS BEFORE)
   =================================================================================== */
function DailyRecapModal({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: ZakatPayment[] }) {
    if (!isOpen) return null;
    const today = new Date().toDateString();
    const todayData = data.filter(z => new Date(z.created_at).toDateString() === today && z.status === 'success');
    const totalMoney = todayData.reduce((sum, z) => sum + (z.amount || 0), 0);
    const totalJiwa = todayData.filter(z => z.zakat_type.toLowerCase().includes('fitrah')).reduce((sum, z) => sum + (z.total_people || 0), 0);
    const cashCount = todayData.filter(z => z.email === "manual@offline.trx" || z.phone === "-").length;
    const onlineCount = todayData.length - cashCount;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-emerald-600 text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2"><ClipboardList className="h-5 w-5"/> Rekap Harian</h2>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center"><p className="text-xs text-emerald-600 font-semibold uppercase">Total Uang Masuk</p><p className="text-3xl font-extrabold text-emerald-800">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalMoney)}</p></div>
                    <div className="grid grid-cols-2 gap-4"><div className="bg-blue-50 border border-blue-100 p-4 rounded-xl"><p className="text-xs text-blue-600 font-semibold">Total Jiwa</p><p className="text-2xl font-bold text-blue-800">{totalJiwa} Org</p></div><div className="bg-orange-50 border border-orange-100 p-4 rounded-xl"><p className="text-xs text-orange-600 font-semibold">Transaksi</p><p className="text-2xl font-bold text-orange-800">{todayData.length}</p></div></div>
                    <div className="space-y-2 text-sm text-slate-600 border-t pt-4"><div className="flex justify-between"><span>Manual (Tunai):</span><span className="font-medium">{cashCount}</span></div><div className="flex justify-between"><span>Online:</span><span className="font-medium">{onlineCount}</span></div></div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t flex justify-end"><Button onClick={onClose} className="bg-emerald-600 text-white">Tutup</Button></div>
            </div>
        </div>
    )
}