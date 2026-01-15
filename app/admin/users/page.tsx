"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Users, Search, Download, Edit, Plus, UserCheck,
  Mail, Phone, MapPin, Trash2, MoreHorizontal, Shield,
  FileText as FilePdf, Calendar, ChevronLeft, ChevronRight,
  Flower, HeartPulse, Filter, Stethoscope, UserMinus,
  TrendingUp, Activity, PieChart as PieIcon, BarChart3,
  FileSpreadsheet, Printer, X, CheckCircle2
} from "lucide-react"
import { Toaster, toast } from "react-hot-toast"

// Recharts
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'

// PDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { UserService, type User } from "@/lib/api/user"

// --- TYPES ---
interface GeneralFormState {
  name: string
  email: string
  phone: string
  role: "admin" | "user"
  status: "active" | "inactive"
  address: string
  password?: string
}

interface ClassificationFormState {
  life_status: "alive" | "deceased"
  classification: string
}

// Warna Chart
const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#64748b'
]; 

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classificationFilter, setClassificationFilter] = useState("all")

  // Report Filter States (DEFAULT KE "ALL" AGAR BISA LANGSUNG DOWNLOAD)
  const [reportMonth, setReportMonth] = useState<string>("all")
  const [reportYear, setReportYear] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // --- MODAL STATES ---
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
  const [isClassifyModalOpen, setIsClassifyModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)

  const defaultGeneralForm: GeneralFormState = { name: "", email: "", phone: "", role: "user", status: "active", address: "", password: "" }
  const [generalForm, setGeneralForm] = useState<GeneralFormState>(defaultGeneralForm)
  const [classifyForm, setClassifyForm] = useState<ClassificationFormState>({ life_status: "alive", classification: "umum" })

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await UserService.getAll()
      const mappedUsers = res.data.map((u: any) => ({
        ...u,
        life_status: u.life_status || "alive",
        classification: u.classification || "umum"
      }))
      setUsers(mappedUsers || [])
    } catch (error) {
      toast.error("Gagal memuat data user.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, statusFilter, classificationFilter])

  // --- ANALYTICS DATA CALCULATION ---
  const analyticsData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthStats = months.map(m => ({ name: m, user: 0 }));
    
    users.forEach(u => {
      if (u.created_at) {
        const monthIndex = new Date(u.created_at).getMonth();
        if (growthStats[monthIndex]) {
          growthStats[monthIndex].user += 1;
        }
      }
    });

    const classMap: Record<string, number> = {};
    users.forEach(u => {
      if (u.life_status !== 'deceased') {
        const cls = u.classification || "umum";
        classMap[cls] = (classMap[cls] || 0) + 1;
      }
    });
    
    const classStats = Object.keys(classMap).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1), 
      value: classMap[key]
    })).sort((a, b) => b.value - a.value); 

    const activeCount = users.filter(u => u.status === 'active').length;
    const inactiveCount = users.filter(u => u.status === 'inactive').length;
    const statusStats = [
        { name: 'Aktif', value: activeCount },
        { name: 'Non-Aktif', value: inactiveCount }
    ];

    return { growthStats, classStats, statusStats };
  }, [users]);

  // --- REPORT DATA CALCULATION (PERBAIKAN LOGIC) ---
  const reportData = useMemo(() => {
    return users.filter(user => {
      // Jika filter "all", tampilkan semua
      if (reportMonth === "all" && reportYear === "all") return true;

      if (!user.created_at) return false;
      const date = new Date(user.created_at);
      
      const monthMatch = reportMonth === "all" || date.getMonth() === parseInt(reportMonth);
      const yearMatch = reportYear === "all" || date.getFullYear() === parseInt(reportYear);

      return monthMatch && yearMatch;
    });
  }, [users, reportMonth, reportYear]);

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setIsEditMode(false)
    setGeneralForm(defaultGeneralForm)
    setIsGeneralModalOpen(true)
  }

  const handleOpenEditGeneral = (user: User) => {
    setIsEditMode(true)
    setCurrentId(user.id)
    setGeneralForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status || "active",
        address: user.address || "",
        password: ""
    })
    setIsGeneralModalOpen(true)
  }

  const handleSubmitGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    const loadingToast = toast.loading("Menyimpan data...")
    try {
      const payload: any = { ...generalForm }
      if (isEditMode && !payload.password) delete payload.password

      if (isEditMode && currentId) {
        await UserService.update(currentId, payload)
        toast.success("Biodata diperbarui!")
      } else {
        await UserService.create(payload)
        toast.success("User baru ditambahkan!")
      }
      setIsGeneralModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Gagal menyimpan data.")
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleOpenClassify = (user: User) => {
      setCurrentId(user.id)
      setClassifyForm({
          life_status: (user.life_status as "alive" | "deceased") || "alive",
          classification: user.classification || "umum"
      })
      setIsClassifyModalOpen(true)
  }

  const handleSubmitClassification = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!currentId) return
      
      const loadingToast = toast.loading("Mengupdate klasifikasi...")
      try {
          await UserService.update(currentId, { ...classifyForm } as any) 
          toast.success("Data klasifikasi berhasil diupdate!")
          setIsClassifyModalOpen(false)
          fetchData()
      } catch (error) {
          toast.error("Gagal update klasifikasi.")
      } finally {
          toast.dismiss(loadingToast)
      }
  }

  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-700">Hapus user ini permanen?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.dismiss(t.id)}>Batal</Button>
          <Button size="sm" className="h-7 text-xs bg-red-600 text-white hover:bg-red-700" onClick={async () => {
              toast.dismiss(t.id)
              try { await UserService.delete(id); toast.success("User dihapus"); fetchData() } 
              catch (e) { toast.error("Gagal menghapus") }
            }}>Hapus</Button>
        </div>
      </div>
    ), { icon: <Trash2 className="h-4 w-4 text-red-500" /> })
  }

  // --- EXPORT FUNCTIONS ---
  const handleExportExcel = () => {
    if (reportData.length === 0) return toast.error("Tidak ada data laporan untuk periode ini.");
    try {
        const headers = ["ID", "Nama Lengkap", "Email", "Role", "Status", "Hidup/Wafat", "Klasifikasi", "Alamat", "Tgl Gabung"]
        const rows = reportData.map(u => [
            u.id, `"${u.name}"`, u.email, u.role, u.status, u.life_status, u.classification, `"${u.address || '-'}"`,
            u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : '-'
        ])
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a"); link.href = url; link.download = `Laporan_Jamaah_${reportMonth}_${reportYear}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        toast.success("Excel berhasil diunduh!")
    } catch (error) { toast.error("Gagal export.") }
  }

  const handleDownloadPDF = () => {
    if (reportData.length === 0) return toast.error("Tidak ada data laporan untuk periode ini.");
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) return toast.error("Pop-up diblokir browser.");

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthName = reportMonth === "all" ? "SEMUA BULAN" : months[parseInt(reportMonth)];
    const yearName = reportYear === "all" ? "SEMUA TAHUN" : reportYear;
    
    const activeCount = reportData.filter(u => u.status === 'active').length;
    const inactiveCount = reportData.filter(u => u.status === 'inactive').length;

    const htmlContent = `
      <html>
        <head>
          <title>Laporan Data Jamaah - ${monthName} ${yearName}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 5px 0 0; font-size: 14px; }
            h2 { text-align: center; text-decoration: underline; margin-bottom: 20px; font-size: 18px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
            th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
            
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

          <h2>LAPORAN DATA JAMAAH</h2>
          <p style="text-align:center">Periode: ${monthName} ${yearName}</p>

          <div class="section-title">I. DATA JAMAAH</div>
          <table>
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="15%">Tanggal</th>
                <th>Nama Lengkap</th>
                <th width="20%">Email</th>
                <th width="15%">No. HP</th>
                <th width="10%">Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map((u, i) => `
                <tr>
                  <td style="text-align:center">${i+1}</td>
                  <td>${u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : '-'}</td>
                  <td>${u.name}</td>
                  <td>${u.email}</td>
                  <td>${u.phone || '-'}</td>
                  <td style="text-align:center">${u.status === 'active' ? 'Aktif' : 'Non-Aktif'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">II. REKAPITULASI STATUS (PERIODE INI)</div>
          <div class="summary-box">
            <div class="summary-row"><span>Jamaah Aktif</span><span>${activeCount} Orang</span></div>
            <div class="summary-row"><span>Jamaah Non-Aktif</span><span>${inactiveCount} Orang</span></div>
            <div class="summary-row total"><span>TOTAL DATA</span><span>${reportData.length} Orang</span></div>
          </div>

          <div class="footer">
            <div class="sign">
              <p>Mengetahui,<br/>Ketua Takmir</p>
              <br/><br/><br/>
              <p>( ........................... )</p>
            </div>
            <div class="sign">
              <p>Tabanan, ${new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}<br/>Sekretaris</p>
              <br/><br/><br/>
              <p>( ........................... )</p>
            </div>
          </div>

          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- LOGIC FILTER ---
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    const matchClass = classificationFilter === "all" || u.classification === classificationFilter
    return matchSearch && matchStatus && matchClass
  })

  const almarhumList = users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase())
      return u.life_status === 'deceased' && matchSearch
  })

  const classifiedList = users.filter(u => {
    if (u.life_status === 'deceased') return false; 
    if (classificationFilter === "all") return true;
    return u.classification === classificationFilter;
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1) }
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1) }

  const activeUsers = users.filter(u => u.status === 'active').length
  const adminUsers = users.filter(u => u.role === 'admin').length
  const deceasedUsers = users.filter(u => u.life_status === 'deceased')

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active": return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Aktif</Badge>
      case "inactive": return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Non-Aktif</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getClassificationBadge = (cls?: string) => {
      switch (cls) {
          case 'umum': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Umum</Badge>
          case 'fakir': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200">Fakir</Badge>
          case 'miskin': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">Miskin</Badge>
          case 'yatim': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Yatim</Badge>
          case 'piatu': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200">Piatu</Badge>
          case 'yatim piatu': return <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200">Yatim Piatu</Badge>
          case 'janda': return <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200">Janda</Badge>
          case 'mualaf': return <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200">Mualaf</Badge>
          case 'lansia': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200">Lansia</Badge>
          default: return null
      }
  }
  
  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-6">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Jamaah</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <p>Kelola data jamaah, status, dan klasifikasi sosial</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-10 px-6" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Jamaah
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Total User</p><h3 className="text-2xl font-bold text-slate-900">{users.length}</h3></div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-6 w-6" /></div>
            </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">User Aktif</p><h3 className="text-2xl font-bold text-slate-900">{activeUsers}</h3></div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck className="h-6 w-6" /></div>
            </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Administrator</p><h3 className="text-2xl font-bold text-slate-900">{adminUsers}</h3></div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Shield className="h-6 w-6" /></div>
            </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Almarhum</p><h3 className="text-2xl font-bold text-slate-900">{deceasedUsers.length}</h3></div>
                <div className="p-3 bg-slate-100 text-slate-600 rounded-lg"><Flower className="h-6 w-6" /></div>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <div className="border-b border-slate-200 pb-1">
            <TabsList className="bg-transparent p-0 h-auto gap-6">
                <TabsTrigger value="users" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Daftar Jamaah</TabsTrigger>
                <TabsTrigger value="deceased" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Data Almarhum</TabsTrigger>
                <TabsTrigger value="classification" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Klasifikasi Sosial</TabsTrigger>
                <TabsTrigger value="analytics" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Analitik</TabsTrigger>
                {/* TAB BARU: LAPORAN */}
                <TabsTrigger value="reports" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Laporan</TabsTrigger>
            </TabsList>
        </div>

        {/* TAB 1: USER LIST */}
        <TabsContent value="users" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Cari nama atau email..." className="pl-10 bg-slate-50 border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {['all', 'active', 'inactive'].map((status) => (
                            <button 
                                key={status} 
                                onClick={() => setStatusFilter(status)} 
                                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${statusFilter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {status === 'all' ? 'Semua' : status === 'active' ? 'Aktif' : 'Non-Aktif'}
                            </button>
                        ))}
                    </div>
                    <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-white h-9 border-slate-200">
                            <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
                            <SelectValue placeholder="Semua Golongan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Golongan</SelectItem>
                            <SelectItem value="umum">Umum</SelectItem>
                            <SelectItem value="fakir">Fakir</SelectItem>
                            <SelectItem value="miskin">Miskin</SelectItem>
                            <SelectItem value="yatim">Yatim</SelectItem>
                            <SelectItem value="piatu">Piatu</SelectItem>
                            <SelectItem value="yatim piatu">Yatim Piatu</SelectItem>
                            <SelectItem value="janda">Janda</SelectItem>
                            <SelectItem value="mualaf">Mualaf</SelectItem>
                            <SelectItem value="lansia">Lansia</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="text-center py-16 text-slate-500">Memuat data user...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                            <p>Tidak ada data jamaah yang sesuai.</p>
                        </div>
                    ) : (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                            {currentUsers.map((user) => (
                                <Card key={user.id} className="group border border-slate-200 shadow-sm bg-white hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden">
                                    {user.life_status === 'deceased' && (
                                        <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-bl-lg font-medium border-l border-b border-slate-200 flex items-center gap-1">
                                            <Flower className="h-3 w-3" /> Almarhum
                                        </div>
                                    )}

                                    <CardContent className="p-5 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-slate-100">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback className={`text-white text-xs font-bold ${user.role === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className={`font-bold leading-none text-base mb-1 ${user.life_status === 'deceased' ? 'text-slate-500' : 'text-slate-900'}`}>{user.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {getStatusBadge(user.status)}
                                                        {user.role === 'admin' && <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Admin</Badge>}
                                                        {getClassificationBadge(user.classification)}
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Aksi User</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleOpenEditGeneral(user)}><Edit className="mr-2 h-3.5 w-3.5" /> Edit Biodata</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleOpenClassify(user)} className="text-blue-600 focus:text-blue-700"><Stethoscope className="mr-2 h-3.5 w-3.5" /> Atur Klasifikasi</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}><Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="space-y-2.5 text-sm text-slate-600 pt-4 border-t border-slate-50 mt-auto">
                                            <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> <span className="truncate">{user.email}</span></div>
                                            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> <span>{user.phone || "-"}</span></div>
                                            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" /> <span className="truncate">{user.address || "-"}</span></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {filteredUsers.length > 0 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50">
                                <p className="text-xs text-slate-500">Hal. {currentPage} dari {totalPages}</p>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* TAB 2: DATA ALMARHUM */}
        <TabsContent value="deceased" className="space-y-4">
             <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-slate-50/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200 rounded-lg text-slate-600">
                            <Flower className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Arsip Data Almarhum</CardTitle>
                            <CardDescription>Daftar jamaah yang telah meninggal dunia.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {almarhumList.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 bg-white">
                            Belum ada data jamaah meninggal.
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Nama Almarhum</th>
                                        <th className="px-6 py-4 font-semibold">Kontak Keluarga</th>
                                        <th className="px-6 py-4 font-semibold">Alamat Terakhir</th>
                                        <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {almarhumList.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{user.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <UserMinus className="h-3 w-3" /> Non-Aktif
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{user.phone || "-"}</td>
                                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{user.address || "-"}</td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleOpenClassify(user)}>
                                                    <Edit className="h-3.5 w-3.5 mr-2" /> Edit Status
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* TAB 3: KLASIFIKASI & STATISTIK SOSIAL */}
        <TabsContent value="classification" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* GRAFIK PIE CHART */}
                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>Distribusi Sosial</CardTitle>
                        <CardDescription>Berdasarkan klasifikasi ekonomi</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analyticsData.classStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {analyticsData.classStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* TABEL ATAS: DATA PER GOLONGAN (HIDUP) */}
                <Card className="border-0 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Data Per Golongan (Aktif)</CardTitle>
                                <CardDescription>Daftar user berdasarkan filter golongan</CardDescription>
                            </div>
                            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                                <SelectTrigger className="w-[180px] bg-white">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Pilih Golongan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Data</SelectItem>
                                    <SelectItem value="umum">Umum</SelectItem>
                                    <SelectItem value="fakir">Fakir</SelectItem>
                                    <SelectItem value="miskin">Miskin</SelectItem>
                                    <SelectItem value="yatim">Yatim</SelectItem>
                                    <SelectItem value="piatu">Piatu</SelectItem>
                                    <SelectItem value="yatim piatu">Yatim Piatu</SelectItem>
                                    <SelectItem value="janda">Janda</SelectItem>
                                    <SelectItem value="mualaf">Mualaf</SelectItem>
                                    <SelectItem value="lansia">Lansia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {classifiedList.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed text-slate-500">Tidak ada data untuk golongan ini.</div>
                        ) : (
                            <div className="overflow-y-auto max-h-[300px]">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Nama Lengkap</th>
                                            <th className="px-4 py-3">Klasifikasi</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {classifiedList.map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                                                <td className="px-4 py-3">{getClassificationBadge(user.classification)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleOpenClassify(user)} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                                                        <Stethoscope className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* TAB 4: ANALYTICS (REAL DATA) */}
        <TabsContent value="analytics" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CHART 1: GROWTH */}
              <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600"/>
                    <div>
                      <CardTitle>Pertumbuhan Jamaah</CardTitle>
                      <CardDescription>Berdasarkan bulan pendaftaran</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.growthStats}>
                        <defs>
                          <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Area type="monotone" dataKey="user" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUser)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* CHART 2: STATUS ACTIVE VS INACTIVE */}
              <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600"/>
                    <div>
                      <CardTitle>Status Keaktifan</CardTitle>
                      <CardDescription>Perbandingan jamaah aktif vs non-aktif</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.statusStats} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 14, fontWeight: 500}} width={100} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40}>
                          {
                            analyticsData.statusStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === 'Aktif' ? '#10b981' : '#cbd5e1'} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
        </TabsContent>

        {/* TAB 5: LAPORAN (BARU) */}
        <TabsContent value="reports" className="space-y-6">

            {/* Export Cards (2 Card Besar) */}
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
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Unduh data mentah user dalam format .csv untuk diolah lebih lanjut.</p>
                        <span className="text-xs text-green-700 font-medium mt-4 block bg-green-50 w-fit px-2 py-1 rounded border border-green-100">
                            {reportData.length} Data Siap Unduh
                        </span>
                    </div>
                </div>

                {/* CARD PDF */}
                <div onClick={handleDownloadPDF} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Printer className="h-6 w-6" />
                        </div>
                        <Download className="h-5 w-5 text-slate-300 group-hover:text-red-600 transition-colors" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 text-lg">Cetak Laporan PDF</h4>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Laporan data jamaah lengkap dengan Kop Surat Resmi.</p>
                        <span className="text-xs text-red-700 font-medium mt-4 block bg-red-50 w-fit px-2 py-1 rounded border border-red-100">
                            Format Laporan Resmi
                        </span>
                    </div>
                </div>

            </div>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: EDIT GENERAL */}
      <Dialog open={isGeneralModalOpen} onOpenChange={setIsGeneralModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Biodata User" : "Tambah User Baru"}</DialogTitle>
            <DialogDescription>Informasi akun dan kontak dasar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitGeneral} className="space-y-4 py-2">
            <div className="space-y-1"><Label>Nama Lengkap</Label><Input value={generalForm.name} onChange={e => setGeneralForm({...generalForm, name: e.target.value})} required placeholder="Contoh: Ahmad Abdullah"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={generalForm.email} onChange={e => setGeneralForm({...generalForm, email: e.target.value})} required placeholder="email@contoh.com"/></div>
                <div className="space-y-1"><Label>No. Handphone</Label><Input value={generalForm.phone} onChange={e => setGeneralForm({...generalForm, phone: e.target.value})} placeholder="08..."/></div>
            </div>
            <div className="space-y-1"><Label>{isEditMode ? "Password (Opsional)" : "Password"}</Label><Input type="password" value={generalForm.password} onChange={e => setGeneralForm({...generalForm, password: e.target.value})} required={!isEditMode} placeholder="******"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Role Akses</Label><Select value={generalForm.role} onValueChange={(v: "admin"|"user") => setGeneralForm({...generalForm, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="user">Jamaah (User)</SelectItem><SelectItem value="admin">Administrator</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Status Akun</Label><Select value={generalForm.status} onValueChange={(v: "active"|"inactive") => setGeneralForm({...generalForm, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Non-Aktif</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-1"><Label>Alamat Domisili</Label><Textarea value={generalForm.address} onChange={e => setGeneralForm({...generalForm, address: e.target.value})} placeholder="Alamat lengkap..."/></div>
            <DialogFooter className="pt-4 border-t mt-4"><Button type="button" variant="outline" onClick={() => setIsGeneralModalOpen(false)}>Batal</Button><Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Simpan Biodata</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: EDIT CLASSIFICATION */}
      <Dialog open={isClassifyModalOpen} onOpenChange={setIsClassifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Status & Klasifikasi</DialogTitle>
            <DialogDescription>Pengaturan status sosial dan vitalitas jamaah.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitClassification} className="space-y-5 py-4">
            <div className="space-y-3">
                <Label>Status Vitalitas</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setClassifyForm({...classifyForm, life_status: 'alive'})} className={`cursor-pointer p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${classifyForm.life_status === 'alive' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}>
                        <div className={`p-2 rounded-full ${classifyForm.life_status === 'alive' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}><HeartPulse className="h-5 w-5" /></div>
                        <span className="font-medium text-sm">Masih Hidup</span>
                    </div>
                    <div onClick={() => setClassifyForm({...classifyForm, life_status: 'deceased'})} className={`cursor-pointer p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${classifyForm.life_status === 'deceased' ? 'border-slate-500 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
                        <div className={`p-2 rounded-full ${classifyForm.life_status === 'deceased' ? 'bg-slate-500 text-white' : 'bg-slate-200 text-slate-500'}`}><Flower className="h-5 w-5" /></div>
                        <span className="font-medium text-sm">Meninggal</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Klasifikasi Ekonomi & Sosial</Label>
                <Select value={classifyForm.classification} onValueChange={(v) => setClassifyForm({...classifyForm, classification: v})}>
                    <SelectTrigger className="h-11 bg-white border-slate-200"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="umum">Umum (Tidak Ada)</SelectItem>
                        <SelectItem value="fakir">Fakir</SelectItem>
                        <SelectItem value="miskin">Miskin</SelectItem>
                        <SelectItem value="yatim">Yatim</SelectItem>
                        <SelectItem value="piatu">Piatu</SelectItem>
                        <SelectItem value="yatim piatu">Yatim Piatu</SelectItem>
                        <SelectItem value="janda">Janda</SelectItem>
                        <SelectItem value="mualaf">Mualaf</SelectItem>
                        <SelectItem value="lansia">Lansia</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Kategori ini digunakan untuk prioritas penyaluran bantuan/zakat.</p>
            </div>
            <DialogFooter className="pt-4 border-t mt-2">
                <Button type="button" variant="outline" onClick={() => setIsClassifyModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}