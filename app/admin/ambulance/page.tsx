"use client"

import { useState, useEffect } from "react"
import {
  Ambulance,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Siren,
  Search,
  Car,
  Trash2,
  Pencil,
  MoreHorizontal,
  X,
  FileText,
  UserSquare2,
  Ban, 
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
} from "lucide-react"
import { Toaster, toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

// Import API
import { 
  AmbulanceService, 
  type AmbulanceRequest, 
  type AmbulanceRequestPayload,
  type AmbulanceUnit,
  type AmbulanceDriver
} from "@/lib/api/ambulance"

export default function AdminAmbulancePage() {
  const [requests, setRequests] = useState<AmbulanceRequest[]>([])
  const [fleet, setFleet] = useState<AmbulanceUnit[]>([])
  const [drivers, setDrivers] = useState<AmbulanceDriver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter & Search State
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("requests")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false)
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false)
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<AmbulanceRequest | null>(null)

  // Actions State
  const [selectedRequest, setSelectedRequest] = useState<AmbulanceRequest | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<AmbulanceUnit | null>(null)
  const [assignForm, setAssignForm] = useState({ driver: "", unit: "" })

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [reqResponse, fleetResponse, driverResponse] = await Promise.all([
        AmbulanceService.getAll(),
        AmbulanceService.getFleet(),
        AmbulanceService.getDrivers()
      ])
      
      setRequests(reqResponse.data.data || [])
      setFleet(fleetResponse.data.data || [])
      setDrivers(driverResponse.data.data || [])
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Gagal memuat data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Reset Pagination
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, searchTerm, activeTab])

  // --- STATS ---
  const activeRequests = requests.filter(r => r.status === 'dispatched').length
  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const completedRequests = requests.filter(r => r.status === 'completed').length

  // --- HANDLERS ---
  const openAssignModal = (req: AmbulanceRequest) => {
    setSelectedRequest(req)
    setAssignForm({ driver: "", unit: "" })
    setIsAssignModalOpen(true)
  }

  const handleDispatch = async () => {
    if (!selectedRequest || !assignForm.driver || !assignForm.unit) {
      toast.error("Pilih driver dan unit armada")
      return
    }

    try {
      await AmbulanceService.updateStatus(selectedRequest.id, "dispatched", assignForm.driver, assignForm.unit)
      toast.success(`Unit ditugaskan ke ${selectedRequest.patient_name}`)
      setIsAssignModalOpen(false)
      fetchData() 
    } catch (error) {
      toast.error("Gagal menugaskan armada. Cek ketersediaan.")
    }
  }

  const handleUpdateStatus = (id: number, status: string, currentDriver?: string, currentUnit?: string) => {
    toast((t) => (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-700">
                {status === 'completed' ? 'Selesaikan tugas ini?' : 'Batalkan tugas ini?'}
            </p>
            <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.dismiss(t.id)}>Batal</Button>
                <Button 
                    size="sm" 
                    className={`h-7 text-xs text-white ${status === 'completed' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                    onClick={async () => {
                        toast.dismiss(t.id)
                        try {
                            await AmbulanceService.updateStatus(id, status, currentDriver, currentUnit)
                            toast.success(`Status diperbarui: ${status}`)
                            fetchData()
                        } catch (error) {
                            toast.error("Gagal update status")
                        }
                    }}
                >
                    Ya, {status === 'completed' ? 'Selesai' : 'Batal'}
                </Button>
            </div>
        </div>
    ), { duration: 5000, position: 'top-center' })
  }

  const handleDeleteUnit = (id: number) => {
    toast((t) => (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-700">Hapus unit ini permanen?</p>
            <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.dismiss(t.id)}>Batal</Button>
                <Button 
                    size="sm" 
                    className="h-7 text-xs bg-red-600 text-white hover:bg-red-700"
                    onClick={async () => {
                        toast.dismiss(t.id)
                        try {
                            await AmbulanceService.deleteUnit(id)
                            toast.success("Unit dihapus")
                            fetchData()
                        } catch(e) { 
                            toast.error("Gagal menghapus unit") 
                        }
                    }}
                >
                    Hapus
                </Button>
            </div>
        </div>
    ), { icon: <Trash2 className="h-4 w-4 text-red-500" /> })
  }

  const handleDeleteDriver = (id: number) => {
    toast((t) => (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-slate-700">Hapus data driver ini?</p>
            <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.dismiss(t.id)}>Batal</Button>
                <Button 
                    size="sm" 
                    className="h-7 text-xs bg-red-600 text-white hover:bg-red-700"
                    onClick={async () => {
                        toast.dismiss(t.id)
                        try { 
                            await AmbulanceService.deleteDriver(id)
                            toast.success("Driver dihapus")
                            fetchData()
                        } catch { 
                            toast.error("Gagal menghapus driver") 
                        }
                    }}
                >
                    Hapus
                </Button>
            </div>
        </div>
    ), { icon: <Trash2 className="h-4 w-4 text-red-500" /> })
  }

  // --- FORMATTERS ---
  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('id-ID', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
      })
    } catch (e) { return "-" }
  }

  // --- FILTER & PAGINATION ---
  const filteredRequests = requests.filter(r => {
    const searchLower = searchTerm.toLowerCase()
    const name = r.patient_name?.toLowerCase() || ""
    const address = r.pickup_address?.toLowerCase() || ""
    const matchSearch = name.includes(searchLower) || address.includes(searchLower)
    let matchStatus = true
    if (filterStatus !== "all") {
        if (filterStatus === 'dispatched') matchStatus = r.status === 'dispatched'
        else matchStatus = r.status === filterStatus
    }
    return matchSearch && matchStatus
  })

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

  // --- UI CONSTANTS ---
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "dispatched": return "bg-blue-100 text-blue-700 border-blue-200 animate-pulse"
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "cancelled": return "bg-red-100 text-red-700 border-red-200"
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200"
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-6 print:bg-white print:p-0 font-sans">
      <Toaster position="top-center" />

      {/* TOP SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dispatcher Dashboard</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <p>System Operational • {formatDateTime(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Permintaan Baru" value={pendingRequests.toString()} icon={<Siren className="h-5 w-5 text-yellow-600" />} trend="Menunggu konfirmasi" bgIcon="bg-yellow-50" />
        <StatCard title="Sedang Bertugas" value={activeRequests.toString()} icon={<Ambulance className="h-5 w-5 text-blue-600" />} trend="Unit dalam perjalanan" bgIcon="bg-blue-50" />
        <StatCard title="Selesai Diantar" value={completedRequests.toString()} icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} trend="Total riwayat selesai" bgIcon="bg-emerald-50" />
        <StatCard title="Total Armada" value={fleet.length.toString()} icon={<Car className="h-5 w-5 text-slate-600" />} trend={`${fleet.filter(f => f.status === 'available').length} Unit Tersedia`} bgIcon="bg-slate-50" />
      </div>

      {/* TABS & MAIN CONTENT */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

        <div className="border-b border-slate-200 pb-1 print:hidden font-sans">
          <TabsList className="bg-transparent p-0 h-auto gap-6">
            <TabsTrigger value="requests" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Daftar Permintaan</TabsTrigger>
            <TabsTrigger value="fleet" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Data Armada</TabsTrigger>
            <TabsTrigger value="drivers" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Data Driver</TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: REQUESTS */}
        <TabsContent value="requests" className="mt-4 space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Cari nama pasien, alamat..." className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'dispatched', 'completed'].map((status) => (
                    <Button 
                        key={status} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setFilterStatus(status)} 
                        className={`capitalize border h-9 px-4 ${filterStatus === status ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900 hover:text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        {status === 'dispatched' ? 'On Duty' : status}
                    </Button>
                ))}
            </div>
          </div>

          {isLoading ? (
              <div className="text-center py-16 text-slate-500">Memuat data...</div>
          ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 text-slate-500">
                  <div className="flex justify-center mb-2"><Siren className="h-10 w-10 text-slate-200" /></div>
                  <p>Tidak ada data permintaan ambulance.</p>
              </div>
          ) : (
              <>
                <div className="grid gap-4">
                    {getPaginatedData(filteredRequests).map((req) => (
                        <Card key={req.id} className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
                            <CardContent className="p-5">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    {/* INFO PASIEN */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className={`${getStatusBadgeColor(req.status)} font-medium capitalize`}>
                                                {req.status === 'dispatched' ? 'ON DUTY' : req.status}
                                            </Badge>
                                            
                                            {req.request_type === 'urgent' ? (
                                                <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-bold">URGENT</Badge>
                                            ) : (
                                                <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] h-5 px-1.5 font-bold">TERJADWAL</Badge>
                                            )}

                                            <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto lg:ml-0 font-medium"><Clock className="h-3 w-3"/> {formatDateTime(req.created_at)}</span>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{req.patient_name} <span className="text-sm font-normal text-slate-500">({req.patient_gender === 'male' ? 'L' : 'P'}, {req.patient_age} Thn)</span></h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-1.5">
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100"><Phone className="h-3.5 w-3.5 text-slate-400"/> {req.patient_phone}</span>
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100"><User className="h-3.5 w-3.5 text-slate-400"/> CP: {req.contact_person}</span>
                                            </div>
                                        </div>

                                        {/* KONDISI MEDIS (TAMPILAN LIST) */}
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Kondisi Medis</p>
                                            {/* FALLBACK FIELD: Cek condition ATAU medical_condition */}
                                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                                {req.condition || req.medical_condition || "Tidak ada keterangan"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* RUTE */}
                                    <div className="flex-1 lg:border-l lg:border-slate-100 lg:pl-6 space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-1 py-1">
                                            <div className="relative">
                                                <span className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-white border border-emerald-100" />
                                                <Label className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Lokasi Jemput</Label>
                                                <p className="text-sm font-medium text-slate-900 mt-0.5 leading-snug">{req.pickup_address}</p>
                                                {req.landmark && <p className="text-xs text-slate-500 mt-0.5 italic">({req.landmark})</p>}
                                            </div>
                                            <div className="relative">
                                                <span className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full bg-red-500 ring-4 ring-white border border-red-100" />
                                                <Label className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Tujuan</Label>
                                                <p className="text-sm font-medium text-slate-900 mt-0.5 leading-snug">{req.destination}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTION BUTTONS */}
                                    <div className="w-full lg:w-60 flex flex-col justify-center gap-3 lg:pl-6 lg:border-l lg:border-slate-100 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                        {req.status === 'pending' && (
                                            <>
                                                <Button className="bg-blue-600 hover:bg-blue-700 w-full shadow-sm text-white" onClick={() => openAssignModal(req)}>
                                                    <Ambulance className="mr-2 h-4 w-4" /> Proses / Tugaskan
                                                </Button>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" onClick={() => setSelectedRequestDetail(req)} className="w-full text-slate-600 hover:text-slate-800 bg-white"><FileText className="h-4 w-4"/></Button>
                                                    <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 bg-white" onClick={() => handleUpdateStatus(req.id, "cancelled", req.assigned_driver, req.assigned_unit)}>Tolak</Button>
                                                </div>
                                            </>
                                        )}
                                        {req.status === 'dispatched' && (
                                            <div className="space-y-3 w-full">
                                                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wide">Petugas:</p>
                                                    <div className="flex items-center gap-2 text-slate-900 font-medium"><User className="h-3 w-3 text-slate-400"/> {req.assigned_driver || "-"}</div>
                                                    <div className="flex items-center gap-2 text-slate-900 font-medium"><Car className="h-3 w-3 text-slate-400"/> {req.assigned_unit || "-"}</div>
                                                </div>
                                                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full shadow-sm text-white" onClick={() => handleUpdateStatus(req.id, "completed", req.assigned_driver, req.assigned_unit)}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Selesai Tugas
                                                </Button>
                                            </div>
                                        )}
                                        {req.status === 'completed' && (
                                            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100 w-full">
                                                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                                <p className="text-sm font-bold text-slate-700">Tugas Selesai</p>
                                                <p className="text-xs text-slate-400 mt-1">Driver: {req.assigned_driver || "-"}</p>
                                            </div>
                                        )}
                                        {req.status === 'cancelled' && (
                                            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100 w-full">
                                                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                                <p className="text-sm font-bold text-red-700">Dibatalkan</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <PaginationControls totalItems={filteredRequests.length} />
              </>
          )}
        </TabsContent>

        {/* --- TAB 2: FLEET --- */}
        <TabsContent value="fleet" className="mt-4 space-y-4">
          <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div>
                <h3 className="text-lg font-bold text-slate-900">Armada Operasional</h3>
                <p className="text-sm text-slate-500">Kelola unit kendaraan ambulance.</p>
             </div>
             <Button onClick={() => { setSelectedUnit(null); setIsFleetModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Tambah Unit
             </Button>
          </div>
          
          {fleet.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 text-slate-500">
                    <Car className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    Belum ada data armada. Silakan tambah unit baru.
                </div>
           ) : (
               <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {getPaginatedData(fleet).map(unit => {
                       const statusColor = unit.status === 'available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : unit.status === 'busy' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200';
                       return (
                           <div key={unit.id} className="border border-slate-200 rounded-xl p-5 bg-white hover:shadow-md transition-all group relative overflow-hidden">
                               <div className="flex justify-between items-start mb-4">
                                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><Car className="h-6 w-6 text-slate-600" /></div>
                                   <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50"><MoreHorizontal className="h-4 w-4" /></Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => { setSelectedUnit(unit); setIsFleetModalOpen(true) }}><Pencil className="mr-2 h-4 w-4 text-slate-500" /> Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteUnit(unit.id)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                               </div>
                               <div>
                                   <h4 className="font-bold text-lg text-slate-900 leading-tight">{unit.name}</h4>
                                   <p className="font-mono text-sm text-slate-500 mb-3 tracking-wide">{unit.plate_number}</p>
                                   <Badge className={`uppercase rounded-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${statusColor}`}>{unit.status}</Badge>
                                   <div className="mt-4 pt-3 border-t border-slate-100">
                                       <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Fasilitas:</p>
                                       <p className="text-sm text-slate-600 line-clamp-2">{unit.facilities || "-"}</p>
                                   </div>
                               </div>
                           </div>
                       )
                   })}
               </div>
               <PaginationControls totalItems={fleet.length} />
               </>
           )}
        </TabsContent>

        <TabsContent value="drivers" className="mt-4 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">Daftar Driver</h3>
                    <p className="text-sm text-slate-500">Kelola personel driver ambulance.</p>
                </div>
                <Button onClick={() => setIsDriverModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-sans"><Plus className="mr-2 h-4 w-4"/> Tambah Driver</Button>
            </div>
            {drivers.length === 0 ? (
                <div className="col-span-3 text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                    Belum ada driver. Silakan tambah driver baru.
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {getPaginatedData(drivers).map(d => (
                        <Card key={d.id} className="border border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
                            <CardContent className="p-5 flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-slate-100 rounded-full h-fit"><UserSquare2 className="h-6 w-6 text-slate-600"/></div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{d.name}</h4>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 mb-2">
                                            <Phone className="h-3 w-3" /> {d.phone}
                                        </div>
                                        <Badge className={`uppercase text-[10px] ${d.status === 'available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{d.status}</Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDriver(d.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4"/></Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <PaginationControls totalItems={drivers.length} />
                </>
            )}
        </TabsContent>
      </Tabs>

      {/* ================= MODALS ================= */}

      {/* ASSIGN DRIVER (FILTERED) */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Tugaskan Armada</DialogTitle>
                  <DialogDescription>
                      Pilih driver dan unit untuk permintaan dari <strong>{selectedRequest?.patient_name}</strong>.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                  <div className="space-y-2">
                      <Label>Pilih Driver</Label>
                      {/* Filter Driver Available */}
                      <Select onValueChange={(v) => setAssignForm(prev => ({...prev, driver: v}))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Pilih Driver Tersedia" /></SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                              {/* Group: Available */}
                              <div className="px-2 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 mb-1 rounded-sm flex items-center gap-2"><CheckCircle2 className="w-3 h-3"/> Tersedia</div>
                              {drivers.filter(d => d.status === 'available').map(d => (
                                  <SelectItem key={d.id} value={d.name}><span className="font-medium">{d.name}</span></SelectItem>
                              ))}
                              {drivers.filter(d => d.status === 'available').length === 0 && <div className="px-2 py-2 text-xs text-slate-400 italic text-center">Tidak ada driver tersedia</div>}
                              <DropdownMenuSeparator />
                              <div className="px-2 py-1.5 text-xs font-semibold text-red-600 bg-red-50 my-1 rounded-sm flex items-center gap-2"><Ban className="w-3 h-3"/> Sedang Bertugas</div>
                              {drivers.filter(d => d.status === 'busy').map(d => (
                                  <SelectItem key={d.id} value={d.name} disabled className="opacity-50 cursor-not-allowed bg-slate-50">{d.name} <span className="text-[10px] ml-1">(Sibuk)</span></SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Pilih Unit</Label>
                      <Select onValueChange={(v) => setAssignForm(prev => ({...prev, unit: v}))}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Pilih Unit Tersedia" /></SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                              <div className="px-2 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 mb-1 rounded-sm flex items-center gap-2"><CheckCircle2 className="w-3 h-3"/> Tersedia</div>
                              {fleet.filter(u => u.status === 'available').map(u => (
                                  <SelectItem key={u.id} value={u.name}><span className="font-medium">{u.name}</span></SelectItem>
                              ))}
                              {fleet.filter(u => u.status === 'available').length === 0 && <div className="px-2 py-2 text-xs text-slate-400 italic text-center">Tidak ada unit tersedia</div>}
                              <DropdownMenuSeparator />
                              <div className="px-2 py-1.5 text-xs font-semibold text-red-600 bg-red-50 my-1 rounded-sm flex items-center gap-2"><Ban className="w-3 h-3"/> Tidak Tersedia</div>
                              {fleet.filter(u => u.status !== 'available').map(u => (
                                  <SelectItem key={u.id} value={u.name} disabled className="opacity-50 cursor-not-allowed bg-slate-50">{u.name} <span className="text-[10px] ml-1 uppercase">({u.status})</span></SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-100 mt-4">
                  <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Batal</Button>
                  <Button onClick={handleDispatch} className="bg-blue-600 text-white hover:bg-blue-700">Konfirmasi Penugasan</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* DRIVER MODAL */}
      <Dialog open={isDriverModalOpen} onOpenChange={setIsDriverModalOpen}>
          <DialogContent className="sm:max-w-md font-sans">
              <DialogHeader><DialogTitle>Tambah Driver Baru</DialogTitle></DialogHeader>
              <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);
                  const name = String(fd.get('name') || '');
                  const phone = String(fd.get('phone') || '');
                  const data: Omit<AmbulanceDriver, 'id' | 'created_at'> = { name, phone, status: 'available' };
                  try {
                      await AmbulanceService.addDriver(data);
                      toast.success("Driver ditambahkan");
                      setIsDriverModalOpen(false);
                      fetchData();
                  } catch (error) {
                      toast.error("Gagal menambah driver");
                  }
              }}>
                  <div className="space-y-4 pt-2">
                      <div className="space-y-1"><Label>Nama Lengkap</Label><Input name="name" required placeholder="Nama Driver" /></div>
                      <div className="space-y-1"><Label>No. Handphone</Label><Input name="phone" required placeholder="08..." /></div>
                  </div>
                  <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-100 mt-6">
                      <Button variant="outline" type="button" onClick={() => setIsDriverModalOpen(false)}>Batal</Button>
                      <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700">Simpan Driver</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      {/* MODAL LAINNYA */}
      {isManualModalOpen && <ManualBookingModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} onSuccess={fetchData} />}
      <ManageFleetModal isOpen={isFleetModalOpen} onClose={() => { setIsFleetModalOpen(false); setSelectedUnit(null); }} initialData={selectedUnit} onSuccess={fetchData} />
      {selectedRequestDetail && <RequestDetailModal data={selectedRequestDetail} onClose={() => setSelectedRequestDetail(null)} />}

    </div>
  )
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, trend, bgIcon }: { title: string; value: string; icon: React.ReactNode; trend: string; bgIcon: string }) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4"><p className="text-sm font-medium text-slate-500">{title}</p><div className={`p-2 rounded-lg ${bgIcon}`}>{icon}</div></div>
        <div><h3 className="text-2xl font-bold text-slate-900">{value}</h3><p className="text-xs text-slate-400 mt-1">{trend}</p></div>
      </CardContent>
    </Card>
  );
}

// --- DETAIL MODAL WITH FULL SCHEDULE ---
function RequestDetailModal({ data, onClose }: { data: AmbulanceRequest; onClose: () => void }) {
    if (!data) return null;

    const formatFullSchedule = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })
        } catch { return dateStr }
    }

    // Ambil jam dari notes jika ada format [JAM JEMPUT: HH:mm]
    const extractTimeFromNotes = (notes: string) => {
        const match = notes.match(/\[JAM JEMPUT: (.*?)\]/);
        return match ? match[1] : null;
    }

    const scheduledTime = data.notes ? extractTimeFromNotes(data.notes) : null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">Detail Permintaan</h2>
                            <Badge variant="outline" className="bg-white">{data.request_type.toUpperCase()}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">ID: #{data.id}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition"><X className="h-5 w-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${data.status === 'dispatched' ? 'bg-blue-50 border-blue-100 text-blue-800' : data.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                        {data.status === 'completed' ? <CheckCircle2 className="h-5 w-5"/> : <Ambulance className="h-5 w-5"/>}
                        <div><p className="font-bold text-sm uppercase">Status: {data.status}</p>{data.assigned_unit && <p className="text-xs opacity-80">Unit: {data.assigned_unit}</p>}</div>
                    </div>

                    {/* JADWAL (Moved here) */}
                    {data.request_type === 'scheduled' && data.scheduled_date && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h4 className="text-blue-800 font-bold text-sm flex items-center gap-2 mb-3 pb-2 border-b border-blue-200/50">
                                <Calendar className="h-4 w-4" /> Detail Jadwal Penjemputan
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block mb-1">Hari & Tanggal</span>
                                    <p className="text-sm font-bold text-slate-800">{formatFullSchedule(data.scheduled_date)}</p>
                                </div>
                                {scheduledTime && (
                                    <div>
                                        <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block mb-1">Waktu / Jam</span>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">{scheduledTime}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="space-y-1"><Label className="text-slate-500 text-xs">Pasien</Label><p className="font-medium text-slate-900 text-base">{data.patient_name} <span className="text-slate-400 text-sm">({data.patient_age} Thn)</span></p></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><Label className="text-slate-500 text-xs">Kontak</Label><p className="font-medium text-slate-900">{data.patient_phone}</p></div><div className="space-y-1"><Label className="text-slate-500 text-xs">Penanggung Jawab</Label><p className="font-medium text-slate-900">{data.contact_person}</p></div></div>
                        
                        <div className="p-3 bg-red-50 rounded border border-red-100">
                            <Label className="text-red-600 text-xs font-bold uppercase">Kondisi Medis</Label>
                            {/* Fallback Check */}
                            <p className="font-medium text-slate-800 mt-1">{data.condition || data.medical_condition || "Tidak ada keterangan"}</p>
                        </div>
                        
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="relative pl-4 border-l-2 border-slate-200">
                                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                                <Label className="text-xs text-slate-500">Jemput</Label>
                                <p className="text-sm font-medium text-slate-900">{data.pickup_address}</p>
                            </div>
                            <div className="relative pl-4 border-l-2 border-slate-200">
                                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-red-500"></span>
                                <Label className="text-xs text-slate-500">Tujuan</Label>
                                <p className="text-sm font-medium text-slate-900">{data.destination}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t bg-slate-50 flex justify-end"><Button onClick={onClose} variant="outline">Tutup</Button></div>
            </div>
        </div>
    )
}

function ManualBookingModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    // Gunakan scheduled_datetime untuk input datetime-local
    const [scheduledDatetime, setScheduledDatetime] = useState("")
    const [formData, setFormData] = useState({ 
        patient_name: "", patient_phone: "", patient_age: "", patient_gender: "male", 
        medical_condition: "", // Form state
        pickup_address: "", destination: "", landmark: "", contact_person: "", 
        notes: "", request_type: "urgent" 
    })
    const [loading, setLoading] = useState(false)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try {
            const payload: AmbulanceRequestPayload = { 
                ...formData, 
                // MAP FORM STATE KE FIELD API 'condition'
                medical_condition: formData.medical_condition,
                request_type: formData.request_type as "urgent" | "scheduled", 
                patient_age: parseInt(formData.patient_age) || 0, 
            };

            // Handle Schedule Logic (Pisahkan Date & Time)
            if (formData.request_type === 'scheduled' && scheduledDatetime) {
                const [datePart, timePart] = scheduledDatetime.split('T')
                payload.scheduled_date = datePart
                if(timePart) {
                    payload.notes = `[JAM JEMPUT: ${timePart}] ${formData.notes}`
                }
            } else {
                delete payload.scheduled_date
            }

            await AmbulanceService.create(payload); 
            toast.success("Booking berhasil!"); 
            onSuccess(); 
            onClose();
        } catch (error) { toast.error("Gagal membuat booking"); } finally { setLoading(false); }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4"><DialogTitle>Booking Manual Ambulance</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-100">
                        <div className="space-y-1">
                            <Label>Tipe Layanan</Label>
                            <Select onValueChange={v=>setFormData({...formData, request_type: v})} defaultValue="urgent">
                                <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urgent">Urgent (Sekarang)</SelectItem>
                                    <SelectItem value="scheduled">Terjadwal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.request_type === 'scheduled' && (
                            <div className="space-y-1">
                                <Label>Waktu Penjemputan</Label>
                                {/* Input datetime-local untuk admin */}
                                <Input 
                                    type="datetime-local" 
                                    className="bg-white" 
                                    value={scheduledDatetime} 
                                    onChange={e=>setScheduledDatetime(e.target.value)} 
                                    required
                                />
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Nama Pasien</Label><Input value={formData.patient_name} onChange={e=>setFormData({...formData, patient_name: e.target.value})} required/></div>
                        <div className="space-y-1"><Label>No HP</Label><Input value={formData.patient_phone} onChange={e=>setFormData({...formData, patient_phone: e.target.value})} required/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Usia</Label><Input type="number" value={formData.patient_age} onChange={e=>setFormData({...formData, patient_age: e.target.value})} required/></div>
                        <div className="space-y-1">
                            <Label>Gender</Label>
                            <Select onValueChange={v=>setFormData({...formData, patient_gender: v})} defaultValue="male">
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="male">Laki-laki</SelectItem><SelectItem value="female">Perempuan</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <Label>Kondisi Medis</Label>
                        <Textarea 
                            className="h-20" 
                            placeholder="Contoh: Patah tulang..." 
                            value={formData.medical_condition} 
                            onChange={e=>setFormData({...formData, medical_condition: e.target.value})} 
                            required
                        />
                    </div>
                    
                    <div className="space-y-3 border-t pt-4">
                        <div className="space-y-1"><Label className="text-emerald-600 font-bold">Lokasi Jemput</Label><Textarea className="h-16" value={formData.pickup_address} onChange={e=>setFormData({...formData, pickup_address: e.target.value})} required/></div>
                        <div className="space-y-1"><Label className="text-slate-600 font-bold">Tujuan</Label><Input value={formData.destination} onChange={e=>setFormData({...formData, destination: e.target.value})} required/></div>
                    </div>
                    <div className="space-y-1"><Label>Penanggung Jawab</Label><Input value={formData.contact_person} onChange={e=>setFormData({...formData, contact_person: e.target.value})} required/></div>
                    <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-100 mt-6"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={loading}>Simpan Booking</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ManageFleetModal({ isOpen, onClose, initialData, onSuccess }: { isOpen: boolean, onClose: () => void, initialData: AmbulanceUnit | null, onSuccess: () => void }) {
    const [formData, setFormData] = useState({ name: "", plate_number: "", status: "available", facilities: "" })
    const [loading, setLoading] = useState(false)
    useEffect(() => { if(initialData) setFormData({ name: initialData.name, plate_number: initialData.plate_number, status: initialData.status, facilities: initialData.facilities }); else setFormData({ name: "", plate_number: "", status: "available", facilities: "" }) }, [initialData, isOpen])
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { if(initialData) { await AmbulanceService.updateUnit(initialData.id, formData as any); toast.success("Unit diperbarui"); } else { await AmbulanceService.addUnit(formData as any); toast.success("Unit ditambahkan"); } onSuccess(); onClose(); } catch(e) { toast.error("Gagal menyimpan unit"); } finally { setLoading(false); }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md font-sans">
                <DialogHeader className="border-b pb-4"><DialogTitle>{initialData ? "Edit Armada" : "Tambah Armada Baru"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-1"><Label>Nama Unit</Label><Input placeholder="Cth: Ambulance 01 (APV)" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required/></div>
                    <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><Label>Plat Nomor</Label><Input placeholder="DK ...." value={formData.plate_number} onChange={e=>setFormData({...formData, plate_number: e.target.value})} required/></div><div className="space-y-1"><Label>Status Awal</Label><Select value={formData.status} onValueChange={v=>setFormData({...formData, status: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent className="font-sans"><SelectItem value="available">Tersedia</SelectItem><SelectItem value="busy">Sedang Tugas</SelectItem><SelectItem value="maintenance">Perbaikan</SelectItem></SelectContent></Select></div></div>
                    <div className="space-y-1"><Label>Fasilitas</Label><Textarea className="h-24" placeholder="Oksigen, Tandu..." value={formData.facilities} onChange={e=>setFormData({...formData, facilities: e.target.value})}/></div>
                    <DialogFooter className="bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-100 mt-6"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" disabled={loading} className="bg-emerald-600 text-white hover:bg-emerald-700">Simpan Data</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}