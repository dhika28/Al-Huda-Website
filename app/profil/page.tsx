"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Calendar,
  Heart,
  BookOpen,
  ChurchIcon as Mosque,
  Car,
  Utensils,
  Wifi,
  Shield,
  Award,
  Target,
  Eye,
  Star,
} from "lucide-react"

export default function ProfilMasjidPage() {
  const facilities = [
    { name: "Ruang Sholat Utama", capacity: "500 jamaah", icon: Mosque },
    { name: "Ruang Sholat Wanita", capacity: "200 jamaah", icon: Building },
    { name: "Tempat Wudhu", capacity: "Modern & Bersih", icon: Shield },
    { name: "Parkir Luas", capacity: "100 kendaraan", icon: Car },
    { name: "Kantin Halal", capacity: "Makanan & Minuman", icon: Utensils },
    { name: "WiFi Gratis", capacity: "Seluruh Area", icon: Wifi },
    { name: "Perpustakaan", capacity: "1000+ Buku", icon: BookOpen },
    { name: "Ruang Pertemuan", capacity: "50 orang", icon: Users },
  ]

  const programs = [
    {
      title: "Kajian Rutin",
      description: "Kajian mingguan setiap Jumat ba'da Maghrib",
      schedule: "Setiap Jumat, 19:30 WIB",
      icon: BookOpen,
    },
    {
      title: "Tahfidz Al-Quran",
      description: "Program menghafal Al-Quran untuk segala usia",
      schedule: "Senin-Kamis, 16:00-18:00 WIB",
      icon: Star,
    },
    {
      title: "Santunan Yatim",
      description: "Program rutin santunan untuk anak yatim",
      schedule: "Setiap bulan",
      icon: Heart,
    },
    {
      title: "Bakti Sosial",
      description: "Kegiatan sosial untuk masyarakat sekitar",
      schedule: "Setiap 3 bulan",
      icon: Users,
    },
  ]

  const leadership = [
    {
      name: "KH. Ahmad Syahid",
      position: "Imam Besar",
      description: "Lulusan Al-Azhar, Cairo",
    },
    {
      name: "Ustadz Muhammad Ridwan",
      position: "Ketua Takmir",
      description: "Koordinator kegiatan masjid",
    },
    {
      name: "Hj. Fatimah Zahra",
      position: "Ketua Muslimah",
      description: "Koordinator kegiatan wanita",
    },
    {
      name: "Dr. Abdullah Rahman",
      position: "Bendahara",
      description: "Pengelola keuangan masjid",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-green-600 to-green-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/placeholder.svg?height=400&width=800')",
            backgroundBlendMode: "overlay",
          }}
        ></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Mosque className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Est. 1995
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-4">Masjid Al Huda</h1>
            <p className="text-xl mb-6 text-green-100">Pusat Ibadah dan Dakwah untuk Umat Islam di Jakarta Pusat</p>
            <div className="flex items-center gap-6 text-green-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Jakarta Pusat</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>500+ Jamaah</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>29 Tahun Melayani</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-20 mb-12 relative z-10">
          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Waktu Sholat</h3>
              <p className="text-sm text-gray-600">5 Waktu Sehari</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Kapasitas</h3>
              <p className="text-sm text-gray-600">700 Jamaah</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Program</h3>
              <p className="text-sm text-gray-600">15+ Kegiatan</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <Car className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Parkir</h3>
              <p className="text-sm text-gray-600">100 Kendaraan</p>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Tentang Masjid Al Huda</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Masjid Al Huda didirikan pada tahun 1995 dengan visi menjadi pusat ibadah dan dakwah yang memberikan
                manfaat bagi umat Islam di Jakarta Pusat dan sekitarnya. Selama hampir 3 dekade, masjid ini telah
                menjadi rumah spiritual bagi ribuan jamaah.
              </p>
              <p>
                Dengan arsitektur yang memadukan gaya tradisional dan modern, Masjid Al Huda tidak hanya berfungsi
                sebagai tempat ibadah, tetapi juga sebagai pusat kegiatan sosial, pendidikan, dan dakwah Islam yang
                komprehensif.
              </p>
              <p>
                Kami berkomitmen untuk terus melayani umat dengan sepenuh hati, menyediakan berbagai program dan
                fasilitas yang mendukung kehidupan beragama yang lebih baik.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Visi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Visi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Menjadi masjid yang unggul dalam pembinaan umat, dakwah Islam, dan pelayanan sosial yang bermanfaat
                  bagi masyarakat luas.
                </p>
              </CardContent>
            </Card>

            {/* Misi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Misi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Menyelenggarakan ibadah yang khusyuk dan berjamaah</li>
                  <li>• Mengembangkan pendidikan Islam untuk segala usia</li>
                  <li>• Melaksanakan program dakwah dan sosial kemasyarakatan</li>
                  <li>• Membangun ukhuwah islamiyah yang kuat</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Fasilitas Masjid</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <facility.icon className="h-10 w-10 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{facility.name}</h3>
                  <p className="text-sm text-gray-600">{facility.capacity}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Programs Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Program & Kegiatan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((program, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <program.icon className="h-6 w-6 text-green-600" />
                    {program.title}
                  </CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {program.schedule}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Leadership Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pengurus Masjid</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{leader.name}</h3>
                  <p className="text-green-600 font-medium mb-2">{leader.position}</p>
                  <p className="text-sm text-gray-600">{leader.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact & Location Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Alamat</p>
                  <p className="text-gray-600">Jl. Masjid Raya No. 123, Jakarta Pusat, DKI Jakarta 10110</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Telepon</p>
                  <p className="text-gray-600">021-1234567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">info@masjidalHuda.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Jam Operasional</p>
                  <p className="text-gray-600">24 Jam (Sholat 5 Waktu)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Lokasi Masjid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Peta Lokasi Masjid</p>
                  <p className="text-sm">Google Maps Integration</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  Lihat di Maps
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Hubungi Kami
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bergabunglah dengan Komunitas Kami</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Mari bersama-sama membangun ukhuwah islamiyah yang kuat dan berkontribusi untuk kemajuan umat. Masjid Al
                Huda terbuka untuk semua kalangan yang ingin berbagi kebaikan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Heart className="h-5 w-5 mr-2" />
                  Donasi Sekarang
                </Button>
                <Button size="lg" variant="outline">
                  <Users className="h-5 w-5 mr-2" />
                  Daftar Program
                </Button>
                <Button size="lg" variant="outline">
                  <Phone className="h-5 w-5 mr-2" />
                  Hubungi Kami
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
