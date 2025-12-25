"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  BookOpen,
  Heart,
  GraduationCap,
  Star,
  ChevronRight,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Award,
  Mic,
} from "lucide-react"

export default function KegiatanPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("semua")

  const kegiatanMendatang = [
    {
      id: 1,
      judul: "Kajian Rutin Jumat",
      kategori: "Kajian",
      tanggal: "2024-12-20",
      waktu: "19:30 - 21:00",
      lokasi: "Masjid Al-Huda",
      pemateri: "Ustadz Ahmad Hidayat, Lc.",
      tema: "Akhlak dalam Bermuamalah",
      kapasitas: 200,
      terdaftar: 156,
      deskripsi: "Kajian rutin setiap hari Jumat setelah Maghrib membahas berbagai tema keislaman",
      status: "terbuka",
      biaya: "Gratis",
      kontak: "021-3456789",
      fasilitas: ["Snack", "Materi PDF", "Sertifikat"],
    },
    {
      id: 2,
      judul: "Pelatihan Tahfidz Anak",
      kategori: "Pendidikan",
      tanggal: "2024-12-22",
      waktu: "08:00 - 12:00",
      lokasi: "Ruang Kelas Masjid",
      pemateri: "Ustadzah Fatimah, S.Pd.I",
      tema: "Metode Menghafal Al-Quran untuk Anak",
      kapasitas: 50,
      terdaftar: 42,
      deskripsi: "Program pelatihan menghafal Al-Quran khusus untuk anak usia 7-15 tahun",
      status: "terbuka",
      biaya: "Rp 50,000",
      kontak: "0812-3456-7890",
      fasilitas: ["Mushaf", "Snack", "Sertifikat", "Modul"],
    },
    {
      id: 3,
      judul: "Bakti Sosial Ramadan",
      kategori: "Sosial",
      tanggal: "2024-12-25",
      waktu: "06:00 - 12:00",
      lokasi: "Desa Sukamaju, Bogor",
      pemateri: "Tim Relawan Masjid",
      tema: "Berbagi Kebahagiaan Menjelang Ramadan",
      kapasitas: 100,
      terdaftar: 89,
      deskripsi: "Kegiatan bakti sosial menyambut bulan Ramadan dengan membagikan sembako",
      status: "hampir_penuh",
      biaya: "Gratis",
      kontak: "0813-2345-6789",
      fasilitas: ["Transport", "Makan Siang", "Kaos"],
    },
    {
      id: 4,
      judul: "Seminar Ekonomi Syariah",
      kategori: "Seminar",
      tanggal: "2024-12-28",
      waktu: "09:00 - 15:00",
      lokasi: "Aula Masjid Al-Huda",
      pemateri: "Dr. Abdullah Rahman, M.E.Sy",
      tema: "Investasi Halal di Era Digital",
      kapasitas: 300,
      terdaftar: 245,
      deskripsi: "Seminar tentang prinsip-prinsip ekonomi Islam dan investasi halal",
      status: "terbuka",
      biaya: "Rp 100,000",
      kontak: "021-3456789",
      fasilitas: ["Sertifikat", "Materi", "Makan Siang", "Doorprize"],
    },
  ]

  const kegiatanRutin = [
    {
      hari: "Senin",
      kegiatan: [
        { nama: "Tahfidz Dewasa", waktu: "05:00-06:00", tempat: "Ruang Utama" },
        { nama: "Kajian Tafsir", waktu: "20:00-21:30", tempat: "Ruang Kelas" },
      ],
    },
    {
      hari: "Selasa",
      kegiatan: [
        { nama: "Tahfidz Anak", waktu: "16:00-18:00", tempat: "Ruang Anak" },
        { nama: "Kajian Hadits", waktu: "20:00-21:30", tempat: "Ruang Utama" },
      ],
    },
    {
      hari: "Rabu",
      kegiatan: [
        { nama: "Madrasah Diniyah", waktu: "15:00-17:00", tempat: "Ruang Kelas" },
        { nama: "Kajian Fiqh", waktu: "20:00-21:30", tempat: "Ruang Utama" },
      ],
    },
    {
      hari: "Kamis",
      kegiatan: [
        { nama: "Tahfidz Remaja", waktu: "16:00-18:00", tempat: "Ruang Kelas" },
        { nama: "Kajian Akhlak", waktu: "20:00-21:30", tempat: "Ruang Utama" },
      ],
    },
    {
      hari: "Jumat",
      kegiatan: [
        { nama: "Khutbah Jumat", waktu: "11:30-12:30", tempat: "Ruang Utama" },
        { nama: "Kajian Rutin", waktu: "19:30-21:00", tempat: "Ruang Utama" },
      ],
    },
    {
      hari: "Sabtu",
      kegiatan: [
        { nama: "Sekolah Sabtu", waktu: "08:00-12:00", tempat: "Ruang Kelas" },
        { nama: "Kajian Keluarga", waktu: "19:30-21:00", tempat: "Ruang Utama" },
      ],
    },
    {
      hari: "Minggu",
      kegiatan: [
        { nama: "Tahfidz Keluarga", waktu: "08:00-10:00", tempat: "Ruang Utama" },
        { nama: "Kajian Umum", waktu: "19:30-21:00", tempat: "Ruang Utama" },
      ],
    },
  ]

  const kategoriKegiatan = [
    { nama: "Semua", value: "semua", count: 24, icon: Star },
    { nama: "Kajian", value: "kajian", count: 8, icon: BookOpen },
    { nama: "Pendidikan", value: "pendidikan", count: 6, icon: GraduationCap },
    { nama: "Sosial", value: "sosial", count: 4, icon: Heart },
    { nama: "Seminar", value: "seminar", count: 3, icon: Mic },
    { nama: "Pelatihan", value: "pelatihan", count: 3, icon: Award },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "terbuka":
        return <Badge className="bg-green-100 text-green-800">Terbuka</Badge>
      case "hampir_penuh":
        return <Badge className="bg-yellow-100 text-yellow-800">Hampir Penuh</Badge>
      case "penuh":
        return <Badge className="bg-red-100 text-red-800">Penuh</Badge>
      case "selesai":
        return <Badge className="bg-gray-100 text-gray-800">Selesai</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCapacityPercentage = (terdaftar: number, kapasitas: number) => {
    return Math.round((terdaftar / kapasitas) * 100)
  }

  const getCategoryIcon = (kategori: string) => {
    switch (kategori.toLowerCase()) {
      case "kajian":
        return <BookOpen className="h-5 w-5" />
      case "pendidikan":
        return <GraduationCap className="h-5 w-5" />
      case "sosial":
        return <Heart className="h-5 w-5" />
      case "seminar":
        return <Mic className="h-5 w-5" />
      case "pelatihan":
        return <Award className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Calendar className="h-12 w-12" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                Kegiatan Masjid
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-6">Kegiatan & Acara Masjid Al Huda</h1>
            <p className="text-xl mb-8 text-green-100 max-w-3xl mx-auto">
              Bergabunglah dengan berbagai kegiatan spiritual, pendidikan, dan sosial yang diselenggarakan oleh Masjid
              Al Huda untuk membangun ukhuwah islamiyah yang kuat.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-green-100">
              <div className="text-center">
                <div className="text-3xl font-bold">24+</div>
                <div className="text-sm">Kegiatan Rutin</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm">Peserta Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">12</div>
                <div className="text-sm">Program Unggulan</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">7</div>
                <div className="text-sm">Hari Seminggu</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="mendatang" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="mendatang">Kegiatan Mendatang</TabsTrigger>
            <TabsTrigger value="rutin">Kegiatan Rutin</TabsTrigger>
            <TabsTrigger value="kategori">Kategori</TabsTrigger>
          </TabsList>

          {/* Kegiatan Mendatang */}
          <TabsContent value="mendatang" className="space-y-8">
            {/* Search and Filter */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Cari kegiatan..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="semua">Semua Kategori</option>
                    <option value="kajian">Kajian</option>
                    <option value="pendidikan">Pendidikan</option>
                    <option value="sosial">Sosial</option>
                    <option value="seminar">Seminar</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Daftar Kegiatan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {kegiatanMendatang.map((kegiatan) => (
                <Card key={kegiatan.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(kegiatan.kategori)}
                        <div>
                          <CardTitle className="text-xl mb-2">{kegiatan.judul}</CardTitle>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(kegiatan.status)}
                            <Badge variant="outline">{kegiatan.kategori}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{kegiatan.tanggal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{kegiatan.waktu}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{kegiatan.lokasi}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{kegiatan.pemateri}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Tema:</h4>
                        <p className="text-gray-600">{kegiatan.tema}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Deskripsi:</h4>
                        <p className="text-gray-600 text-sm">{kegiatan.deskripsi}</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Kapasitas: {getCapacityPercentage(kegiatan.terdaftar, kegiatan.kapasitas)}%</span>
                          <span>
                            {kegiatan.terdaftar}/{kegiatan.kapasitas} peserta
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getCapacityPercentage(kegiatan.terdaftar, kegiatan.kapasitas)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Biaya:</span>
                          <p className="text-green-600 font-semibold">{kegiatan.biaya}</p>
                        </div>
                        <div>
                          <span className="font-medium">Kontak:</span>
                          <p className="text-gray-600">{kegiatan.kontak}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Fasilitas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {kegiatan.fasilitas.map((fasilitas, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {fasilitas}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex gap-3">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Daftar Sekarang
                        </Button>
                        <Button variant="outline">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Kegiatan Rutin */}
          <TabsContent value="rutin" className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Jadwal Kegiatan Rutin Mingguan</CardTitle>
                <p className="text-center text-gray-600">
                  Kegiatan rutin yang diselenggarakan setiap minggu di Masjid Al Huda
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {kegiatanRutin.map((hari, index) => (
                    <Card key={index} className="border-2 hover:border-green-300 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-center text-green-700">{hari.hari}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {hari.kegiatan.map((kegiatan, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-sm mb-1">{kegiatan.nama}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                <Clock className="h-3 w-3" />
                                <span>{kegiatan.waktu}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{kegiatan.tempat}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kategori Kegiatan */}
          <TabsContent value="kategori" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kategoriKegiatan.map((kategori, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <kategori.icon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{kategori.nama}</h3>
                    <Badge variant="secondary" className="mb-4">
                      {kategori.count} Kegiatan
                    </Badge>
                    <Button variant="outline" className="w-full">
                      Lihat Semua
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-20">
          <Card className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 border-green-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ingin Mengusulkan Kegiatan?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Kami terbuka untuk saran dan usulan kegiatan yang bermanfaat untuk jamaah. Mari bersama-sama membangun
                program yang lebih baik.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
                  <Mail className="h-6 w-6 mr-2" />
                  Kirim Usulan
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  <Phone className="h-6 w-6 mr-2" />
                  Hubungi Panitia
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
