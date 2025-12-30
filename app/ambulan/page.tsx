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
  AlertTriangle,
  Hospital,
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

import { AmbulanceService } from "@/lib/api/ambulance"
import type { AmbulanceRequestPayload } from "@/app/types/ambulance"

type AmbulanceRequestType = "urgent" | "scheduled"

interface AmbulanceForm
  extends Omit<AmbulanceRequestPayload, "request_type"> {
  scheduled_date?: string
}

export default function AmbulanPage() {
  const [loading, setLoading] = useState(false)
  const [requestType, setRequestType] =
    useState<AmbulanceRequestType | null>(null)

  const [form, setForm] = useState<AmbulanceForm>({
    patient_name: "",
    patient_phone: "",
    pickup_address: "",
    destination: "",
  })

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!requestType) return alert("Pilih jenis layanan")

    if (
      !form.patient_name ||
      !form.patient_phone ||
      !form.pickup_address ||
      !form.destination
    ) {
      return alert("Lengkapi data wajib")
    }

    if (requestType === "scheduled" && !form.scheduled_date) {
      return alert("Tanggal pemesanan wajib diisi")
    }

    setLoading(true)
    try {
      const payload: any = {
        ...form,
        request_type: requestType,
      }

      if (requestType !== "scheduled") {
        delete payload.scheduled_date
      }

      await AmbulanceService.create(payload)

      alert("Permintaan ambulance berhasil dikirim 🚑")

      setForm({
        patient_name: "",
        patient_phone: "",
        pickup_address: "",
        destination: "",
      })
      setRequestType(null)
    } catch {
      alert("Gagal mengirim permintaan")
    } finally {
      setLoading(false)
    }
  }

  const serviceTypes = [
    {
      id: "urgent",
      title: "Mendesak",
      icon: <Activity className="h-7 w-7" />,
      color: "bg-orange-500",
      responseTime: "15–30 menit",
    },
    {
      id: "scheduled",
      title: "Terjadwal",
      icon: <Calendar className="h-7 w-7" />,
      color: "bg-blue-500",
      responseTime: "Sesuai jadwal",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              Layanan Ambulance Masjid
            </h1>
            <p className="text-sm text-muted-foreground">
              Gratis & Siaga untuk Jamaah dan Masyarakat
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="text-red-600" />
                Form Permintaan Ambulance
              </CardTitle>
              <CardDescription>
                Pastikan data diisi dengan benar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* JENIS LAYANAN */}
              <div>
                <Label className="font-semibold">Jenis Layanan</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {serviceTypes.map((s) => (
                    <Card
                      key={s.id}
                      onClick={() => setRequestType(s.id as any)}
                      className={`cursor-pointer transition ${
                        requestType === s.id
                          ? "ring-2 ring-red-500"
                          : "hover:border-red-300"
                      }`}
                    >
                      <CardContent className="p-4 text-center space-y-2">
                        <div
                          className={`${s.color} text-white p-3 rounded-full inline-flex`}
                        >
                          {s.icon}
                        </div>
                        <p className="font-semibold">{s.title}</p>
                        <Badge variant="outline">
                          {s.responseTime}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {requestType === "scheduled" && (
                <div>
                  <Label>Tanggal Pemesanan</Label>
                  <Input
                    type="date"
                    onChange={(e) =>
                      handleChange("scheduled_date", e.target.value)
                    }
                  />
                </div>
              )}

              {/* DATA PASIEN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nama Pasien</Label>
                  <Input onChange={(e) => handleChange("patient_name", e.target.value)} />
                </div>
                <div>
                  <Label>No. Telepon</Label>
                  <Input onChange={(e) => handleChange("patient_phone", e.target.value)} />
                </div>
                <div>
                  <Label>Usia</Label>
                  <Input
                    type="number"
                    onChange={(e) =>
                      handleChange("patient_age", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label>Jenis Kelamin</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    onChange={(e) =>
                      handleChange("patient_gender", e.target.value)
                    }
                  >
                    <option value="">Pilih</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Kondisi Medis</Label>
                <Textarea onChange={(e) => handleChange("medical_condition", e.target.value)} />
              </div>

              <div>
                <Label>Alamat Penjemputan</Label>
                <Textarea onChange={(e) => handleChange("pickup_address", e.target.value)} />
              </div>

              <div>
                <Label>Tujuan</Label>
                <Input onChange={(e) => handleChange("destination", e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Landmark</Label>
                  <Input onChange={(e) => handleChange("landmark", e.target.value)} />
                </div>
                <div>
                  <Label>Penanggung Jawab</Label>
                  <Input onChange={(e) => handleChange("contact_person", e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Catatan Tambahan</Label>
                <Textarea onChange={(e) => handleChange("notes", e.target.value)} />
              </div>

              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? "Mengirim..." : "Kirim Permintaan"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR – TOTAL 5 CARD */}
        <div className="space-y-6">
          {/* CARD 1 */}
          <Card className="bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Phone /> Kontak Darurat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-3xl font-bold text-red-600">
                0812-3456-7890
              </p>
              <Button
                className="w-full bg-red-600"
                onClick={() => window.open("tel:+6281234567890")}
              >
                Hubungi Sekarang
              </Button>
            </CardContent>
          </Card>

          {/* CARD 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield /> Fasilitas Ambulance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                "Peralatan medis standar",
                "Driver & relawan terlatih",
                "Siap rujukan rumah sakit",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CARD 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark /> Ambulance Masjid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Layanan sosial milik masjid untuk membantu jamaah
                dan masyarakat sekitar tanpa biaya.
              </p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Area Desa & Sekitarnya
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Siaga 24 Jam
              </div>
            </CardContent>
          </Card>

          {/* CARD 4 – PROSEDUR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle /> Ketentuan Layanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Prioritas untuk kondisi darurat</p>
              <p>• Bukan pengganti UGD rumah sakit</p>
              <p>• Wajib data pasien jelas</p>
            </CardContent>
          </Card>

          {/* CARD 5 – RUJUKAN */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital /> Rujukan Rumah Sakit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>RSUD Kabupaten</p>
              <p>RS Swasta Terdekat</p>
              <p>Klinik & Puskesmas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
