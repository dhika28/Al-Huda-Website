"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Coins, Search, TrendingUp, Users, Wallet, Calendar as CalendarIcon, Download,
  UserCheck,  Info, Save, Edit, FileSpreadsheet, Printer, X,
  CheckCircle2, Clock, XCircle, ArrowUpDown, FileText, Phone, Mail, User,
  ChevronLeft, ChevronRight, ClipboardList, Package, MinusCircle, Receipt, History,
  Activity, PieChart as PieIcon, Trash2, ArrowUpRight 
} from "lucide-react"
import { Toaster, toast } from "react-hot-toast"

// Library Grafik (Recharts) - Pastikan sudah install: npm install recharts
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


// Import API
import { 
    getAllZakat, 
    getZakatDistribution, 
    updateZakatDistribution, 
    createZakatPayment, 
    updateZakatStatus,
    ZakatDistributionItem,
    getDistributionLogs, // Import API Log
    createDistributionLog,
    deleteDistributionLog // Import API Log
} from "@/lib/api/zakat"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Warna Grafik
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

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

// Interface Log (untuk TypeScript)
interface DistributionLogItem {
    id: number
    distribution_date: string
    category_name?: string;
    amount: number
    used?: number;
    recipient_count: number
    notes: string
}

export default function AdminZakatPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") 
  const [zakatList, setZakatList] = useState<ZakatPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // DISTRIBUTION STATE
  const [distributionStats, setDistributionStats] = useState<ZakatDistributionItem[]>([])
  const [totalZakatPool, setTotalZakatPool] = useState(0)
  const [distributionHistory, setDistributionHistory] = useState<DistributionLogItem[]>([])

  // MODALS
  const [isEditingDist, setIsEditingDist] = useState(false)
  const [tempDistStats, setTempDistStats] = useState<ZakatDistributionItem[]>([])
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false)
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false) 
  const [selectedZakat, setSelectedZakat] = useState<ZakatPayment | null>(null)

  // STATE BARU: Untuk Modal Lihat Semua Riwayat
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  useEffect(() => { fetchData(); fetchDistribution() }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await getAllZakat()
      setZakatList(Array.isArray(data) ? data : [])
    } catch (error) { toast.error("Gagal memuat data zakat") } finally { setIsLoading(false) }
  }

  const fetchDistribution = async () => {
    try {
      const data = await getZakatDistribution()
      setDistributionStats(data.distribution)
      setTotalZakatPool(data.total_zakat)
      setTempDistStats(data.distribution)
      
      // Fetch Log Realisasi (Jika API sudah siap, uncomment baris bawah)
      const logs = await getDistributionLogs()
      setDistributionHistory(logs)
    } catch (err) { console.error(err) }
  }
