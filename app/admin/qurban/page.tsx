"use client"

import { useState, useEffect } from "react"
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
  Printer, 
  FileText, 
  Truck, 
  Wallet,
  X,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MinusCircle,
  CheckCircle2,
  Receipt, 
  TrendingDown, 
  TrendingUp, 
  DollarSign,
  Pencil,
  FileSpreadsheet, // Icon baru untuk Excel
  User,
  Phone,
  Mail,
  Info
} from "lucide-react"
import { Toaster, toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog" 

// Import API
import { 
    getQurbanPackages, 
    getAllQurbanRegistrations, 
    createQurbanRegistration,
    createQurbanPackage,
    updateQurbanPackage,
    deleteQurbanPackage,
    updateQurbanStatus,
    getQurbanExpenses,
    createQurbanExpense,
    updateQurbanExpense, 
    deleteQurbanExpense
} from "@/lib/api/qurban" 

// --- TYPES ---
export interface QurbanPackage {
    id: number
    name: string
    price: number
    weight: number
    participants: number
    description: string
    features: string[]
    type?: 'kambing' | 'sapi' 
}

export interface QurbanRegistration {
    id: number
    user_id?: number
    package_id: number
    name: string
    phone: string
    email: string
    address: string
    participant_count: number
    extra_names: string[]
    notes: string
    created_at: string
    status: string 
    package_name?: string
    amount?: number
}

export interface QurbanExpense {
    id: number
    category: string
    description: string
    amount: number
    date: string
    pic: string
    created_at?: string
}

export default function AdminQurbanPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Data State
  const [packages, setPackages] = useState<QurbanPackage[]>([])
  const [registrations, setRegistrations] = useState<QurbanRegistration[]>([])
  const [expenses, setExpenses] = useState<QurbanExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedReg, setSelectedReg] = useState<QurbanRegistration | null>(null)
  
  // CRUD Expense State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<QurbanExpense | null>(null)
  
  // CRUD Package State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<QurbanPackage | null>(null)

  // Load Data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
        const [pkgData, regData, expData] = await Promise.all([
            getQurbanPackages(),
            getAllQurbanRegistrations(),
            getQurbanExpenses()
        ])

        const mappedPackages = (pkgData || []).map((p: any) => ({
            ...p,
            price: Number(p.price),
            weight: Number(p.weight),
            participants: Number(p.participants),
            type: p.name?.toLowerCase().includes('sapi') ? 'sapi' : 'kambing' as 'sapi' | 'kambing'
        })) as QurbanPackage[]
        
        setPackages(mappedPackages)
        setRegistrations(regData || [])
        setExpenses(expData || [])

    } catch (error) {
        console.error("Fetch error:", error)
        toast.error("Gagal memuat data dari server")
    } finally {
        setIsLoading(false)
    }
  }

  // --- CRUD PACKAGES HANDLERS ---
  const handleSavePackage = async (data: Partial<QurbanPackage>) => {
      setIsLoading(true) 
      try {
          const payload = {
              ...data,
              weight: Number(data.weight),
              price: Number(data.price),
              participants: Number(data.participants),
              features: data.features || []
          }

          if (editingPackage) {
              await updateQurbanPackage(editingPackage.id, payload as any)
              toast.success("Paket berhasil diperbarui")
          } else {
              await createQurbanPackage(payload as any)
              toast.success("Paket berhasil ditambahkan")
          }
          
          await fetchData() 
          setIsPackageModalOpen(false)
          setEditingPackage(null)
      } catch (error) {
          console.error(error)
          toast.error("Gagal menyimpan paket")
      } finally {
          setIsLoading(false)
      }
  }

  const handleDeletePackage = (id: number) => {
      toast((t) => (
        <div className="flex flex-col gap-2 p-1">
          <div className="font-semibold text-sm text-gray-900">Hapus paket hewan ini?</div>
          <div className="text-xs text-gray-500">Data yang dihapus tidak dapat dikembalikan.</div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">Batal</button>
            <button onClick={async () => {
                toast.dismiss(t.id);
                setIsLoading(true);
                try { 
                    await deleteQurbanPackage(id); 
                    toast.success("Paket berhasil dihapus"); 
                    await fetchData();
                } 
                catch(e) { 
                    toast.error("Gagal menghapus paket"); 
                } finally {
                    setIsLoading(false);
                }
              }} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition">Ya, Hapus</button>
          </div>
        </div>
      ), { duration: 5000, style: { minWidth: '300px', border: '1px solid #eee' } });
  }

  // --- REGISTRATION STATUS HANDLER ---
  const handleUpdateRegStatus = async (id: number, status: string) => {
      try {
          await updateQurbanStatus(id, status)
          toast.success("Status diperbarui")
          setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
          fetchData()
      } catch (error) {
          toast.error("Gagal update status")
      }
  }

  // --- CRUD EXPENSE HANDLER ---
  const handleSaveExpense = async (data: any) => {
      setIsLoading(true)
      try {
          const payload = {
              ...data,
              amount: Number(data.amount)
          }

          if (editingExpense) {
              await updateQurbanExpense(editingExpense.id, payload)
              toast.success("Pengeluaran berhasil diperbarui")
          } else {
              await createQurbanExpense(payload)
              toast.success("Pengeluaran berhasil dicatat")
          }
          
          await fetchData() 
          setIsExpenseModalOpen(false)
          setEditingExpense(null)
      } catch (error) {
          console.error(error)
          toast.error("Gagal menyimpan data pengeluaran")
      } finally {
          setIsLoading(false)
      }
  }

  const handleDeleteExpense = (id: number) => {
      toast((t) => (
        <div className="flex flex-col gap-2 p-1">
          <div className="font-semibold text-sm text-gray-900">Hapus pengeluaran ini?</div>
          <div className="text-xs text-gray-500">Data yang dihapus tidak dapat dikembalikan.</div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">Batal</button>
            <button onClick={async () => {
                toast.dismiss(t.id);
                setIsLoading(true);
                try { 
                    await deleteQurbanExpense(id); 
                    toast.success("Data berhasil dihapus"); 
                    await fetchData();
                } 
                catch(e) { 
                    toast.error("Gagal menghapus data"); 
                } finally {
                    setIsLoading(false);
                }
              }} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition">Ya, Hapus</button>
          </div>
        </div>
      ), { duration: 5000, style: { minWidth: '300px', border: '1px solid #eee' } });
  }

  const openAddExpenseModal = () => {
      setEditingExpense(null)
      setIsExpenseModalOpen(true)
  }

  const openEditExpenseModal = (expense: QurbanExpense) => {
      setEditingExpense(expense)
      setIsExpenseModalOpen(true)
  }

  // --- STATS CALCULATION ---
  const totalPendaftar = registrations.length
  
  const totalDanaMasuk = registrations
    .filter(r => r.status === 'paid' || r.status === 'Success')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0)

  const totalPengeluaran = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  const sisaSaldo = totalDanaMasuk - totalPengeluaran

  const formatCurrency = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "canceled": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "paid": return <CheckCircle2 className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      case "canceled": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // --- REPORT HANDLERS ---
  const handleExportExcel = () => {
    if (registrations.length === 0) return toast.error("Tidak ada data pendaftaran.");
    try {
        const headers = ["ID", "Tanggal", "Nama Pendaftar", "No HP", "Paket", "Jml Peserta", "Total Bayar", "Status", "Nama Peserta"];
        const rows = registrations.map(r => [
            r.id, 
            r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : "-", 
            `"${r.name}"`, 
            `'${r.phone}`, 
            r.package_name, 
            r.participant_count, 
            r.amount, 
            r.status,
            `"${r.extra_names?.join(', ') || ''}"`
        ]);
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Data_Pendaftar_Qurban_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        toast.success("Data Excel berhasil diunduh!");
    } catch (error) { toast.error("Gagal mengunduh laporan."); }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) return toast.error("Pop-up diblokir browser.");

    const htmlContent = `
      <html>
        <head>
          <title>Laporan Keuangan Qurban</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 5px 0 0; font-size: 14px; }
            h2 { text-align: center; text-decoration: underline; margin-bottom: 20px; font-size: 18px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
            th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
            .amount { text-align: right; }
            
            .section-title { font-weight: bold; margin-top: 30px; font-size: 14px; }
            .summary-box { margin-top: 30px; border: 1px solid #000; padding: 15px; width: 60%; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .summary-row.total { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; margin-top: 5px; }
            
            .footer { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sign { text-align: center; width: 200px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MASJID AL-HUDA TABANAN</h1>
            <p>Jl. Mawar No. 12, Tabanan, Bali | Telp: (0361) 123456</p>
          </div>

          <h2>LAPORAN KEUANGAN QURBAN</h2>
          <p>Periode: Idul Adha 1446 H / 2025 M</p>

          <div class="section-title">I. PEMASUKAN (Shohibul Qurban)</div>
          <table>
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="15%">Tanggal</th>
                <th>Nama Pendaftar</th>
                <th width="20%">Paket</th>
                <th width="10%">Status</th>
                <th width="20%">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${registrations.filter(r => r.status === 'paid' || r.status === 'Success').map((r, i) => `
                <tr>
                  <td style="text-align:center">${i+1}</td>
                  <td>${new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                  <td>${r.name}</td>
                  <td>${r.package_name}</td>
                  <td style="text-align:center">${r.status}</td>
                  <td class="amount">${formatCurrency(r.amount || 0)}</td>
                </tr>
              `).join('')}
              <tr style="font-weight:bold; background-color:#f9f9f9;">
                <td colspan="5" style="text-align:right">TOTAL PEMASUKAN</td>
                <td class="amount">${formatCurrency(totalDanaMasuk)}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">II. PENGELUARAN (Biaya Operasional)</div>
          <table>
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="15%">Tanggal</th>
                <th width="15%">Kategori</th>
                <th>Keterangan</th>
                <th width="20%">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.length === 0 ? '<tr><td colspan="5" style="text-align:center">Belum ada pengeluaran.</td></tr>' : 
                expenses.map((e, i) => `
                <tr>
                  <td style="text-align:center">${i+1}</td>
                  <td>${new Date(e.date).toLocaleDateString('id-ID')}</td>
                  <td>${e.category}</td>
                  <td>${e.description}</td>
                  <td class="amount">${formatCurrency(Number(e.amount))}</td>
                </tr>
              `).join('')}
              <tr style="font-weight:bold; background-color:#f9f9f9;">
                <td colspan="4" style="text-align:right">TOTAL PENGELUARAN</td>
                <td class="amount">${formatCurrency(totalPengeluaran)}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-row"><span>Total Pemasukan</span><span>${formatCurrency(totalDanaMasuk)}</span></div>
            <div class="summary-row"><span>Total Pengeluaran</span><span>(${formatCurrency(totalPengeluaran)})</span></div>
            <div class="summary-row total"><span>SISA SALDO (KAS)</span><span>${formatCurrency(sisaSaldo)}</span></div>
          </div>

          <div class="footer">
            <div class="sign">
              <p>Mengetahui,<br/>Ketua Panitia</p>
              <br/><br/><br/>
              <p>( ........................... )</p>
            </div>
            <div class="sign">
              <p>Tabanan, ${new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}<br/>Bendahara</p>
              <br/><br/><br/>
              <p>( ........................... )</p>
            </div>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent); printWindow.document.close();
  };

  // Filter Data
  const filteredRegs = registrations.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.package_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchStatus = statusFilter === "all" || r.status === statusFilter
      return matchSearch && matchStatus
  })

  // Pagination Variables
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRegs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRegs.length / itemsPerPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-8 print:bg-white print:p-0">
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Manajemen Qurban</h2>
          <p className="text-sm text-slate-500 mt-1">Sistem administrasi pendaftaran dan keuangan operasional panitia.</p>
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
        </div>
      </div>

      <div className="space-y-8 w-full"> 
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          {[
            { title: "Total Dana Masuk", val: formatCurrency(totalDanaMasuk), icon: <Wallet className="h-5 w-5 text-emerald-600" />, sub: "Status Lunas (Paid)", bg: "bg-emerald-50" },
            { title: "Pengeluaran Ops", val: formatCurrency(totalPengeluaran), icon: <TrendingDown className="h-5 w-5 text-red-600" />, sub: "Jasa & Logistik", bg: "bg-red-50" },
            { title: "Sisa Saldo", val: formatCurrency(sisaSaldo), icon: <DollarSign className="h-5 w-5 text-blue-600" />, sub: "Dana Tersedia", bg: "bg-blue-50" },
            { title: "Total Shohibul", val: totalPendaftar.toString(), icon: <Users className="h-5 w-5 text-purple-600" />, sub: "Orang Terdaftar", bg: "bg-purple-50" }
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
        <Tabs defaultValue="registrations" className="space-y-6 w-full">
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent h-auto p-0 gap-6 w-full justify-start">
              <TabsTrigger value="registrations" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Data Pendaftar</TabsTrigger>
              <TabsTrigger value="packages" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Paket Hewan</TabsTrigger>
              <TabsTrigger value="expenses" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Biaya Operasional</TabsTrigger>
              {/* NEW TAB REPORT */}
              <TabsTrigger value="reports" className="px-0 py-3 text-sm font-medium text-gray-500 data-[state=active]:text-emerald-600 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none">Laporan</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: LIST PENDAFTARAN */}
          <TabsContent value="registrations" className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
               <div className="relative w-full sm:w-[350px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Cari nama, email, atau ID..." 
                    className="pl-10 bg-gray-50 border-gray-200 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>

               <div className="flex flex-wrap gap-2">
                    {['all', 'paid', 'pending', 'canceled'].map(s => (
                        <Button 
                            key={s} 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setStatusFilter(s)}
                            className={`capitalize border h-9 ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}
                        >
                            {s === 'all' ? 'all' : s}
                        </Button>
                    ))}
               </div>
            </div>

            <Card className="border-b border-slate-200 pb-1 print:hidden overflow-hidden">
              <div className="overflow-x-auto w-full min-h-[400px]">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Memuat data qurban...</div>
                ) : filteredRegs.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">Tidak ada data ditemukan.</div>
                ) : (
                    <table className="w-full text-sm text-left table-auto">
                    <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 uppercase text-xs font-semibold">
                        <tr>
                        <th className="px-6 py-4 whitespace-nowrap">ID & Tanggal</th>
                        <th className="px-6 py-4 whitespace-nowrap">Shohibul Qurban</th>
                        <th className="px-6 py-4 whitespace-nowrap">Paket Hewan</th>
                        <th className="px-6 py-4 text-right whitespace-nowrap">Nominal</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-right whitespace-nowrap">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentItems.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-5 align-top whitespace-nowrap">
                                <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border">#{reg.id}</span>
                                <div className="text-xs text-gray-500 mt-1">{formatDate(reg.created_at)}</div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <div className="font-medium text-gray-900">{reg.name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                                    <span className="font-medium text-slate-600">Atas Nama:</span>
                                    {reg.extra_names?.[0]} {reg.extra_names?.length > 1 ? `+${reg.extra_names.length - 1} lainnya` : ''}
                                </div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <Badge variant="outline" className="capitalize bg-white text-gray-700 border-gray-300 mb-1">{reg.package_name || `Paket #${reg.package_id}`}</Badge>
                                <div className="text-[10px] text-gray-500 font-medium mt-1">
                                    {reg.participant_count} Jiwa
                                </div>
                            </td>
                            <td className="px-6 py-5 align-top font-bold text-emerald-600 text-right whitespace-nowrap">
                                {formatCurrency(reg.amount || 0)}
                            </td>
                            <td className="px-6 py-5 align-top">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadge(reg.status)}`}>
                                    {getStatusIcon(reg.status)}
                                    {reg.status || 'Pending'}
                                </span>
                            </td>
                            <td className="px-6 py-5 align-top text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => { setSelectedReg(reg); setIsDetailModalOpen(true); }}
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-auto px-2 text-xs border border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-600 gap-1">
                                                <Edit className="h-3 w-3" />
                                                <span className="hidden sm:inline">Status</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleUpdateRegStatus(reg.id, "paid")} className="cursor-pointer text-emerald-600 focus:bg-emerald-50">
                                                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateRegStatus(reg.id, "pending")} className="cursor-pointer text-yellow-600 focus:bg-yellow-50">
                                                <Clock className="mr-2 h-4 w-4" /> Mark as Pending
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUpdateRegStatus(reg.id, "canceled")} className="cursor-pointer text-red-600 focus:bg-red-50">
                                                <XCircle className="mr-2 h-4 w-4" /> Mark as Cancel
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
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50">
                    <p className="text-xs text-slate-500">
                        Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">{Math.min(indexOfLastItem, filteredRegs.length)}</span> dari <span className="font-medium">{filteredRegs.length}</span> transaksi
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                        <div className="text-xs font-medium bg-white border px-3 py-1.5 rounded">Halaman {currentPage}</div>
                        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </Card>
          </TabsContent>

          {/* TAB 2: PAKET HEWAN (CRUD) */}
          <TabsContent value="packages" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Beef className="h-5 w-5 text-emerald-600"/> Konfigurasi Paket Qurban</CardTitle>
                        <CardDescription>Kelola harga, berat, dan jenis hewan qurban yang tersedia.</CardDescription>
                    </div>
                    <Button onClick={() => { setEditingPackage(null); setIsPackageModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Paket
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? <p className="text-center py-8 text-gray-500">Memuat paket...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                        <div key={pkg.id} className="group relative border rounded-xl p-5 hover:shadow-md transition bg-white">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" onClick={() => { setEditingPackage(pkg); setIsPackageModalOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeletePackage(pkg.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                            
                            <div className="flex justify-between items-start mb-3">
                                <Badge className={pkg.name.toLowerCase().includes('sapi') ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}>
                                    {pkg.name.toLowerCase().includes('sapi') ? 'Sapi' : 'Kambing'}
                                </Badge>
                            </div>
                            
                            <h4 className="font-bold text-gray-900 text-lg mb-1">{pkg.name}</h4>
                            <p className="font-bold text-emerald-600 text-xl mb-4">{formatCurrency(pkg.price)}</p>
                            
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">{pkg.description}</p>
                            
                            <div className="flex justify-between text-xs text-gray-500 border-t pt-3">
                                <div className="flex items-center gap-1"><Package className="h-3 w-3"/> Berat: ±{pkg.weight} kg</div>
                                <div className="flex items-center gap-1"><Users className="h-3 w-3"/> Max: {pkg.participants} orang</div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: BIAYA OPERASIONAL (CRUD COMPLETED) */}
          <TabsContent value="expenses" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-emerald-600"/> Rekap Pengeluaran</CardTitle>
                        <CardDescription>Catat biaya jagal, operasional, dan logistik panitia.</CardDescription>
                    </div>
                    <Button onClick={openAddExpenseModal} className="bg-red-600 hover:bg-red-700 text-white">
                        <TrendingDown className="mr-2 h-4 w-4" /> Catat Pengeluaran
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Keterangan</th>
                                    <th className="px-6 py-4">PIC</th>
                                    <th className="px-6 py-4 text-right">Nominal</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada pengeluaran tercatat</td></tr>
                                ) : expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">{formatDate(exp.date)}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`
                                                ${exp.category === 'Jasa' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                  exp.category === 'Logistik' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                                  'bg-gray-50 text-gray-700 border-gray-200'}
                                            `}>
                                                {exp.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{exp.description}</td>
                                        <td className="px-6 py-4 text-slate-500">{exp.pic}</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600">-{formatCurrency(Number(exp.amount))}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => openEditExpenseModal(exp)}
                                                >
                                                    <Pencil className="h-4 w-4"/>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteExpense(exp.id)}
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* TOTAL ROW */}
                                <tr className="bg-slate-50 border-t-2 border-slate-100">
                                    <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-700">Total Pengeluaran:</td>
                                    <td className="px-6 py-4 text-right font-bold text-red-700">{formatCurrency(totalPengeluaran)}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: LAPORAN (REPORT) - BARU */}
          <TabsContent value="reports" className="mt-4 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CARD EXCEL */}
                <div onClick={handleExportExcel} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <Download className="h-5 w-5 text-slate-300 group-hover:text-green-600 transition-colors" />
                    </div>
                    <div>
                    <h4 className="font-semibold text-slate-900 text-lg">Export Excel (CSV)</h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">Unduh data mentah transaksi qurban dalam format .csv untuk diolah lebih lanjut.</p>
                    <span className="text-xs text-green-700 font-medium mt-4 block bg-green-50 w-fit px-2 py-1 rounded border border-green-100">
                        {registrations.length} Data Siap Unduh
                    </span>
                    </div>
                </div>

                {/* CARD PDF */}
                <div onClick={handleExportPDF} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Printer className="h-6 w-6" />
                        </div>
                        <Download className="h-5 w-5 text-slate-300 group-hover:text-red-600 transition-colors" />
                    </div>
                    <div>
                    <h4 className="font-semibold text-slate-900 text-lg">Cetak Laporan PDF</h4>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">Laporan keuangan lengkap (Pemasukan vs Pengeluaran) dengan Kop Surat Resmi.</p>
                    <span className="text-xs text-red-700 font-medium mt-4 block bg-red-50 w-fit px-2 py-1 rounded border border-red-100">
                        Format Laporan Pertanggungjawaban
                    </span>
                    </div>
                </div>

            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. MANUAL REGISTRATION MODAL */}
      <ManualQurbanModal 
          isOpen={isManualModalOpen} 
          onClose={() => setIsManualModalOpen(false)} 
          packages={packages}
          onSuccess={() => { fetchData(); }}
      />

      {/* 2. DETAIL & CETAK KWITANSI MODAL */}
      <DetailQurbanModal 
          data={selectedReg} 
          isOpen={isDetailModalOpen}
          onClose={() => { setIsDetailModalOpen(false); setSelectedReg(null); }} 
      />

      {/* 3. CRUD PACKAGE MODAL */}
      <PackageFormModal 
         isOpen={isPackageModalOpen}
         onClose={() => setIsPackageModalOpen(false)} 
         initialData={editingPackage}
         onSave={handleSavePackage}
      />
      
       {/* 4. EXPENSE MODAL (CREATE & EDIT) */}
       <ExpenseFormModal 
          isOpen={isExpenseModalOpen} 
          onClose={() => setIsExpenseModalOpen(false)} 
          onSave={handleSaveExpense} 
          initialData={editingExpense} // Pass initial data for editing
       />

    </div>
  )
}

/* ===================================================================================
   SUB-COMPONENTS (MODALS & CARDS)
   =================================================================================== */

// FORM INPUT PENGELUARAN (UPDATED FOR EDIT)
function ExpenseFormModal({ isOpen, onClose, onSave, initialData }: any) {
    const defaultData = {
        category: "Logistik",
        description: "",
        amount: "",
        pic: "",
        date: new Date().toISOString().split('T')[0]
    }
    
    const [formData, setFormData] = useState(defaultData)

    // Populate form if initialData exists (Edit Mode)
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                amount: initialData.amount.toString(), // Convert number to string for input
                date: initialData.date.split('T')[0] // Ensure date format
            })
        } else {
            setFormData(defaultData)
        }
    }, [initialData, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
        // Reset hanya jika tidak dalam mode edit (atau biarkan parent close modal)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Pengeluaran" : "Catat Biaya Operasional"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Perbarui data pengeluaran yang dipilih." : "Input pengeluaran dana operasional panitia."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label>Kategori Pengeluaran</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Jasa">Jasa (Jagal/Kebersihan)</SelectItem>
                                <SelectItem value="Logistik">Logistik (Plastik/Alat)</SelectItem>
                                <SelectItem value="Konsumsi">Konsumsi Panitia</SelectItem>
                                <SelectItem value="Transportasi">Transportasi/Sewa</SelectItem>
                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Keterangan</Label>
                        <Input 
                            placeholder="Contoh: Beli 10 pack plastik kurban" 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Jumlah (Rp)</Label>
                            <Input 
                                type="number" 
                                placeholder="0" 
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Tanggal</Label>
                            <Input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Penanggung Jawab (PIC)</Label>
                        <Input 
                            placeholder="Nama Panitia" 
                            value={formData.pic}
                            onChange={(e) => setFormData({...formData, pic: e.target.value})}
                            required 
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                            {initialData ? "Simpan Perubahan" : "Simpan Pengeluaran"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function PackageFormModal({ isOpen, onClose, initialData, onSave }: any) {
    const [formData, setFormData] = useState<Partial<QurbanPackage>>({
        name: "", price: 0, weight: 0, participants: 1, description: ""
    })

    useEffect(() => {
        if (initialData) setFormData(initialData)
        else setFormData({ name: "", price: 0, weight: 0, participants: 1, description: "", features: [] })
    }, [initialData, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Paket' : 'Tambah Paket Baru'}</DialogTitle>
                    <DialogDescription>Konfigurasi detail paket qurban.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-1"><Label>Nama Paket</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Sapi Limosin A"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Harga (Rp)</Label>
                            <Input 
                                type="number" 
                                value={formData.price} 
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Berat (Kg)</Label>
                            <Input 
                                type="number" 
                                step="0.1"
                                value={formData.weight} 
                                onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || 0})} 
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Max Peserta</Label>
                        <Input 
                            type="number" 
                            value={formData.participants} 
                            onChange={e => setFormData({...formData, participants: parseInt(e.target.value) || 1})} 
                            required
                        />
                    </div>
                    <div className="space-y-1"><Label>Deskripsi</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="resize-none h-24"/></div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Simpan Paket</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ManualQurbanModal({ isOpen, onClose, packages, onSuccess }: any) {
    const [formData, setFormData] = useState({
        package_id: "", name: "", phone: "", address: "", participant_count: 1, amount: 0, notes: ""
    })
    const [extraNames, setExtraNames] = useState<string[]>([""])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // AUTO-FILL DATA SAAT PAKET DIPILIH
    useEffect(() => {
        const pkg = packages.find((p: any) => p.id.toString() === formData.package_id)
        if (pkg) {
            const isCowPackage = pkg.name.toLowerCase().includes("sapi")
            const isKolektif = pkg.name.toLowerCase().includes("kolektif") // Asumsi: Nama paket mengandung kata 'kolektif'

            // 1. TENTUKAN JUMLAH PESERTA DEFAULT
            // Jika Sapi UTUH (Bukan Kolektif), set 7 orang. Jika Kolektif/Kambing, set 1 orang.
            let defaultCount = 1
            if (isCowPackage && !isKolektif) {
                defaultCount = 7
            }

            // 2. HITUNG HARGA
            // Jika Sapi UTUH atau Kambing -> Harga Flat (Satu Hewan)
            // Jika Sapi KOLEKTIF -> Harga Per Orang * Jumlah Orang
            let totalPrice = pkg.price
            if (isCowPackage && isKolektif) {
                totalPrice = pkg.price * defaultCount
            }

            setFormData(prev => ({ 
                ...prev, 
                participant_count: defaultCount,
                amount: totalPrice 
            }))
        }
    }, [formData.package_id, packages])

    // LOGIKA UPDATE HARGA SAAT JUMLAH PESERTA BERUBAH (Hanya untuk Sapi Kolektif)
    useEffect(() => {
        const pkg = packages.find((p: any) => p.id.toString() === formData.package_id)
        if (pkg) {
            const isKolektif = pkg.name.toLowerCase().includes("kolektif")
            if (isKolektif) {
                // Harga berubah sesuai jumlah orang
                setFormData(prev => ({ ...prev, amount: pkg.price * prev.participant_count }))
            } 
            // Jika Sapi Utuh atau Kambing, harga TETAP (tidak dikali jumlah peserta)
        }
    }, [formData.participant_count])

    // LOGIKA SLOT NAMA EXTRA
    useEffect(() => {
        setExtraNames(prev => {
            const targetLen = formData.participant_count
            
            if (prev.length === targetLen) return prev
            
            // Resize array
            if (prev.length < targetLen) {
                // Tambah slot kosong
                return [...prev, ...Array(targetLen - prev.length).fill("")]
            } else {
                // Potong array
                return prev.slice(0, targetLen)
            }
        })
    }, [formData.participant_count])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                package_id: parseInt(formData.package_id),
                extra_names: extraNames.filter(n => n.trim() !== "")
            }
            await createQurbanRegistration(payload as any)
            toast.success("Pendaftaran Berhasil!")
            onSuccess() 
            onClose()
        } catch (error) {
            toast.error("Gagal mendaftar. Cek koneksi backend.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg flex flex-col max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>Pendaftaran Manual</DialogTitle>
                    <DialogDescription>Input data peserta qurban offline/tunai.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4 py-2">
                    <div className="space-y-1"><Label>Pilih Paket</Label>
                        <Select onValueChange={(v) => setFormData({...formData, package_id: v})}>
                            <SelectTrigger><SelectValue placeholder="Pilih Hewan..." /></SelectTrigger>
                            <SelectContent>{packages.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.name} - Rp {p.price.toLocaleString()}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Nama Pendaftar (Kontak)</Label><Input onChange={e => setFormData({...formData, name: e.target.value})} required/></div>
                        <div className="space-y-1"><Label>No. HP</Label><Input onChange={e => setFormData({...formData, phone: e.target.value})} required/></div>
                    </div>
                    <div className="space-y-1"><Label>Alamat</Label><Input onChange={e => setFormData({...formData, address: e.target.value})} required/></div>
                    
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-emerald-800 font-semibold">Jumlah Shohibul Qurban</Label>
                            <Input 
                                type="number" 
                                className="w-20 bg-white" 
                                min={1} 
                                max={7} 
                                value={formData.participant_count} 
                                onChange={e => setFormData({...formData, participant_count: parseInt(e.target.value) || 1})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-emerald-700 uppercase font-semibold">Daftar Nama (Bin/Binti)</Label>
                            {extraNames.map((name, i) => (
                                <Input 
                                    key={i} 
                                    placeholder={`Nama Peserta ${i+1}`} 
                                    value={name} 
                                    onChange={e => { 
                                        const newNames = [...extraNames]; 
                                        newNames[i] = e.target.value; 
                                        setExtraNames(newNames); 
                                    }} 
                                    className="h-9 text-sm"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-right font-bold text-lg text-emerald-700 pt-2 border-t">Total: Rp {formData.amount.toLocaleString()}</div>
                </form>
                <DialogFooter className="mt-auto pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>{isSubmitting ? "Menyimpan..." : "Simpan Pendaftaran"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// --- MODAL BARU: DetailQurbanModal (FIXED: DialogTitle Error) ---
function DetailQurbanModal({ data, isOpen, onClose }: { data: QurbanRegistration | null, isOpen: boolean, onClose: () => void }) {
    if (!data) return null;

    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
    
    // FUNCTION PRINT STRUK
    const handlePrintReceipt = () => {
        const printWindow = window.open('', '', 'height=600,width=400');
        if (!printWindow) return toast.error("Pop-up diblokir");
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Kwitansi Qurban - #${data.id}</title>
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
                        <p>Tanda Terima Qurban</p>
                    </div>
                    <div class="content">
                        <div class="row"><span>Tanggal:</span> <span>${new Date(data.created_at).toLocaleDateString("id-ID")}</span></div>
                        <div class="row"><span>No. Ref:</span> <span>#${data.id}</span></div>
                        <div class="row"><span>Pendaftar:</span> <span>${data.name}</span></div>
                        <div class="row"><span>Paket:</span> <span>${data.package_name}</span></div>
                        <div class="row"><span>Jumlah Jiwa:</span> <span>${data.participant_count} Orang</span></div>
                        <div class="total row">
                            <span>TOTAL:</span>
                            <span>${formatCurrency(data.amount || 0)}</span>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Semoga Qurban Anda diterima Allah SWT.<br/>Aamiin.</p>
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* FIX: Tambahkan p-0 dan gap-0 agar header custom full width & hide default X */}
            <DialogContent className="sm:max-w-lg p-0 gap-0 [&>button]:hidden">
                
                {/* Header Custom */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-lg font-bold text-slate-900">Detail Pendaftaran</DialogTitle>
                            <Badge variant="outline" className="bg-white">{data.package_name?.toLowerCase().includes('sapi') ? 'Sapi' : 'Kambing'}</Badge>
                        </div>
                        <DialogDescription className="text-xs text-slate-500 mt-1 font-mono">
                            ID: #{data.id} • {new Date(data.created_at).toLocaleString("id-ID")}
                        </DialogDescription>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition"><X className="h-5 w-5" /></button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${data.status === 'paid' || data.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-700'}`}>
                        {data.status === 'paid' || data.status === 'success' ? <CheckCircle2 className="h-5 w-5"/> : <Clock className="h-5 w-5"/>}
                        <div>
                            <p className="font-bold text-sm uppercase">Status: {data.status}</p>
                            <p className="text-xs opacity-80">Total Nominal: {formatCurrency(data.amount || 0)}</p>
                        </div>
                    </div>

                    {/* Identitas Pendaftar */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <User className="h-4 w-4 text-emerald-600"/> Data Pendaftar
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1"><Label className="text-slate-500 text-xs">Nama Lengkap</Label><p className="font-medium text-slate-900">{data.name}</p></div>
                            <div className="space-y-1"><Label className="text-slate-500 text-xs">Nomor Telepon</Label><div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400"/><p className="font-medium text-slate-900">{data.phone || "-"}</p></div></div>
                            <div className="col-span-2 space-y-1"><Label className="text-slate-500 text-xs">Alamat Email</Label><div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400"/><p className="font-medium text-slate-900">{data.email}</p></div></div>
                            <div className="col-span-2 space-y-1"><Label className="text-slate-500 text-xs">Alamat Domisili</Label><div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-slate-400"/><p className="font-medium text-slate-900">{data.address}</p></div></div>
                        </div>
                    </div>

                    {/* Detail Shohibul Qurban */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600"/> Daftar Shohibul Qurban
                        </h3>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                            <div className="flex justify-between mb-2 pb-2 border-b border-slate-200"><span className="text-slate-500">Total Jiwa</span><span className="font-bold">{data.participant_count} Orang</span></div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Nama Peserta (Bin/Binti):</p>
                                <ul className="list-disc ml-4 text-slate-700 space-y-1">
                                    {data.extra_names && data.extra_names.length > 0 ? (
                                        data.extra_names.map((name, idx) => (<li key={idx}>{name}</li>))
                                    ) : (
                                        <li>{data.name} (Sesuai Pendaftar)</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Catatan */}
                    {data.notes && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><Info className="h-4 w-4 text-purple-600"/> Catatan Tambahan</h3>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">"{data.notes}"</div>
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

            </DialogContent>
        </Dialog>
    )
}