"use client"

import { useEffect, useMemo, useState } from "react"
import { ActivityService } from "@/lib/api/activity"
import { Activity } from "@/app/types/activity"
import { toast, Toaster } from "react-hot-toast"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
  Calendar,
  Clock,
  MapPin,
  Search,
  User,
  Phone,
  Tag,
  Info,
  Share2,
  Copy,
  MessageCircle,
  ArrowRight,
  Filter,
  ListFilter,
  Check
} from "lucide-react"

import { useRouter } from "next/navigation" 
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function KegiatanPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  // STATE FILTER & SORT
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua")
  const [sortOption, setSortOption] = useState<"terdekat" | "terbaru">("terdekat")
  
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Kategori Tetap Sesuai Request
  const CATEGORIES = ["Semua", "Kajian", "Pendidikan", "Sosial", "Seminar", "Pelatihan"]

  useEffect(() => {
    ActivityService.getAll()
      .then((res: any) => {
        const items: Activity[] = res?.data ?? res
        setActivities(items || [])
      })
      .catch(console.error)
  }, [])

  // LOGIC FILTER & SORTING (Advanced)
  const filteredActivities = useMemo(() => {
    // 1. Filter Pencarian & Kategori
    let result = activities.filter((a) => {
      const matchSearch = a.judul.toLowerCase().includes(searchTerm.toLowerCase())
      // Normalisasi kategori agar tidak case-sensitive
      const activityCategory = a.kategori ? a.kategori.trim() : "Umum"
      const matchCategory = selectedCategory === "Semua" || 
                            activityCategory.toLowerCase() === selectedCategory.toLowerCase()
      
      return matchSearch && matchCategory
    })

    // 2. Sorting
    result = result.sort((a, b) => {
      if (sortOption === "terdekat") {
        // Urutkan berdasarkan Tanggal Kegiatan (Ascending: Tanggal dekat duluan)
        const dateA = a.tanggal ? new Date(a.tanggal).getTime() : Number.MAX_SAFE_INTEGER
        const dateB = b.tanggal ? new Date(b.tanggal).getTime() : Number.MAX_SAFE_INTEGER
        return dateA - dateB
      } else {
        // Urutkan berdasarkan ID (Descending: ID besar = Baru dibuat)
        return b.id - a.id
      }
    })

    return result
  }, [activities, searchTerm, selectedCategory, sortOption])

  const openDetail = (activity: Activity) => {
    setSelectedActivity(activity)
    setIsDialogOpen(true)
  }

  // Helper Format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
        })
    } catch (e) {
        return dateString
    }
  }

  const getDateDay = (dateString?: string) => {
    if (!dateString) return ""
    try { return new Date(dateString).getDate() } catch (e) { return "" }
  }

  const getDateMonth = (dateString?: string) => {
    if (!dateString) return ""
    try { 
        return new Date(dateString).toLocaleDateString("id-ID", { month: "short" }).toUpperCase() 
    } catch (e) { return "" }
  }

  // === FUNGSI SHARE ===
  const getShareText = () => {
    if (!selectedActivity) return ""
    return `*INFO KEGIATAN MASJID AL-HUDA* 🕌\n\n*${selectedActivity.judul}*\n📅 ${formatDate(selectedActivity.tanggal)}\n⏰ ${selectedActivity.waktu} WITA\n📍 ${selectedActivity.lokasi}\n\nSilakan hadir!`.trim()
  }

  const shareToWhatsApp = () => {
    const text = getShareText()
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const copyToClipboard = () => {
    const text = getShareText()
    navigator.clipboard.writeText(text)
    toast.success("Info disalin!", { icon: '📋', style: { borderRadius: '10px', background: '#333', color: '#fff' } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 pb-12 font-sans">
      <Toaster />
      <header className="bg-white border-b">
              <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Informasi Kegiatan</h1>
                  <p className="text-sm text-muted-foreground">
                    Lihat dan ikuti berbagai kegiatan bermanfaat di Masjid Al-Huda.
                  </p>
                </div>
              </div>
      </header>

      {/* === HERO SECTION (Deep Green Theme) === */}
      <div className="relative bg-[#064e3b] pt-28 pb-40 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
            {/* 1. Ganti src dengan lokasi gambar Anda (simpan di folder public) */}
            <img 
                src="/bg-alhuda.jpeg" 
                alt="Background Masjid" 
                className="w-full h-full object-cover"
            />
            
            {/* 2. Overlay Gradient Hijau Gelap (Supaya tulisan tetap terbaca jelas) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4 px-3 py-1 text-sm hover:bg-emerald-500/30 backdrop-blur-sm">
                    Agenda Masjid Al-Huda
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
                    Temukan Kegiatan,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                        Pererat Ukhuwah Islamiyah.
                    </span>
                </h1>
            </div>

            {/* SEARCH BAR (Floating between Hero & Content) */}
            <div className="absolute mt-11 left-6 right-6 z-30">
                <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md border border-white/40 p-2 rounded-xl flex flex-col md:flex-row gap-2 shadow-2xl shadow-emerald-900/10">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                            placeholder="Cari kajian subuh, santunan, atau nama ustadz..."
                            className="pl-12 h-14 bg-transparent border-none text-gray-700 placeholder:text-gray-400 focus-visible:ring-0 text-base w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="hidden md:block w-px bg-gray-200 my-3 mx-2"></div>
                    <Button className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-base font-bold shadow-lg shadow-emerald-600/20 transition-all">
                        Cari Kegiatan
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* === CONTENT SECTION === */}
      <div className="container mx-auto px-6 mt-10 relative z-20">
        
        {/* Toolbar: Title & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Jadwal Kegiatan</h2>
                <p className="text-gray-500 mt-1">Ikuti kegiatan bermanfaat untuk kemajuan umat.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                {/* 1. FILTER KATEGORI */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 h-10 px-4 rounded-lg shadow-sm font-medium">
                            <Filter className="mr-2 h-4 w-4" /> 
                            {selectedCategory === "Semua" ? "Semua Kategori" : selectedCategory}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-100 p-1.5">
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs text-gray-500 uppercase tracking-wider">Kategori</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        {CATEGORIES.map((cat) => (
                            <DropdownMenuItem 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)}
                                className={`cursor-pointer flex justify-between py-2.5 px-3 rounded-lg mb-0.5 ${selectedCategory === cat ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-600"}`}
                            >
                                {cat}
                                {selectedCategory === cat && <Check className="h-4 w-4 text-emerald-600" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 2. FILTER URUTAN (SORT) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 h-10 px-4 rounded-lg shadow-sm font-medium">
                            <ListFilter className="mr-2 h-4 w-4" /> 
                            {sortOption === "terdekat" ? "Waktu Terdekat" : "Baru Ditambahkan"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-100 p-1.5">
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs text-gray-500 uppercase tracking-wider">Urutkan</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem 
                            onClick={() => setSortOption("terdekat")} 
                            className={`cursor-pointer flex justify-between py-2.5 px-3 rounded-lg mb-0.5 ${sortOption === "terdekat" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-600"}`}
                        >
                            Waktu Terdekat
                            {sortOption === "terdekat" && <Check className="h-4 w-4 text-emerald-600" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => setSortOption("terbaru")} 
                            className={`cursor-pointer flex justify-between py-2.5 px-3 rounded-lg ${sortOption === "terbaru" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-600"}`}
                        >
                            Baru Ditambahkan
                            {sortOption === "terbaru" && <Check className="h-4 w-4 text-emerald-600" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {/* EMPTY STATE */}
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ada kegiatan ditemukan</h3>
            <p className="text-gray-500 max-w-md mx-auto">Kami tidak menemukan kegiatan yang cocok dengan pencarian atau filter Anda.</p>
            <Button variant="link" onClick={() => {setSelectedCategory("Semua"); setSearchTerm("")}} className="text-emerald-600 mt-4 font-semibold text-base">
                Reset Semua Filter
            </Button>
          </div>
        ) : (
          // GRID KEGIATAN
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((k) => (
              
              <Card 
                key={k.id} 
                className="group border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 bg-white rounded-2xl overflow-hidden flex flex-col h-full hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    {k.gambar ? (
                        <img
                            src={k.gambar}
                            alt={k.judul}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                            <Tag className="h-12 w-12 text-emerald-200" />
                        </div>
                    )}
                    
                    {/* Date Badge (Clean White Box) */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-md rounded-xl p-2 text-center min-w-[60px] border border-gray-100/50">
                        <span className="block text-xl font-extrabold text-gray-900 leading-none">
                            {getDateDay(k.tanggal)}
                        </span>
                        <span className="block text-[10px] font-bold text-emerald-600 uppercase mt-1 tracking-wider">
                            {getDateMonth(k.tanggal)}
                        </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-emerald-900/80 hover:bg-emerald-900 backdrop-blur text-white border-0 px-3 py-1 font-medium shadow-md">
                            {k.kategori || "Umum"}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col flex-1 p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                        {k.judul}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-5">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                            <Clock className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="font-medium text-gray-700">{k.waktu}</span>
                        </div>
                        {k.biaya && (
                             <div className="flex items-center gap-1.5 px-2 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span className="font-semibold text-emerald-700">{k.biaya}</span>
                             </div>
                        )}
                    </div>

                    {/* Footer Row */}
                    <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500 max-w-[70%]">
                            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="truncate">{k.lokasi}</span>
                        </div>
                        
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-emerald-600 font-bold hover:bg-emerald-50 hover:text-emerald-700 p-0 h-auto px-3 py-1.5 rounded-lg transition-all"
                            onClick={() => openDetail(k)}
                        >
                            Detail <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                    </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* === DETAIL DIALOG === */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden sm:rounded-3xl gap-0 shadow-2xl border-0">
            {selectedActivity && (
                <>
                    <div className="relative w-full h-56 bg-emerald-950">
                        {selectedActivity.gambar ? (
                            <img src={selectedActivity.gambar} alt={selectedActivity.judul} className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="w-full h-full bg-emerald-900 flex items-center justify-center"><Tag className="h-16 w-16 text-white/20" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-5 left-6 right-6">
                            <Badge className="bg-emerald-500 text-white border-0 mb-2 hover:bg-emerald-600 shadow-lg">{selectedActivity.kategori}</Badge>
                            <DialogTitle className="text-2xl font-bold text-white leading-tight shadow-black drop-shadow-md">
                                {selectedActivity.judul}
                            </DialogTitle>
                        </div>
                    </div>

                    <ScrollArea className="max-h-[60vh]">
                        <div className="p-6 space-y-6">
                            {/* Grid Detail */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/80">
                                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] uppercase font-bold mb-1">
                                        <Calendar className="h-3 w-3" /> Tanggal
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm">{formatDate(selectedActivity.tanggal)}</p>
                                </div>
                                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/80">
                                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] uppercase font-bold mb-1">
                                        <Clock className="h-3 w-3" /> Waktu
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm">{selectedActivity.waktu} WITA</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 mt-0.5">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Lokasi</p>
                                        <p className="text-sm font-medium text-gray-900 leading-snug">{selectedActivity.lokasi}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 mt-0.5">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Pemateri</p>
                                        <p className="text-sm font-medium text-gray-900 leading-snug">{selectedActivity.pemateri || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                    <Info className="h-4 w-4 text-emerald-500" /> Deskripsi Kegiatan
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {selectedActivity.deskripsi}
                                </p>
                            </div>

                            {(selectedActivity.biaya || selectedActivity.kontak) && (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {selectedActivity.biaya && (
                                        <div className="flex-1 bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase">Biaya</p>
                                            <p className="text-lg font-bold text-emerald-900">{selectedActivity.biaya}</p>
                                        </div>
                                    )}
                                    {selectedActivity.kontak && (
                                        <div className="flex-1 bg-teal-50 rounded-xl p-3 border border-teal-100 text-center">
                                            <p className="text-[10px] text-teal-600 font-bold uppercase">Kontak</p>
                                            <p className="text-lg font-bold text-teal-900">{selectedActivity.kontak}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-4 border-t bg-white flex justify-between items-center gap-3">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-6 border-gray-200 text-gray-600">Tutup</Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 px-6 shadow-lg shadow-emerald-200">
                                    <Share2 className="h-4 w-4" /> Bagikan
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-48 p-1">
                                <DropdownMenuItem onClick={shareToWhatsApp} className="gap-3 cursor-pointer p-2.5 rounded-lg focus:bg-green-50 focus:text-green-700">
                                    <div className="bg-green-100 p-1.5 rounded-full"><MessageCircle className="h-4 w-4 text-green-600" /></div>
                                    <span className="font-medium">WhatsApp</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={copyToClipboard} className="gap-3 cursor-pointer p-2.5 rounded-lg focus:bg-gray-50">
                                    <div className="bg-gray-100 p-1.5 rounded-full"><Copy className="h-4 w-4 text-gray-600" /></div>
                                    <span className="font-medium">Salin Info</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  )
}