// --- STATS LOGIC ---
  const totalDistributed = distributionStats.reduce((acc, curr) => acc + (curr.used || 0), 0);
  // --- TRANSFORMATION DATA UNTUK CHART (PENTING!) ---
  const trendData = useMemo(() => {
    if (!zakatList.length) return [];
    
    // 1. Filter hanya sukses
    const successTx = zakatList.filter(z => z.status === 'success');
    
    // 2. Group by Date
    const grouped: Record<string, number> = {};
    successTx.forEach(t => {
      // Ambil tanggal YYYY-MM-DD
      const dateKey = new Date(t.created_at).toISOString().split('T')[0];
      grouped[dateKey] = (grouped[dateKey] || 0) + t.amount;
    });

    // 3. Convert to Array & Sort
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort Ascending
  }, [zakatList]);

  const categoryData = useMemo(() => {
    if (!zakatList.length) return [];
    
    const successTx = zakatList.filter(z => z.status === 'success');
    const grouped: Record<string, number> = {};
    
    successTx.forEach(t => {
      const cat = t.zakat_type || "Lainnya";
      grouped[cat] = (grouped[cat] || 0) + t.amount;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .filter(i => i.value > 0);
  }, [zakatList]);

  // --- STATS LOGIC ---
  const totalZakatToday = zakatList.filter(z => new Date(z.created_at).toDateString() === new Date().toDateString() && z.status === 'success').reduce((sum, z) => sum + (z.amount || 0), 0)
  const totalMuzakki = new Set(zakatList.map(z => z.email)).size
  const totalFitrah = zakatList.filter(z => z.zakat_type?.toLowerCase().includes("fitrah") && z.status === 'success').reduce((sum, z) => sum + (z.amount || 0), 0)
  const estimatedRiceKg = (totalFitrah / 50000) * 2.5;
  const totalTransactions = zakatList.length
  const formatCurrency = (amount: number | string | (number | string)[] | undefined) => {
    let num = 0
    if (Array.isArray(amount)) {
      num = Number(amount[0]) || 0
    } else if (typeof amount === "number") {
      num = amount
    } else if (typeof amount === "string") {
      num = parseFloat(amount) || 0
    } else {
      num = 0
    }
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num)
  }
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })

  // --- FILTERING ---
  const filteredZakat = zakatList.filter(z => (z.name?.toLowerCase().includes(searchTerm.toLowerCase()) || z.email?.toLowerCase().includes(searchTerm.toLowerCase()) || z.zakat_type?.toLowerCase().includes(searchTerm.toLowerCase())) && (statusFilter === "all" || z.status === statusFilter))
  const totalPages = Math.ceil(filteredZakat.length / itemsPerPage);
  const currentItems = filteredZakat.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- HANDLERS ---
  const onStatusChange = async (id: number, newStatus: string) => {
    toast.promise(updateZakatStatus(id, newStatus).then(() => { setZakatList(prev => prev.map(z => z.id === id ? { ...z, status: newStatus } : z)); fetchDistribution() }), { loading: 'Updating...', success: <b>Status updated!</b>, error: <b>Failed.</b> });
  };
  const getStatusColor = (s?: string) => s === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : s === "failed" ? "bg-red-50 text-red-700 border-red-100" : "bg-yellow-50 text-yellow-700 border-yellow-100";
  const getStatusIcon = (s?: string) => s === "success" ? <CheckCircle2 className="w-3 h-3"/> : s === "failed" ? <XCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>;
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1) };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1) };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleFilterChange = (status: string) => { setStatusFilter(status); setCurrentPage(1); };

  // --- DISTRIBUTION HANDLERS ---
  const handlePercentChange = (index: number, val: string) => {
    const newVal = parseFloat(val) || 0
    const newStats = [...tempDistStats]
    newStats[index].percentage = newVal
    newStats[index].amount = (newVal / 100) * totalZakatPool
    setTempDistStats(newStats)
  }

  const handleSaveDistribution = async () => {
    const totalPct = tempDistStats.reduce((acc, curr) => acc + curr.percentage, 0)
    if (Math.abs(totalPct - 100) > 0.1) { toast.error(`Total harus 100%. Saat ini: ${totalPct.toFixed(1)}%`); return }
    try {
        const payload = tempDistStats.map(item => ({ id: item.id, percentage: item.percentage }))
        await updateZakatDistribution(payload)
        toast.success("Alokasi berhasil disimpan!")
        setIsEditingDist(false)
        fetchDistribution() 
    } catch { toast.error("Gagal menyimpan") }
  }

  // --- EXPORT HANDLERS ---
  const handleExportExcel = () => toast.success("Export Excel berhasil");
  const handleExportPDF = () => toast.success("Export PDF berhasil");

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-8 print:bg-white print:p-0 font-sans font-sans">
      <Toaster position="top-center" />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div><h2 className="text-4xl font-bold tracking-tight text-slate-900">Kelola Zakat</h2><p className="text-sm text-slate-500 mt-1">Pantau arus kas zakat, kelola distribusi, dan cetak laporan keuangan.</p></div>
        <div className="flex gap-3">
            <Button onClick={() => setIsManualModalOpen(true)} variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-slate-200"><Wallet className="mr-2 h-4 w-4" /> Catat Manual</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white" onClick={() => setIsRecapModalOpen(true)}><ClipboardList className="mr-2 h-4 w-4" /> Rekap Harian</Button>
        </div>
      </div>
      
      <div className="space-y-8 w-full"> 
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          {[{ title: "Zakat Hari Ini", val: formatCurrency(totalZakatToday), icon: <Coins className="h-5 w-5 text-emerald-600" />, sub: "Realtime (Sukses)", bg: "bg-emerald-50" }, { title: "Total Muzakki", val: totalMuzakki.toString(), icon: <Users className="h-5 w-5 text-blue-600" />, sub: "Unik (Email)", bg: "bg-blue-50" }, { title: "Total Fitrah", val: formatCurrency(totalFitrah), icon: <Package className="h-5 w-5 text-purple-600" />, sub: `Setara ± ${estimatedRiceKg.toLocaleString()} Kg Beras`, bg: "bg-purple-50" }, { title: "Transaksi", val: totalTransactions.toString(), icon: <UserCheck className="h-5 w-5 text-orange-600" />, sub: "Total Record", bg: "bg-orange-50" }].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition"><CardContent className="p-6"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-slate-500">{stat.title}</p><h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.val}</h3><p className="text-xs text-slate-400 mt-1">{stat.sub}</p></div><div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div></div></CardContent></Card>
          ))}
        </div>

        {/* TABS NAVIGATION */}
        <Tabs defaultValue="list" className="space-y-6 w-full">
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent h-auto p-0 gap-6 w-full justify-start">
              <TabsTrigger value="list" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Riwayat Transaksi</TabsTrigger>
              <TabsTrigger value="charts" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Analisa Grafik</TabsTrigger>
              <TabsTrigger value="distribution" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Penyaluran (Distribusi)</TabsTrigger>
              <TabsTrigger value="reports" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Laporan</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: LIST TRANSAKSI */}
          <TabsContent value="list" className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
               <div className="relative w-full sm:w-[350px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Cari muzakki..." className="pl-10 bg-gray-50 border-gray-200 w-full" value={searchTerm} onChange={handleSearchChange} /></div>
               <div className="flex flex-wrap gap-2">{['all', 'success', 'pending', 'failed'].map(s => (<Button key={s} variant="outline" size="sm" onClick={() => handleFilterChange(s)} className={`capitalize border h-9 ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>{s === 'all' ? 'All' : s}</Button>))}</div>
            </div>

            <Card className="border-b border-slate-200 pb-1 print:hidden overflow-hidden">
              <div className="overflow-x-auto w-full min-h-[400px]">
                {isLoading ? <div className="p-12 text-center text-gray-500">Memuat data...</div> : filteredZakat.length === 0 ? <div className="p-12 text-center text-gray-400">Tidak ada data.</div> : (
                    <table className="w-full text-sm text-left table-auto">
                    <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 uppercase text-xs font-semibold"><tr><th className="px-6 py-4">ID & Tanggal</th><th className="px-6 py-4">Muzakki</th><th className="px-6 py-4">Jenis</th><th className="px-6 py-4 text-right">Nominal</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">{currentItems.map((z) => (<tr key={z.id} className="hover:bg-slate-50/50 transition"><td className="px-6 py-5 align-top"><span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border">#{z.id}</span><div className="text-xs text-gray-500 mt-1">{formatDate(z.created_at)}</div></td><td className="px-6 py-5 align-top"><div className="font-medium text-gray-900">{z.name}</div><div className="text-xs text-gray-500 max-w-[150px] truncate">{z.email}</div></td><td className="px-6 py-5 align-top"><Badge variant="outline" className="capitalize bg-white text-gray-700 border-gray-300 mb-1">{z.zakat_type}</Badge></td><td className="px-6 py-5 align-top font-bold text-emerald-600 text-right">{formatCurrency(z.amount)}</td><td className="px-6 py-5 align-top"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(z.status)}`}>{getStatusIcon(z.status)}{z.status}</span></td><td className="px-6 py-5 align-top text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => setSelectedZakat(z)}><FileText className="h-4 w-4" /></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-auto px-2"><Edit className="h-3 w-3" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onStatusChange(z.id, "success")}>Success</DropdownMenuItem><DropdownMenuItem onClick={() => onStatusChange(z.id, "pending")}>Pending</DropdownMenuItem><DropdownMenuItem onClick={() => onStatusChange(z.id, "failed")}>Failed</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td></tr>))}</tbody></table>
                )}
              </div>
              {filteredZakat.length > 0 && (<div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50"><p className="text-xs text-slate-500">Hal {currentPage} dari {totalPages}</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button></div></div>)}
            </Card>
          </TabsContent>

          {/* TAB 2: ANALISA GRAFIK (INI YANG ANDA CARI) */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Grafik Tren Arus Kas */}
                <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-600"/><div><CardTitle>Tren Arus Kas (Harian)</CardTitle><CardDescription>Pemasukan zakat sukses per hari</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="h-[350px] p-4">
                        <div className="w-full h-full min-h-[300px]">
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" tickFormatter={(d) => d.substring(5)} fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                                        <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} fontSize={12} tickLine={false} axisLine={false}/>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(v) => formatCurrency(v)} labelFormatter={(l) => formatDate(l)}/>
                                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" name="Pemasukan"/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Activity className="h-12 w-12 mb-2 opacity-20"/>
                                    <p>Belum ada data visualisasi.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Grafik Sumber Dana (Pie Chart) */}
                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2"><PieIcon className="h-5 w-5 text-blue-600"/><div><CardTitle>Sumber Dana</CardTitle><CardDescription>Komposisi per tipe zakat</CardDescription></div></div>
                    </CardHeader>
                    <CardContent className="h-[350px] p-4">
                         <div className="w-full h-full min-h-[300px]">
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => formatCurrency(v)} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <PieIcon className="h-12 w-12 mb-2 opacity-20"/>
                                    <p>Belum ada data sumber dana.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
          </TabsContent>

