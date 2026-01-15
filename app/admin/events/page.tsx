"use client"

import { useState, useEffect, Key } from "react"
import {
  Calendar,
  Search,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Pencil,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Heart,
  Mic,
  Award,
  Star,
  User,
  Phone,
  Banknote,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  PlayCircle,
  Download,
  FileSpreadsheet,
  FileText as FileIcon,
  Users,
  ChevronLeft,
  ChevronRight,
  PhoneIncoming,
  Info,
  X,
  FileText,
  Printer,
  CheckCircle2
} from "lucide-react"
import { Toaster, toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Import Service & Type
import { ActivityService } from "@/lib/api/activity"
import { Activity, ActivityStatus } from "@/app/types/activity"

// Tipe Form State
interface ActivityFormState {
  judul: string
  kategori: string
  tanggal: string
  waktu: string
  lokasi: string
  pemateri: string
  tema: string
  deskripsi: string
  biaya: string
  kontak: string
  fasilitas: string 
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("events")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [selectedEventDetail, setSelectedEventDetail] = useState<Activity | null>(null)
  
  // Form State Default
  const defaultForm: ActivityFormState = {
    judul: "", kategori: "Kajian", tanggal: "", waktu: "", lokasi: "Masjid Al-Huda",
    pemateri: "", tema: "", deskripsi: "",
    biaya: "Gratis", kontak: "", fasilitas: ""
  }
  const [formData, setFormData] = useState<ActivityFormState>(defaultForm)

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await ActivityService.getAll()
      setEvents(res.data || [])
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Gagal memuat data kegiatan.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, searchTerm, activeTab])


  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setIsEditMode(false)
    setFormData(defaultForm)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (activity: Activity) => {
    setIsEditMode(true)
    setCurrentId(activity.id)
    
    const fasilitasString = Array.isArray(activity.fasilitas) 
        ? activity.fasilitas.join(", ") 
        : (activity.fasilitas || "")

    setFormData({
        judul: activity.judul,
        kategori: activity.kategori || "Lainnya",
        tanggal: activity.tanggal ? activity.tanggal.split('T')[0] : "",
        waktu: activity.waktu || "",
        lokasi: activity.lokasi || "",
        pemateri: activity.pemateri || "",
        tema: activity.tema || "",
        deskripsi: activity.deskripsi || "",
        biaya: activity.biaya || "",
        kontak: activity.kontak || "",
        fasilitas: String(fasilitasString)
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const loadingToast = toast.loading("Menyimpan data...")
    
    try {
      const payload: any = { ...formData, status: 'terbuka' } 

      if (isEditMode && currentId) {
        const existingEvent = events.find(e => e.id === currentId)
        const finalPayload = { ...formData, status: existingEvent?.status || 'terbuka' }
        await ActivityService.update(currentId, finalPayload)
        toast.success("Kegiatan diperbarui!")
      } else {
        await ActivityService.create(payload)
        toast.success("Kegiatan berhasil dibuat!")
      }
      
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error("Gagal menyimpan data.")
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  // --- REPORT EXPORT HANDLERS ---
  const handleExportExcel = () => {
    if (events.length === 0) return toast.error("Tidak ada data kegiatan.")
    try {
        const headers = ["ID", "Judul", "Kategori", "Tanggal", "Lokasi", "Pemateri", "Status"]
        const rows = events.map(e => [e.id, `"${e.judul}"`, e.kategori, e.tanggal, `"${e.lokasi}"`, `"${e.pemateri}"`, e.status])
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `Laporan_Kegiatan_AlHuda_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        toast.success("Laporan Excel berhasil diunduh!")
    } catch (error) { toast.error("Gagal export data.") }
  }

  const handleExportPDF = () => {
    if (events.length === 0) return toast.error("Tidak ada data kegiatan.")
    const printWindow = window.open('', '', 'height=800,width=1000')
    if (!printWindow) return toast.error("Pop-up diblokir.")
    
    const htmlContent = `
        <html><head><title>Laporan Kegiatan Masjid</title>
        <style>body{font-family:'Times New Roman';padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #000;padding:8px;font-size:12px}th{background:#f0f0f0}</style>
        </head><body>
        <h2 style="text-align:center;margin-bottom:5px">LAPORAN KEGIATAN MASJID AL-HUDA</h2>
        <p style="text-align:center;margin-top:0;font-size:12px">Periode: ${new Date().getFullYear()}</p>
        <table><thead><tr><th>No</th><th>Tanggal</th><th>Nama Kegiatan</th><th>Kategori</th><th>Pemateri</th><th>Status</th></tr></thead>
        <tbody>
            ${events.map((e, i) => `<tr><td style="text-align:center">${i+1}</td><td>${e.tanggal}</td><td>${e.judul}</td><td>${e.kategori}</td><td>${e.pemateri}</td><td>${e.status}</td></tr>`).join('')}
        </tbody></table>
        <script>window.onload=function(){window.print()}</script>
        </body></html>`
        
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // --- CONFIRMATION TOASTS ---
  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-700">Hapus kegiatan ini permanen?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.dismiss(t.id)}>Batal</Button>
          <Button 
            size="sm" 
            className="h-7 text-xs bg-red-600 text-white hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await ActivityService.delete(id)
                toast.success("Kegiatan dihapus")
                fetchData()
              } catch (e) { toast.error("Gagal menghapus") }
            }}
          >
            Hapus
          </Button>
        </div>
      </div>
    ), { icon: <Trash2 className="h-4 w-4 text-red-500" /> })
  }

  const handleUpdateStatus = (id: number, newStatus: ActivityStatus, currentData: Activity) => {
    toast((t) => (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-700">
                Ubah status menjadi <strong>{newStatus.toUpperCase()}</strong>?
            </p>
            <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.dismiss(t.id)}>Batal</Button>
                <Button 
                    size="sm" 
                    className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={async () => {
                        toast.dismiss(t.id)
                        try {
                            const payload = {
                                ...currentData,
                                status: newStatus,
                                tanggal: currentData.tanggal ? currentData.tanggal.split('T')[0] : "",
                                fasilitas: Array.isArray(currentData.fasilitas) ? currentData.fasilitas.join(", ") : (currentData.fasilitas || "")
                            }
                            // Clean payload structure manually if needed
                            const cleanPayload = {
                                judul: payload.judul,
                                kategori: payload.kategori || "",
                                tanggal: payload.tanggal,
                                waktu: payload.waktu || "",
                                lokasi: payload.lokasi || "",
                                pemateri: payload.pemateri || "",
                                tema: payload.tema || "",
                                deskripsi: payload.deskripsi || "",
                                status: newStatus,
                                biaya: payload.biaya || "",
                                kontak: payload.kontak || "",
                                fasilitas: String(payload.fasilitas)
                            }

                            await ActivityService.update(id, cleanPayload)
                            toast.success(`Status diubah menjadi: ${newStatus}`)
                            fetchData()
                        } catch (error) {
                            toast.error("Gagal update status")
                        }
                    }}
                >
                    Ya, Ubah
                </Button>
            </div>
        </div>
    ), { duration: 5000, position: 'top-center' })
  }

  // --- UTILS ---
  const getCategoryIcon = (cat: string = "") => {
    switch (cat.toLowerCase()) {
      case "kajian": return <BookOpen className="h-4 w-4" />
      case "pendidikan": return <GraduationCap className="h-4 w-4" />
      case "sosial": return <Heart className="h-4 w-4" />
      case "seminar": return <Mic className="h-4 w-4" />
      case "pelatihan": return <Award className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "terbuka": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "selesai": return "bg-slate-100 text-slate-600 border-slate-200"
      case "dibatalkan": return "bg-red-100 text-red-700 border-red-200"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    try {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
        })
    } catch (e) {
        return dateString
    }
  }

  // --- FILTERING ---
  const filteredEvents = events.filter(e => {
    const matchSearch = e.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (e.pemateri && e.pemateri.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchStatus = filterStatus === "all" || e.status === filterStatus
    return matchSearch && matchStatus
  })

  // --- PAGINATION ---
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return data.slice(startIndex, startIndex + itemsPerPage)
  }

  const PaginationControls = ({ totalItems }: { totalItems: number }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    if (totalPages <= 1) return null
    return (
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
        </div>
    )
  }

  // --- STATS CALC ---
  const totalEvents = events.length
  const activeEvents = events.filter(e => e.status === 'terbuka').length
  const doneEvents = events.filter(e => e.status === 'selesai').length

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-6 print:bg-white print:p-0">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Kegiatan</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <p>Sistem Publikasi & Jadwal Masjid</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchData} 
            className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200 h-10 shadow-sm"
            disabled={isLoading}
          >
             <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
             {isLoading ? "Syncing..." : "Sync Data"}
          </Button>

          <Button 
            onClick={handleOpenCreate} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 shadow-md px-6"
          >
            <Plus className="mr-2 h-4 w-4" /> 
            Tambah Kegiatan
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Kegiatan" value={totalEvents.toString()} icon={<Calendar className="h-6 w-6"/>} bgIcon="bg-blue-50 text-blue-600" />
        <StatCard title="Kegiatan Terbuka" value={activeEvents.toString()} icon={<Star className="h-6 w-6"/>} bgIcon="bg-emerald-50 text-emerald-600" />
        <StatCard title="Kegiatan Selesai" value={doneEvents.toString()} icon={<CheckCircle2 className="h-6 w-6"/>} bgIcon="bg-slate-100 text-slate-600" />
      </div>

      {/* TABS & LIST */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-slate-200 pb-1 print:hidden">
            <TabsList className="bg-transparent p-0 h-auto gap-6">
                <TabsTrigger value="events" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Daftar Kegiatan</TabsTrigger>
                <TabsTrigger value="reports" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Laporan</TabsTrigger>
            </TabsList>
        </div>

        {/* TAB 1: DAFTAR KEGIATAN */}
        <TabsContent value="events" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Cari judul atau pemateri..." className="pl-10 bg-slate-50 border-slate-200" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'terbuka', 'selesai', 'dibatalkan'].map((status) => (
                        <Button 
                            key={status} 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setFilterStatus(status)} 
                            className={`capitalize border h-9 px-4 ${filterStatus === status ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600'}`}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-16 text-slate-500">Memuat data kegiatan...</div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 text-slate-500">
                    <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p>Belum ada data kegiatan yang sesuai.</p>
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {getPaginatedData(filteredEvents).map((event) => (
                        <Card key={event.id} className="group border border-slate-200 shadow-sm bg-white hover:shadow-md transition-all flex flex-col h-full">
                            <CardContent className="p-5 flex flex-col h-full">
                                {/* Header Card */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 gap-1 pl-1.5 pr-2.5">
                                            {getCategoryIcon(event.kategori)} {event.kategori}
                                        </Badge>
                                        <Badge className={`uppercase text-[10px] ${getStatusColor(event.status)}`}>
                                            {event.status}
                                        </Badge>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setSelectedEventDetail(event)}><FileText className="mr-2 h-3.5 w-3.5"/> Detail</DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem onClick={() => handleOpenEdit(event)}><Pencil className="mr-2 h-3.5 w-3.5"/> Edit Data</DropdownMenuItem>
                                            
                                            {/* Action Change Status */}
                                            {event.status === 'terbuka' && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(event.id, 'selesai', event)} className="text-emerald-600"><CheckCircle className="mr-2 h-3.5 w-3.5"/> Tandai Selesai</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(event.id, 'dibatalkan', event)} className="text-slate-600"><XCircle className="mr-2 h-3.5 w-3.5"/> Batalkan</DropdownMenuItem>
                                                </>
                                            )}
                                            {event.status !== 'terbuka' && (
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(event.id, 'terbuka', event)} className="text-blue-600"><PlayCircle className="mr-2 h-3.5 w-3.5"/> Buka Kembali</DropdownMenuItem>
                                            )}
                                            
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-3.5 w-3.5"/> Hapus Permanen</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                                    {event.judul}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                                    {event.deskripsi}
                                </p>
                                
                                {/* Meta Info */}
                                <div className="space-y-2 pt-4 border-t border-slate-100 text-sm">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Calendar className="h-4 w-4 text-emerald-500"/> 
                                        <span className="font-medium">{formatDate(event.tanggal)}</span> 
                                        <span className="text-slate-400">•</span> 
                                        <span className="text-slate-600">{event.waktu}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="h-4 w-4 text-slate-400"/> {event.lokasi}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <User className="h-4 w-4 text-slate-400"/> {event.pemateri}
                                    </div>
                                    {(event.biaya || event.kontak) && (
                                        <div className="flex gap-3 mt-2 pt-2 border-t border-slate-50">
                                            {event.biaya && <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded"><Banknote className="h-3 w-3"/> {event.biaya}</div>}
                                            {event.kontak && <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded"><Phone className="h-3 w-3"/> {event.kontak}</div>}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <PaginationControls totalItems={filteredEvents.length} />
                </>
            )}
        </TabsContent>

        {/* TAB 2: LAPORAN (Sesuai Request) */}
        <TabsContent value="reports" className="mt-4 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={handleExportExcel} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48">
                <div className="flex justify-between items-start"><div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><FileSpreadsheet className="h-6 w-6" /></div><Download className="h-5 w-5 text-slate-300" /></div>
                <div>
                  <h4 className="font-semibold text-slate-900">Export Excel (CSV)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Unduh data mentah kegiatan masjid dalam format .csv untuk analisis lebih lanjut.</p>
                  <span className="text-[10px] text-green-600 font-medium mt-3 block bg-green-50 w-fit px-2 py-1 rounded">{events.length} Data Siap Unduh</span></div>
            </div>
            <div onClick={handleExportPDF} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48">
                <div className="flex justify-between items-start"><div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"><Printer className="h-6 w-6" /></div><Download className="h-5 w-5 text-slate-300" /></div>
                <div>
                  <h4 className="font-semibold text-slate-900">Cetak Laporan PDF</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Dokumen resmi siap cetak (A4) berisi daftar kegiatan dengan Kop Yayasan.</p>
                <span className="text-[10px] text-red-600 font-medium mt-3 block bg-red-50 w-fit px-2 py-1 rounded">Format Laporan Resmi</span></div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- FORM MODAL (CREATE/EDIT) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Kegiatan" : "Buat Kegiatan Baru"}</DialogTitle>
            <DialogDescription>Lengkapi detail kegiatan untuk dipublikasikan. Status awal otomatis "Terbuka".</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Judul Kegiatan *</Label><Input value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} required placeholder="Contoh: Kajian Rutin Sabtu"/></div>
                <div className="space-y-1"><Label>Kategori *</Label><Select value={formData.kategori} onValueChange={v=>setFormData({...formData, kategori: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Kajian">Kajian</SelectItem><SelectItem value="Pendidikan">Pendidikan</SelectItem><SelectItem value="Sosial">Sosial</SelectItem><SelectItem value="Seminar">Seminar</SelectItem><SelectItem value="Pelatihan">Pelatihan</SelectItem><SelectItem value="Lainnya">Lainnya</SelectItem></SelectContent></Select></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Tanggal (YYYY-MM-DD) *</Label><Input type="date" value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})} required/></div>
                <div className="space-y-1"><Label>Waktu (Jam) *</Label><Input value={formData.waktu} onChange={e=>setFormData({...formData, waktu: e.target.value})} required placeholder="Contoh: 19:30 - Selesai"/></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Lokasi *</Label><Input value={formData.lokasi} onChange={e=>setFormData({...formData, lokasi: e.target.value})} required placeholder="Contoh: Masjid Al-Huda"/></div>
                <div className="space-y-1"><Label>Pemateri / Narasumber *</Label><Input value={formData.pemateri} onChange={e=>setFormData({...formData, pemateri: e.target.value})} required placeholder="Nama Ustadz / Tokoh"/></div>
            </div>

            <div className="space-y-1"><Label>Tema Kajian (Opsional)</Label><Input value={formData.tema} onChange={e=>setFormData({...formData, tema: e.target.value})} placeholder="Topik spesifik yang dibahas"/></div>
            
            <div className="space-y-1"><Label>Deskripsi Lengkap *</Label><Textarea value={formData.deskripsi} onChange={e=>setFormData({...formData, deskripsi: e.target.value})} required placeholder="Penjelasan detail mengenai kegiatan..." className="h-24"/></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Biaya</Label><Input value={formData.biaya} onChange={e=>setFormData({...formData, biaya: e.target.value})} placeholder="Gratis / Rp..."/></div>
                <div className="space-y-1"><Label>Kontak CP</Label><Input value={formData.kontak} onChange={e=>setFormData({...formData, kontak: e.target.value})} placeholder="08..."/></div>
            </div>
            
            <div className="space-y-1">
                <Label>Fasilitas</Label>
                <Input value={formData.fasilitas} onChange={e=>setFormData({...formData, fasilitas: e.target.value})} placeholder="Pisahkan dengan koma, cth: Snack, Sertifikat, AC"/>
            </div>

            <DialogFooter className="pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Simpan Data</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* --- DETAIL MODAL --- */}
      {selectedEventDetail && (
        <EventDetailModal data={selectedEventDetail} onClose={() => setSelectedEventDetail(null)} />
      )}
    </div>
  )
}

/* =======================
   SUB-COMPONENTS
======================= */

function StatCard({ title, value, icon, bgIcon }: { title: string; value: string; icon: React.ReactNode; bgIcon: string }) {
    return (
      <Card className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4"><p className="text-sm font-medium text-slate-500">{title}</p><div className={`p-2 rounded-lg ${bgIcon}`}>{icon}</div></div>
          <div><h3 className="text-2xl font-bold text-slate-900">{value}</h3></div>
        </CardContent>
      </Card>
    );
}

function EventDetailModal({ data, onClose }: { data: Activity; onClose: () => void }) {
    if (!data) return null;
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">Detail Kegiatan</h2>
                            <Badge variant="outline" className="bg-white">{data.kategori}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">ID: #{data.id}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition"><X className="h-5 w-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="space-y-1"><Label className="text-slate-500 text-xs">Judul</Label><p className="font-medium text-slate-900 text-base">{data.judul}</p></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label className="text-slate-500 text-xs">Tanggal</Label><p className="font-medium text-slate-900">{data.tanggal}</p></div>
                            <div className="space-y-1"><Label className="text-slate-500 text-xs">Waktu</Label><p className="font-medium text-slate-900">{data.waktu}</p></div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label className="text-slate-500 text-xs">Lokasi</Label><p className="font-medium text-slate-900">{data.lokasi}</p></div>
                            <div className="space-y-1"><Label className="text-slate-500 text-xs">Pemateri</Label><p className="font-medium text-slate-900">{data.pemateri}</p></div>
                        </div>
                        {data.tema && <div className="space-y-1"><Label className="text-slate-500 text-xs">Tema</Label><p className="font-medium text-slate-900">{data.tema}</p></div>}
                        <div className="p-3 bg-slate-50 rounded border border-slate-100"><Label className="text-slate-500 text-xs font-bold uppercase">Deskripsi</Label><p className="font-medium text-slate-800 mt-1 whitespace-pre-line">{data.deskripsi}</p></div>
                        {(data.biaya || data.kontak) && <div className="grid grid-cols-2 gap-4 border-t pt-4"><div className="space-y-1"><Label className="text-slate-500 text-xs">Biaya</Label><p className="font-medium text-emerald-600">{data.biaya}</p></div><div className="space-y-1"><Label className="text-slate-500 text-xs">Kontak</Label><p className="font-medium text-slate-900">{data.kontak}</p></div></div>}
                        {data.fasilitas && (
                            <div className="space-y-2 pt-2">
                                <Label className="text-slate-500 text-xs">Fasilitas</Label>
                                <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(data.fasilitas) ? data.fasilitas : String(data.fasilitas).split(',')).map((f: string, i: Key | null | undefined) => (
                                        <Badge key={i} variant="secondary" className="text-xs">{f.trim()}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="px-6 py-4 border-t bg-slate-50 flex justify-end"><Button onClick={onClose} variant="outline">Tutup</Button></div>
            </div>
        </div>
    )
}