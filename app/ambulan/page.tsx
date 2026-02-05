"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Truck,
  Phone,
  Calendar,
  CheckCircle,
  Shield,
  Activity,
  Landmark,
  Clock,
  MapPin,
  Hospital,
  User,
  Map,
  FileText,
  Send
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// --- PENTING: MENGGUNAKAN LIBRARY YANG SAMA DENGAN AUTH PAGE ANDA ---
import { toast, Toaster } from "react-hot-toast"

import { AmbulanceService } from "@/lib/api/ambulance"
import type { AmbulanceRequestPayload } from "@/app/types/ambulance"

type AmbulanceRequestType = "urgent" | "scheduled"

interface AmbulanceForm
  extends Omit<AmbulanceRequestPayload, "request_type" | "patient_gender"> {
  scheduled_date?: string
  patient_gender: string
}

export default function AmbulanPage() {
  const [loading, setLoading] = useState(false)
  const [requestType, setRequestType] = useState<AmbulanceRequestType | null>(null)

  const [form, setForm] = useState<AmbulanceForm>({
    patient_name: "",
    patient_phone: "",
    patient_age: 0,
    patient_gender: "",
    pickup_address: "",
    landmark: "",
    destination: "",
    contact_person: "",
    medical_condition: "",
    notes: "",
  })

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // --- LOGIC UTAMA ---
  const handleProcess = async () => {
    // 1. VALIDASI
    if (!requestType) {
      toast.error("Mohon pilih jenis layanan (Mendesak / Terjadwal)")
      return
    }

    if (
      !form.patient_name ||
      !form.patient_phone ||
      !form.pickup_address ||
      !form.destination ||
      !form.patient_gender ||
      !form.patient_age
    ) {
      toast.error("Data belum lengkap! Cek Nama, Telp, Alamat, dll.")
      return
    }

    if (requestType === "scheduled" && !form.scheduled_date) {
      toast.error("Tanggal penjemputan wajib diisi")
      return
    }

    // 2. KIRIM KE SERVER
    const loadingToast = toast.loading("Mengirim permintaan...")
    setLoading(true)

    try {
      const payload: any = {
        ...form,
        request_type: requestType,
        patient_age: Number(form.patient_age),
      }

      // Format Tanggal YYYY-MM-DD
      if (requestType === "scheduled" && form.scheduled_date) {
        const parts = form.scheduled_date.split("T")
        if (parts.length >= 1) payload.scheduled_date = parts[0]
        if (parts.length >= 2) payload.notes = `[JAM JEMPUT: ${parts[1]}] ${payload.notes || ""}`
      } else {
        delete payload.scheduled_date
      }

      await AmbulanceService.create(payload)

      // 3. SUKSES
      toast.dismiss(loadingToast)
      toast.success("Permintaan Berhasil Dikirim!", { duration: 5000 })

      // Reset Form
      setForm({
        patient_name: "",
        patient_phone: "",
        pickup_address: "",
        landmark: "",
        destination: "",
        patient_age: 0,
        patient_gender: "",
        contact_person: "",
        medical_condition: "",
        notes: "",
      })
      setRequestType(null)

    } catch (error: any) {
      console.error(error)
      toast.dismiss(loadingToast)
      
      const errorMsg = error?.response?.data?.error || "Gagal mengirim data. Coba lagi.";
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const serviceTypes = [
    {
      id: "urgent",
      title: "Mendesak",
      icon: <Activity className="h-6 w-6" />,
      color: "bg-orange-500",
      bgHover: "hover:border-orange-300",
      activeRing: "ring-2 ring-orange-500 bg-orange-50",
      responseTime: "Respon Cepat",
    },
    {
      id: "scheduled",
      title: "Terjadwal",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-blue-500",
      bgHover: "hover:border-blue-300",
      activeRing: "ring-2 ring-blue-500 bg-blue-50",
      responseTime: "Sesuai Jadwal",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-10">
      {/* TOASTER DARI REACT-HOT-TOAST (PASTI MUNCUL) */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Truck className="h-6 w-6 text-red-600 hidden md:block" />
              Layanan Ambulance
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Layanan gratis untuk umat & masyarakat umum
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: FORM */}
        <div className="lg:col-span-2">
          <Card className="border-t-4 border-t-red-600 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Form Permintaan</CardTitle>
              <CardDescription>
                Isi data pasien dan lokasi dengan akurat.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              
              {/* 1. PILIH JENIS LAYANAN */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Jenis Layanan <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serviceTypes.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setRequestType(s.id as any)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-center gap-4 ${
                        requestType === s.id ? s.activeRing : `bg-white ${s.bgHover}`
                      }`}
                    >
                      <div className={`${s.color} text-white p-3 rounded-full shadow-sm`}>
                        {s.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{s.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{s.responseTime}</p>
                      </div>
                      {requestType === s.id && (
                        <CheckCircle className="ml-auto h-5 w-5 text-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {requestType === "scheduled" && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-in fade-in zoom-in-95">
                  <Label className="text-blue-800">Tanggal & Jam Penjemputan <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    className="mt-2 bg-white"
                    onChange={(e) => handleChange("scheduled_date", e.target.value)}
                  />
                </div>
              )}

              <Separator />

              {/* 2. DATA PASIEN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-base font-semibold">Data Pasien</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Pasien <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="Nama lengkap pasien"
                      value={form.patient_name}
                      onChange={(e) => handleChange("patient_name", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon / WA <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="0812xxxx"
                      type="tel"
                      value={form.patient_phone}
                      onChange={(e) => handleChange("patient_phone", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Usia <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      placeholder="Contoh: 45"
                      value={form.patient_age || ""}
                      onChange={(e) => handleChange("patient_age", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.patient_gender}
                      onChange={(e) => handleChange("patient_gender", e.target.value)}
                    >
                      <option value="">- Pilih -</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kondisi Medis / Keluhan</Label>
                  <Textarea 
                    placeholder="Jelaskan kondisi pasien (bisa duduk/berbaring, sesak nafas, kecelakaan, dll)"
                    value={form.medical_condition}
                    onChange={(e) => handleChange("medical_condition", e.target.value)} 
                  />
                </div>
              </div>

              <Separator />

              {/* 3. LOKASI */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-base font-semibold">Lokasi & Tujuan</Label>
                </div>

                <div className="space-y-2">
                  <Label>Alamat Penjemputan <span className="text-red-500">*</span></Label>
                  <Textarea 
                    placeholder="Alamat lengkap, RT/RW, Desa..."
                    className="min-h-[80px]"
                    value={form.pickup_address}
                    onChange={(e) => handleChange("pickup_address", e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Patokan
                    <span className="text-xs text-muted-foreground font-normal">(Agar driver mudah menemukan lokasi)</span>
                  </Label>
                  <Input 
                    placeholder="Contoh: Depan Indomaret, Rumah Pagar Hitam"
                    value={form.landmark}
                    onChange={(e) => handleChange("landmark", e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tujuan (RS / Klinik / Rumah) <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="Contoh: RSUD Tabanan"
                      value={form.destination}
                      onChange={(e) => handleChange("destination", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Penanggung Jawab (Di Lokasi)</Label>
                    <Input 
                      placeholder="Nama keluarga yang mendampingi"
                      value={form.contact_person}
                      onChange={(e) => handleChange("contact_person", e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Catatan Tambahan
                </Label>
                <Textarea 
                  placeholder="Instruksi khusus..."
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)} 
                />
              </div>

              {/* BUTTON SUBMIT */}
              <Button
                type="button" 
                className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg shadow-lg shadow-red-100"
                disabled={loading}
                onClick={handleProcess}
              >
                {loading ? (
                  "Mengirim Data..."
                ) : (
                  <>
                    Kirim Permintaan
                  </>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: SIDEBAR */}
        <div className="space-y-6">
          <Card className="bg-red-50 border-red-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
                <Phone className="h-5 w-5" /> Kontak Darurat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-white p-4 rounded-xl border border-red-100">
                <p className="text-sm text-slate-500 mb-1">Call Center 24 Jam</p>
                <p className="text-2xl font-bold text-red-600 tracking-wider">
                  0812-3456-7890
                </p>
              </div>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => window.open("tel:+6281234567890")}
              >
                Telepon Sekarang
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-slate-500" /> Standar Pelayanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Unit Ambulance Standar Medis",
                "Oksigen & P3K Lengkap",
                "Driver Terlatih & Berpengalaman",
                "Pendampingan Relawan (Jika tersedia)",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-slate-600">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-blue-800">
                <Landmark className="h-5 w-5" /> Ambulance Masjid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-900/80">
              <p>
                Layanan sosial milik masjid untuk membantu jamaah
                dan masyarakat sekitar yang membutuhkan transportasi medis.
              </p>
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4" />
                Area Layanan: Dalam & Luar Kota
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4" />
                Siaga 24 Jam
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hospital className="h-5 w-5 text-slate-500" /> Rujukan Umum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 list-disc pl-4">
                <li>RSUD Kabupaten Tabanan</li>
                <li>RS Kasih Ibu Tabanan</li>
                <li>BRSU Tabanan</li>
                <li>Klinik & Puskesmas Terdekat</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}