{/* TAB 3: DISTRIBUSI & PENYALURAN (MODERN UI) */}
          <TabsContent value="distribution" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* KOLOM KIRI: ALOKASI DANA (2/3 Width) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-emerald-600"/> 
                                Alokasi Dana Zakat
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Manajemen pos anggaran berdasarkan kategori Asnaf (8 Golongan).
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {isEditingDist ? (
                                <>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingDist(false)} className="text-slate-500">Batal</Button>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6" onClick={handleSaveDistribution}>
                                        <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
                                    </Button>
                                </>
                            ) : (
                                <Button size="sm" variant="outline" className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => setIsEditingDist(true)}>
                                    <Edit className="h-4 w-4 mr-2" /> Atur Persentase
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Total Pool Banner */}
<div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-2xl shadow-lg text-white">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div><div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
                            <div className="flex flex-col md:flex-row gap-8 w-full">
                                {/* Total Terhimpun */}
                                <div>
                                    <p className="text-emerald-100 font-medium mb-1 flex items-center gap-2"><Wallet className="h-4 w-4"/> Total Dana Terhimpun</p>
                                    <h2 className="text-4xl font-extrabold tracking-tight">{formatCurrency(totalZakatPool)}</h2>
                                    <p className="text-xs text-emerald-200 mt-2 opacity-80">*Dana dialokasikan sesuai persentase.</p>
                                </div>
                                {/* Separator (Garis tipis di tengah) */}
                                <div className="hidden md:block w-px h-auto bg-emerald-400/30"></div>
                                {/* Total Disalurkan (NEW) */}
                                <div>
                                    <p className="text-emerald-100 font-medium mb-1 flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-orange-300"/> Total Tersalurkan</p>
                                    <h2 className="text-4xl font-extrabold tracking-tight text-orange-50">{formatCurrency(totalDistributed)}</h2>
                                    <p className="text-xs text-orange-200 mt-2 opacity-80">Realisasi ke mustahik.</p>
                                </div>
                            </div>
                            
                            {/* Counter Kategori */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center min-w-[140px]"><span className="block text-2xl font-bold">{tempDistStats.length}</span><span className="text-xs text-emerald-100">Kategori Asnaf</span></div>
                        </div>
                    </div>
                    {/* Grid Cards Asnaf */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {tempDistStats.map((item, i) => {
                            // Hitung realisasi
                            const budget = Number(item.amount) || 0;
// Casting (item as any) karena di interface awal mungkin belum ada 'used'/'remaining'
                            const usedAmount = Number((item as any).used) || 0; 
                            const remaining = Number((item as any).remaining) || 0;

                            // Hitung persentase
                            let percentage = 0;
                            if (budget > 0) {
                                percentage = (usedAmount / budget) * 100;
                            } else if (usedAmount > 0) {
                                percentage = 100;
                            }

                            return (
                                <div key={i} className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                    {/* Decorative header line */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${item.color?.replace('bg-', 'bg-') || 'bg-gray-200'}`}></div>
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{item.category}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                                                    Jatah: {item.percentage}%
                                                </Badge>
                                                {isEditingDist && (
                                                    <Input 
                                                        type="number" 
                                                        className="w-20 h-7 text-xs" 
                                                        value={item.percentage} 
                                                        onChange={(e) => handlePercentChange(i, e.target.value)} 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Pagu Anggaran</span>
                                            <p className="font-bold text-slate-700 text-lg">{formatCurrency(item.amount)}</p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="text-[10px] text-slate-500 mb-0.5">Tersalurkan</p>
                                            <p className="font-semibold text-slate-900">{formatCurrency(usedAmount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 mb-0.5">Sisa Dana</p>
                                            <p className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {formatCurrency(remaining)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-medium text-slate-500">
                                            <span>Progress Penyaluran</span>
                                            <span>{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`${item.color || 'bg-emerald-500'} h-full`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* KOLOM KANAN: ACTIONS & FEED (1/3 Width) */}
                <div className="space-y-6">
                    
                    {/* 1. Action Card (Tombol Salurkan) */}
                    <Card className="bg-white border-orange-100 shadow-sm overflow-hidden">
                        <div className="bg-orange-50/50 p-6 border-b border-orange-100">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                                <MinusCircle className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Salurkan Zakat</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                Catat pengeluaran dana kepada mustahik. Pastikan bukti penyaluran sudah siap.
                            </p>
                        </div>
                        <div className="p-4 bg-white">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6 shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5" onClick={() => setIsDistributeModalOpen(true)}>
                                Buat Penyaluran Baru
                            </Button>
                        </div>
                    </Card>

                    {/* 2. History Feed Card (Preview List) */}
                    <Card className="border border-slate-200 shadow-sm bg-white flex flex-col h-[500px]">
                        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                                    <History className="h-4 w-4 text-emerald-600"/> Aktivitas Terakhir
                                </CardTitle>
                                <Badge variant="outline" className="bg-white text-slate-500 font-normal">
                                    {distributionHistory.length} Transaksi
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 overflow-y-auto p-0">
                            {distributionHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                        <History className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <p className="text-sm">Belum ada riwayat penyaluran.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {/* HANYA TAMPILKAN 5 TERAKHIR DI SINI */}
                                    {distributionHistory.slice(0, 5).map((hist, idx) => ( 
                                        <div key={idx} className="p-4 hover:bg-slate-50 transition-colors group">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-bold tracking-wide text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {new Date(hist.distribution_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                    -{formatCurrency(hist.amount)}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800 mt-1">{hist.category_name}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                                                {hist.notes || "Tidak ada keterangan"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                                                <Users className="h-3 w-3"/> {hist.recipient_count} Penerima
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                            <Button 
                                variant="outline" 
                                className="w-full text-xs border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50" 
                                onClick={() => setIsHistoryModalOpen(true)} // <--- INI AKAN MEMBUKA POPUP
                            >
                                Lihat Semua Riwayat
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
          </TabsContent>

          {/* TAB 4: REPORTS */}
          <TabsContent value="reports" className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={handleExportExcel} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex flex-col justify-between h-48"><div className="flex justify-between items-start"><div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition"><FileSpreadsheet className="h-6 w-6" /></div><Download className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 transition" /></div><div><h4 className="font-semibold text-slate-900 text-lg">Export Excel (CSV)</h4><p className="text-xs text-slate-500 mt-1 leading-relaxed">Unduh data mentah transaksi zakat dalam format .csv.</p><span className="text-[10px] text-green-600 font-medium mt-3 block bg-green-50 w-fit px-2 py-1 rounded">{zakatList.length} Data Siap Unduh</span></div></div>
                <div onClick={handleExportPDF} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex flex-col justify-between h-48"><div className="flex justify-between items-start"><div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition"><Printer className="h-6 w-6" /></div><Download className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 transition" /></div><div><h4 className="font-semibold text-slate-900 text-lg">Cetak Laporan PDF</h4><p className="text-xs text-slate-500 mt-1 leading-relaxed">Dokumen resmi siap cetak (A4) dengan Kop Yayasan.</p><span className="text-[10px] text-red-600 font-medium mt-3 block bg-red-50 w-fit px-2 py-1 rounded">Format Laporan Keuangan</span></div></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= MODAL SALURKAN DANA (BARU) ================= */}
      <DistributeFundModal 
        isOpen={isDistributeModalOpen} 
        onClose={() => setIsDistributeModalOpen(false)}
        categoriesData={tempDistStats} // <--- GANTI JADI INI (Kirim Data Lengkap)
        onSuccess={() => {
            fetchDistribution() // Refresh saldo
        }}
        />
      {/* MODAL LIHAT SEMUA RIWAYAT */}
      <HistoryListModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        data={distributionHistory}
        refreshData={fetchDistribution}
      />

      {/* ... Modal Lainnya ... */}
      {isManualModalOpen && (
        <ManualZakatModal 
            isOpen={isManualModalOpen} 
            onClose={() => setIsManualModalOpen(false)} 
            onSuccess={() => { fetchData(); fetchDistribution() }}
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
   SUB-COMPONENT: MODAL SALURKAN DANA (NEW)
   =================================================================================== */
function DistributeFundModal({ 
    isOpen, 
    onClose, 
    categoriesData, // Pastikan nama props ini categoriesData
    onSuccess 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    categoriesData: ZakatDistributionItem[], // Definisi tipe agar TS tahu isinya object
    onSuccess: (data: any) => void 
}) {
    // PERBAIKAN 1: Nama state disamakan jadi 'category_name'
    const [formData, setFormData] = useState({ 
        category_name: "", 
        recipient_count: "", 
        amount_per_person: "", 
        total_amount: 0, 
        notes: "", 
        distribution_type: "tunai" 
    })
    
    // Auto hitung total
    useEffect(() => {
        const count = parseInt(formData.recipient_count) || 0
        const perPerson = parseFloat(formData.amount_per_person) || 0
        setFormData(prev => ({ ...prev, total_amount: count * perPerson }))
    }, [formData.recipient_count, formData.amount_per_person])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // PERBAIKAN 2: Cari object kategori berdasarkan nama yang dipilih
        // TypeScript tidak akan error lagi karena categoriesData sudah didefinisikan sebagai array object
        const selectedCat = categoriesData.find(c => c.category === formData.category_name)
        
        if (!selectedCat) {
            toast.error("Pilih kategori yang valid")
            return
        }

        toast.promise(
            createDistributionLog({
                distribution_setting_id: selectedCat.id, // ID diambil dari hasil pencarian
                amount: formData.total_amount,
                recipient_count: parseInt(formData.recipient_count),
                notes: formData.notes,
                distribution_type: formData.distribution_type
            }),
            { loading: 'Menyimpan...', success: 'Berhasil!', error: 'Gagal.' }
        ).then(() => { 
            onSuccess(null)
            onClose() 
        }).catch(err => console.error(err))
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col z-[1000]">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-orange-50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2"><MinusCircle className="h-5 w-5" /> Salurkan Zakat</h2>
                    <button onClick={onClose}><X className="h-5 w-5 text-orange-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <Label>Kategori Ashnaf</Label>
                        {/* PERBAIKAN 3: Select menyimpan value ke 'category_name' */}
                        <Select onValueChange={(val) => setFormData({...formData, category_name: val})} required>
                            <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                            <SelectContent className="z-[1001] bg-white shadow-xl border">
                                {categoriesData.map(c => (
                                    <SelectItem key={c.id} value={c.category}>{c.category}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Penerima (Org)</Label><Input type="number" onChange={e => setFormData({...formData, recipient_count: e.target.value})} required/></div>
                        <div><Label>Nominal/Org</Label><Input type="number" onChange={e => setFormData({...formData, amount_per_person: e.target.value})} required/></div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Total:</span>
                        <span className="text-xl font-bold text-orange-600">Rp {formData.total_amount.toLocaleString('id-ID')}</span>
                    </div>
                    <div><Label>Keterangan</Label><Textarea onChange={e => setFormData({...formData, notes: e.target.value})} required/></div>
                    <div className="pt-2 flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" className="bg-orange-600 text-white">Simpan</Button>
                    </div>
                </form>
            </div>
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

/* ===================================================================================
   SUB-COMPONENT: HISTORY LIST MODAL (FULL TABLE)
   =================================================================================== */
/* ===================================================================================
   SUB-COMPONENT: HISTORY LIST MODAL (FULL TABLE)
   =================================================================================== */
function HistoryListModal({ isOpen, onClose, data, refreshData }: { isOpen: boolean, onClose: () => void, data: DistributionLogItem[], refreshData: () => void }) {
    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // 1. Fungsi Eksekusi API Delete (Jalan kalau user klik 'Ya, Hapus' di toast)
    const executeDelete = async (id: number) => {
        setIsDeleting(id);
        try {
            await deleteDistributionLog(id);
            toast.success("Data berhasil dihapus");
            refreshData(); 
        } catch (error) {
            toast.error("Gagal menghapus data");
        } finally {
            setIsDeleting(null);
        }
    }

    // 2. Fungsi Pemicu Toast Konfirmasi
    const handleDelete = (id: number) => {
        toast((t) => (
            <div className="flex flex-col gap-2 min-w-[200px]">
                <div>
                    <p className="font-bold text-slate-800 text-sm">Hapus Data Penyaluran?</p>
                    <p className="text-xs text-slate-500 mt-1">Data yang dihapus tidak bisa dikembalikan.</p>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs px-3" 
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Batal
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-8 text-xs px-3 bg-red-600 hover:bg-red-700 text-white border-none" 
                        onClick={() => {
                            toast.dismiss(t.id); // Tutup toast
                            executeDelete(id);   // Jalankan hapus
                        }}
                    >
                        Ya, Hapus
                    </Button>
                </div>
            </div>
        ), { 
            duration: 5000, 
            position: "top-center",
            style: { 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '16px',
                borderRadius: '12px'
            } 
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg"><History className="h-5 w-5 text-orange-600" /></div>
                        <div>
                            <DialogTitle>Riwayat Penyaluran Zakat</DialogTitle>
                            <DialogDescription>Log lengkap pengeluaran dana kepada mustahik.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto p-6">
                    {data.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">Belum ada data.</div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                                    <tr>
                                        <th className="px-4 py-3">Tanggal</th>
                                        <th className="px-4 py-3">Kategori</th>
                                        <th className="px-4 py-3">Keterangan</th>
                                        <th className="px-4 py-3 text-center">Penerima</th>
                                        <th className="px-4 py-3 text-right">Jumlah</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 group">
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                                {new Date(log.distribution_date).toLocaleDateString("id-ID", { day:'numeric', month:'long', year:'numeric'})}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                <Badge variant="outline" className="bg-slate-50">{log.category_name}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={log.notes}>
                                                {log.notes}
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-500">
                                                {log.recipient_count}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-red-600">
                                                -{formatCurrency(log.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(log.id)}
                                                    disabled={isDeleting === log.id}
                                                >
                                                    {isDeleting === log.id ? (
                                                        <div className="animate-spin h-3 w-3 border-2 border-red-600 rounded-full border-t-transparent"></div>
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
                    <p className="text-xs text-slate-500">Menampilkan {data.length} transaksi</p>
                    <Button onClick={onClose} variant="outline">Tutup</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

