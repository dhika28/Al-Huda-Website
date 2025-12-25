"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Truck,
  Phone,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Shield,
  Activity,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AmbulanPage() {
  const [requestType, setRequestType] = useState("")
  const [urgencyLevel, setUrgencyLevel] = useState("")

  const serviceTypes = [
    {
      id: "emergency",
      title: "Darurat",
      description: "Kondisi mengancam jiwa, butuh penanganan segera",
      icon: <AlertTriangle className="h-8 w-8" />,
      color: "bg-red-500",
      responseTime: "5-10 menit",
    },
    {
      id: "urgent",
      title: "Mendesak",
      description: "Kondisi serius tapi tidak mengancam jiwa",
      icon: <Activity className="h-8 w-8" />,
      color: "bg-orange-500",
      responseTime: "15-30 menit",
    },
    {
      id: "scheduled",
      title: "Terjadwal",
      description: "Transportasi medis untuk kontrol atau rujukan",
      icon: <Calendar className="h-8 w-8" />,
      color: "bg-blue-500",
      responseTime: "Sesuai jadwal",
    },
  ]

  const ambulanceFeatures = [
    "Peralatan medis lengkap",
    "Tenaga medis berpengalaman",
    "Tersedia 24/7",
    "Gratis untuk jamaah",
    "Koordinasi dengan rumah sakit",
    "Dokumentasi perjalanan",
  ]

  const recentServices = [
    { time: "2 jam lalu", type: "Darurat", location: "Jl. Sudirman", status: "Selesai" },
    { time: "5 jam lalu", type: "Terjadwal", location: "RS. Fatmawati", status: "Selesai" },
    { time: "1 hari lalu", type: "Mendesak", location: "Jl. Thamrin", status: "Selesai" },
    { time: "2 hari lalu", type: "Darurat", location: "Jl. Gatot Subroto", status: "Selesai" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Layanan Ambulan</h1>
              <p className="text-gray-600">Layanan ambulan gratis 24/7 untuk jamaah dan masyarakat</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Emergency Contact Banner */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <strong>DARURAT?</strong> Hubungi langsung:
            <a href="tel:+6281234567890" className="font-bold ml-2 underline">
              0812-3456-7890
            </a>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-6 w-6 text-red-600" />
                  <span>Permintaan Layanan Ambulan</span>
                </CardTitle>
                <CardDescription>Isi form di bawah untuk meminta layanan ambulan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Type Selection */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">Jenis Layanan</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {serviceTypes.map((service) => (
                      <Card
                        key={service.id}
                        className={`cursor-pointer transition-all ${
                          requestType === service.id ? "ring-2 ring-red-500 bg-red-50" : "hover:shadow-md"
                        }`}
                        onClick={() => setRequestType(service.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`${service.color} p-3 rounded-full text-white inline-flex mb-3`}>
                            {service.icon}
                          </div>
                          <h3 className="font-semibold mb-2">{service.title}</h3>
                          <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {service.responseTime}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Patient Information */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Informasi Pasien</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientName">Nama Pasien</Label>
                      <Input id="patientName" placeholder="Masukkan nama pasien" />
                    </div>
                    <div>
                      <Label htmlFor="patientAge">Usia</Label>
                      <Input id="patientAge" type="number" placeholder="Masukkan usia" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientGender">Jenis Kelamin</Label>
                      <select
                        id="patientGender"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="patientPhone">Nomor Telepon</Label>
                      <Input id="patientPhone" placeholder="Nomor telepon pasien/keluarga" />
                    </div>
                  </div>
                </div>

                {/* Medical Condition */}
                <div>
                  <Label htmlFor="condition">Kondisi/Keluhan</Label>
                  <Textarea id="condition" placeholder="Jelaskan kondisi pasien dan keluhan yang dialami..." rows={4} />
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Informasi Lokasi</Label>
                  <div>
                    <Label htmlFor="pickupAddress">Alamat Penjemputan</Label>
                    <Textarea id="pickupAddress" placeholder="Masukkan alamat lengkap penjemputan..." rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="destination">Tujuan (Rumah Sakit/Klinik)</Label>
                    <Input id="destination" placeholder="Nama rumah sakit atau klinik tujuan" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="landmark">Patokan/Landmark</Label>
                      <Input id="landmark" placeholder="Patokan terdekat" />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Nama Penanggung Jawab</Label>
                      <Input id="contactPerson" placeholder="Nama yang bisa dihubungi" />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <Label htmlFor="notes">Catatan Tambahan</Label>
                  <Textarea id="notes" placeholder="Informasi tambahan yang perlu diketahui tim medis..." rows={3} />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  {requestType === "emergency" ? (
                    <div className="space-y-4">
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-800">
                          Untuk kondisi darurat, lebih cepat hubungi langsung:
                          <a href="tel:+6281234567890" className="font-bold ml-1 underline">
                            0812-3456-7890
                          </a>
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          className="bg-red-600 hover:bg-red-700 h-12"
                          onClick={() => window.open("tel:+6281234567890")}
                        >
                          <Phone className="mr-2 h-5 w-5" />
                          Telepon Sekarang
                        </Button>
                        <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 h-12">
                          <Truck className="mr-2 h-5 w-5" />
                          Kirim Permintaan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 h-12 text-lg font-semibold"
                      disabled={!requestType}
                    >
                      <Truck className="mr-2 h-5 w-5" />
                      Kirim Permintaan Ambulan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <Phone className="h-5 w-5" />
                  <span>Kontak Darurat</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600 mb-2">0812-3456-7890</p>
                  <p className="text-sm text-gray-600 mb-4">Tersedia 24 jam setiap hari</p>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => window.open("tel:+6281234567890")}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Hubungi Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Service Features */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Fasilitas Ambulan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ambulanceFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Waktu Respons</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-semibold text-red-800">Darurat</span>
                  <Badge className="bg-red-500">5-10 menit</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-semibold text-orange-800">Mendesak</span>
                  <Badge className="bg-orange-500">15-30 menit</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-blue-800">Terjadwal</span>
                  <Badge className="bg-blue-500">Sesuai jadwal</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Services */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <span>Layanan Terbaru</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{service.type}</p>
                      <p className="text-xs text-gray-600">{service.location}</p>
                      <p className="text-xs text-gray-500">{service.time}</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Coverage Area */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <span>Area Layanan</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Jakarta Selatan</li>
                  <li>• Jakarta Pusat</li>
                  <li>• Jakarta Timur</li>
                  <li>• Depok & sekitarnya</li>
                  <li>• Area khusus (koordinasi)</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3">
                  *Untuk area di luar cakupan, silakan hubungi untuk koordinasi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
