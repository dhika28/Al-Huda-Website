"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { 
  Save, RefreshCw, Upload, Plus, Trash2, 
  Building, Target, History, LayoutGrid, Users, 
  Loader2, ImageIcon, AlertTriangle
} from "lucide-react"
// PENTING: Import toast & Toaster
import { toast, Toaster } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

// Pastikan path import ini sesuai dengan struktur folder Anda
import { MosqueProfile, StatItem, SejarahItem, FasilitasItem, StrukturItem } from "@/app/types/masjid"
import { getMosqueProfile, updateMosqueProfile } from "@/lib/api/masjid"

export default function AdminProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // --- INITIAL STATE ---
  const [data, setData] = useState<MosqueProfile>({
    id: 1,
    nama_masjid: "",
    tagline: "",
    deskripsi_hero: "",
    bg_image_url: "",
    visi: "",
    misi: [],
    stats: [],
    sejarah: [],
    fasilitas: [],
    program: [],
    struktur: [],
    alamat: "",
    telepon: "",
    email: "",
    google_maps_url: "",
  })

  const [bgFile, setBgFile] = useState<File | null>(null)
  const [previewBg, setPreviewBg] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const profile = await getMosqueProfile()
      
      if (profile) {
        setData(prev => ({ ...prev, ...profile }))
        if (profile.bg_image_url) {
          setPreviewBg(profile.bg_image_url)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Gagal mengambil data dari server")
    } finally {
      setIsLoading(false)
    }
  }

  // --- HELPER: CONFIRM DELETE TOAST ---
  const confirmDelete = (onConfirm: () => void) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Hapus item ini?
        </div>
        <div className="text-xs text-gray-500 mb-2">
          Item akan hilang dari tampilan. Klik SIMPAN untuk menghapus permanen.
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="destructive" 
            className="h-7 text-xs w-full"
            onClick={() => {
              onConfirm()
              toast.dismiss(t.id)
              toast.success("Item dihapus (Draft). Klik Simpan untuk permanen.", { duration: 3000, icon: '🗑️' })
            }}
          >
            Ya
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs w-full bg-white"
            onClick={() => toast.dismiss(t.id)}
          >
            Batal
          </Button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" })
  }

  // --- HANDLERS UTAMA ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBgFile(file)
      setPreviewBg(URL.createObjectURL(file))
    }
  }

  // --- DYNAMIC ARRAY HANDLERS ---

  // -> MISI
  const handleMisiChange = (idx: number, val: string) => {
    const newMisi = [...(data.misi || [])]
    newMisi[idx] = val
    setData({ ...data, misi: newMisi })
  }
  const addMisi = () => setData({ ...data, misi: [...(data.misi || []), ""] })
  const removeMisi = (idx: number) => {
    confirmDelete(() => {
        const newMisi = (data.misi || []).filter((_, i) => i !== idx)
        setData(prev => ({ ...prev, misi: newMisi }))
    })
  }

  // -> STATS
  const handleStatChange = (idx: number, field: keyof StatItem, val: string) => {
    const newStats = [...(data.stats || [])]
    newStats[idx] = { ...newStats[idx], [field]: val }
    setData({ ...data, stats: newStats })
  }
  const addStat = () => setData({ ...data, stats: [...(data.stats || []), { label: "", value: "" }] })
  const removeStat = (idx: number) => {
    confirmDelete(() => {
        const newStats = (data.stats || []).filter((_, i) => i !== idx)
        setData(prev => ({ ...prev, stats: newStats }))
    })
  }

  // -> SEJARAH
  const handleSejarahChange = (idx: number, field: keyof SejarahItem, val: string) => {
    const newSejarah = [...(data.sejarah || [])]
    newSejarah[idx] = { ...newSejarah[idx], [field]: val }
    setData({ ...data, sejarah: newSejarah })
  }
  const addSejarah = () => setData({ ...data, sejarah: [...(data.sejarah || []), { tahun: "", peristiwa: "", detail: "" }] })
  const removeSejarah = (idx: number) => {
    confirmDelete(() => {
        const newSejarah = (data.sejarah || []).filter((_, i) => i !== idx)
        setData(prev => ({ ...prev, sejarah: newSejarah }))
    })
  }

  // -> FASILITAS
  const handleFasilitasChange = (idx: number, field: keyof FasilitasItem, val: string) => { 
    const newFasilitas = [...(data.fasilitas || [])]
    const item = { ...newFasilitas[idx] } as any 
    item[field] = val
    newFasilitas[idx] = item
    setData({ ...data, fasilitas: newFasilitas })
  }
  const addFasilitas = () => setData({ ...data, fasilitas: [...(data.fasilitas || []), { nama: "", kapasitas: "", deskripsi: "" }] })
  const removeFasilitas = (idx: number) => {
    confirmDelete(() => {
        const newFasilitas = (data.fasilitas || []).filter((_, i) => i !== idx)
        setData(prev => ({ ...prev, fasilitas: newFasilitas }))
    })
  }

  // -> STRUKTUR
  const handleStrukturChange = (idx: number, field: keyof StrukturItem, val: string) => {
    const newStruktur = [...(data.struktur || [])]
    const item = { ...newStruktur[idx] } as any
    item[field] = val
    newStruktur[idx] = item
    setData({ ...data, struktur: newStruktur })
  }
  const addStruktur = () => setData({ ...data, struktur: [...(data.struktur || []), { nama: "", jabatan: "", pendidikan: "", pengalaman: "" }] })
  const removeStruktur = (idx: number) => {
    confirmDelete(() => {
        const newStruktur = (data.struktur || []).filter((_, i) => i !== idx)
        setData(prev => ({ ...prev, struktur: newStruktur }))
    })
  }

  // -> PROGRAM
  const handleProgramCatChange = (idx: number, val: string) => {
    const newProg = [...(data.program || [])]
    newProg[idx] = { ...newProg[idx], kategori: val }
    setData({ ...data, program: newProg })
  }
  const addProgramCat = () => setData({ ...data, program: [...(data.program || []), { kategori: "Kategori Baru", programs: [] }] })
  const removeProgramCat = (idx: number) => {
    confirmDelete(() => {
        const newProg = (data.program || []).filter((_, i) => i !== idx)
        setData(prev => ({ ...prev, program: newProg }))
    })
  }
  
  const handleProgramItemChange = (catIdx: number, progIdx: number, field: string, val: string) => {
    const newProg = [...(data.program || [])]
    const programs = [...newProg[catIdx].programs]
    const item = { ...programs[progIdx] } as any
    item[field] = val
    programs[progIdx] = item
    newProg[catIdx].programs = programs
    setData({ ...data, program: newProg })
  }
  const addProgramItem = (catIdx: number) => {
    const newProg = [...(data.program || [])]
    newProg[catIdx].programs.push({ nama: "", jadwal: "", peserta: "" })
    setData({ ...data, program: newProg })
  }
  const removeProgramItem = (catIdx: number, progIdx: number) => {
    confirmDelete(() => {
        const newProg = [...(data.program || [])]
        newProg[catIdx].programs = newProg[catIdx].programs.filter((_, i) => i !== progIdx)
        setData(prev => ({ ...prev, program: newProg }))
    })
  }

  // --- SUBMIT ---
  const handleSubmit = async () => {
    setIsSaving(true)
    const toastId = toast.loading("Menyimpan perubahan...")

    try {
      const formData = new FormData()
      
      // Append Text
      formData.append("nama_masjid", data.nama_masjid || "")
      formData.append("tagline", data.tagline || "")
      formData.append("deskripsi_hero", data.deskripsi_hero || "")
      formData.append("visi", data.visi || "")
      formData.append("alamat", data.alamat || "")
      formData.append("telepon", data.telepon || "")
      formData.append("email", data.email || "")
      formData.append("google_maps_url", data.google_maps_url || "")
      
      // Image
      formData.append("bg_image_url", data.bg_image_url || "")
      if (bgFile) formData.append("bg_image_file", bgFile)

      // JSON Fields
      formData.append("misi", JSON.stringify(data.misi || []))
      formData.append("stats", JSON.stringify(data.stats || []))
      formData.append("sejarah", JSON.stringify(data.sejarah || []))
      formData.append("fasilitas", JSON.stringify(data.fasilitas || []))
      formData.append("program", JSON.stringify(data.program || []))
      formData.append("struktur", JSON.stringify(data.struktur || []))

      const updatedData = await updateMosqueProfile(formData)
      
      setData(prev => ({ ...prev, ...updatedData }))
      setBgFile(null)
      toast.success("Profil berhasil disimpan!", { id: toastId })

    } catch (error: any) {
      console.error(error)
      toast.error("Gagal menyimpan: " + error.message, { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600"/></div>
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-6 font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil Masjid</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola informasi halaman depan masjid</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isSaving}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Reset
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2" />} Simpan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="utama" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="utama" className="py-2">Utama</TabsTrigger>
          <TabsTrigger value="visimisi" className="py-2">Visi & Misi</TabsTrigger>
          <TabsTrigger value="sejarah" className="py-2">Sejarah</TabsTrigger>
          <TabsTrigger value="fasilitas" className="py-2">Fasilitas</TabsTrigger>
          <TabsTrigger value="program" className="py-2">Program</TabsTrigger>
          <TabsTrigger value="struktur" className="py-2">Struktur</TabsTrigger>
        </TabsList>

        {/* --- TAB UTAMA --- */}
        <TabsContent value="utama" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5"/> Identitas Masjid</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Masjid</Label>
                  <Input name="nama_masjid" value={data.nama_masjid || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input name="tagline" value={data.tagline || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi Hero</Label>
                  <Textarea name="deskripsi_hero" value={data.deskripsi_hero || ""} onChange={handleChange} rows={4} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/> Background & Kontak</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Foto Background</Label>
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-16 bg-slate-100 rounded overflow-hidden border">
                      {previewBg && <img src={previewBg} alt="Preview" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                        <p className="text-xs text-slate-500 mt-1">Disarankan 1920x1080px</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Telepon / WA</Label><Input name="telepon" value={data.telepon || ""} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Email</Label><Input name="email" value={data.email || ""} onChange={handleChange} /></div>
                </div>
                <div className="space-y-2"><Label>Alamat Lengkap</Label><Textarea name="alamat" value={data.alamat || ""} onChange={handleChange} rows={2} /></div>
                <div className="space-y-2">
                    <Label>Google Maps URL (Embed Src)</Label>
                    <Input name="google_maps_url" value={data.google_maps_url || ""} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5"/> Statistik</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(data.stats || []).map((stat, i) => (
                        <div key={i} className="space-y-2 p-3 border rounded bg-slate-50 relative group">
                            <Label className="text-xs">Angka</Label>
                            <Input value={stat.value || ""} onChange={(e) => handleStatChange(i, 'value', e.target.value)} className="bg-white"/>
                            <Label className="text-xs">Label</Label>
                            <Input value={stat.label || ""} onChange={(e) => handleStatChange(i, 'label', e.target.value)} className="bg-white"/>
                            <Button size="icon" variant="ghost" className="text-red-500 absolute top-0 right-0 h-6 w-6 hover:bg-red-50" onClick={() => removeStat(i)}><Trash2 className="h-3 w-3"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" className="h-full min-h-[140px] border-dashed" onClick={addStat}><Plus className="mr-2 h-4 w-4"/> Tambah</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visimisi" className="space-y-4">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5"/> Visi & Misi</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Visi</Label>
                        <Textarea name="visi" value={data.visi || ""} onChange={handleChange} className="min-h-[100px]" />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <Label>Misi</Label>
                        {(data.misi || []).map((item, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="p-2 bg-slate-100 rounded text-sm font-bold w-8 text-center">{i+1}</span>
                                <Input value={item || ""} onChange={(e) => handleMisiChange(i, e.target.value)} />
                                <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeMisi(i)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        ))}
                        <Button size="sm" variant="outline" onClick={addMisi}><Plus className="h-4 w-4 mr-2"/> Tambah Misi</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="sejarah" className="space-y-4">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Sejarah</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {(data.sejarah || []).map((item, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-3 items-start p-4 border rounded-lg bg-slate-50 relative">
                             <div className="w-32 space-y-1"><Label className="text-xs">Tahun</Label><Input value={item.tahun || ""} onChange={(e) => handleSejarahChange(i, 'tahun', e.target.value)} className="bg-white"/></div>
                             <div className="flex-1 space-y-1"><Label className="text-xs">Peristiwa</Label><Input value={item.peristiwa || ""} onChange={(e) => handleSejarahChange(i, 'peristiwa', e.target.value)} className="bg-white"/></div>
                             <div className="flex-1 space-y-1"><Label className="text-xs">Detail</Label><Input value={item.detail || ""} onChange={(e) => handleSejarahChange(i, 'detail', e.target.value)} className="bg-white"/></div>
                             <Button size="icon" variant="ghost" className="text-red-500 mt-6 hover:bg-red-50" onClick={() => removeSejarah(i)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addSejarah}><Plus className="h-4 w-4 mr-2"/> Tambah Sejarah</Button>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- FASILITAS (NO ICON) --- */}
        <TabsContent value="fasilitas" className="space-y-4">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><LayoutGrid className="h-5 w-5"/> Fasilitas</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(data.fasilitas || []).map((item: any, i) => (
                            <div key={i} className="p-4 border rounded-lg space-y-3 bg-white relative">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label className="text-xs">Nama</Label><Input value={item.nama || ""} onChange={(e) => handleFasilitasChange(i, 'nama', e.target.value)} /></div>
                                    <div className="space-y-1"><Label className="text-xs">Kapasitas</Label><Input value={item.kapasitas || ""} onChange={(e) => handleFasilitasChange(i, 'kapasitas', e.target.value)} /></div>
                                </div>
                                <div className="space-y-1"><Label className="text-xs">Deskripsi</Label><Textarea value={item.deskripsi || ""} onChange={(e) => handleFasilitasChange(i, 'deskripsi', e.target.value)} rows={2}/></div>
                                <Button size="icon" variant="ghost" className="text-red-500 absolute top-0 right-2 hover:bg-red-50" onClick={() => removeFasilitas(i)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        ))}
                         <Button variant="outline" className="h-full min-h-[200px] border-dashed" onClick={addFasilitas}><Plus className="h-4 w-4 mr-2"/> Tambah Fasilitas</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- PROGRAM (NO ICON) --- */}
        <TabsContent value="program" className="space-y-4">
             {(data.program || []).map((cat, catIdx) => (
                 <Card key={catIdx} className="border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-4">
                            <Input value={cat.kategori || ""} onChange={(e) => handleProgramCatChange(catIdx, e.target.value)} className="font-bold text-lg h-10 w-full md:w-1/2" placeholder="Nama Kategori" />
                            <Button variant="ghost" size="sm" className="text-red-500 ml-auto hover:bg-red-50" onClick={() => removeProgramCat(catIdx)}><Trash2 className="h-4 w-4"/> Hapus</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 pl-4 border-l">
                            {(cat.programs || []).map((prog: any, progIdx) => (
                                <div key={progIdx} className="grid grid-cols-12 gap-3 items-end border-b pb-3 mb-3 last:border-0 relative">
                                    <div className="col-span-12 md:col-span-4 space-y-1"><Label className="text-xs">Nama</Label><Input value={prog.nama || ""} onChange={(e) => handleProgramItemChange(catIdx, progIdx, 'nama', e.target.value)} /></div>
                                    <div className="col-span-12 md:col-span-4 space-y-1"><Label className="text-xs">Jadwal</Label><Input value={prog.jadwal || ""} onChange={(e) => handleProgramItemChange(catIdx, progIdx, 'jadwal', e.target.value)} /></div>
                                    <div className="col-span-12 md:col-span-3 space-y-1"><Label className="text-xs">Peserta</Label><Input value={prog.peserta || ""} onChange={(e) => handleProgramItemChange(catIdx, progIdx, 'peserta', e.target.value)} /></div>
                                    <div className="col-span-12 md:col-span-1 flex justify-end pb-1"><Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeProgramItem(catIdx, progIdx)}><Trash2 className="h-4 w-4"/></Button></div>
                                </div>
                            ))}
                            <Button size="sm" variant="secondary" onClick={() => addProgramItem(catIdx)}><Plus className="h-3 w-3 mr-2"/> Tambah Item</Button>
                        </div>
                    </CardContent>
                 </Card>
             ))}
             <Button variant="outline" className="w-full border-dashed py-6" onClick={addProgramCat}><Plus className="h-5 w-5 mr-2"/> Tambah Kategori</Button>
        </TabsContent>

        {/* --- STRUKTUR (NO ICON) --- */}
        <TabsContent value="struktur" className="space-y-4">
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Struktur</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(data.struktur || []).map((item: any, i) => (
                            <div key={i} className="p-4 border rounded-lg space-y-3 bg-white relative">
                                <div className="space-y-1"><Label className="text-xs">Jabatan</Label><Input value={item.jabatan || ""} onChange={(e) => handleStrukturChange(i, 'jabatan', e.target.value)} className="font-bold bg-slate-50" /></div>
                                <div className="space-y-1"><Label className="text-xs">Nama</Label><Input value={item.nama || ""} onChange={(e) => handleStrukturChange(i, 'nama', e.target.value)} /></div>
                                <div className="space-y-1"><Label className="text-xs">Pendidikan</Label><Input value={item.pendidikan || ""} onChange={(e) => handleStrukturChange(i, 'pendidikan', e.target.value)} /></div>
                                <div className="space-y-1"><Label className="text-xs">Pengalaman</Label><Input value={item.pengalaman || ""} onChange={(e) => handleStrukturChange(i, 'pengalaman', e.target.value)} /></div>
                                <Button size="icon" variant="ghost" className="text-red-500 absolute top-0 right-2 hover:bg-red-50" onClick={() => removeStruktur(i)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        ))}
                         <Button variant="outline" className="h-full min-h-[250px] border-dashed" onClick={addStruktur}><Plus className="h-4 w-4 mr-2"/> Tambah</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}