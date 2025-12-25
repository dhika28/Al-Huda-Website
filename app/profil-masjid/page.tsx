"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Heart,
  BookOpen,
  ChurchIcon as Mosque,
  Car,
  Shield,
  Award,
  Target,
  Eye,
  Star,
  History,
  Crown,
  Handshake,
  GraduationCap,
  Soup,
  Sun,
  Moon,
} from "lucide-react"

export default function ProfilMasjidPage() {
  const sejarahTimeline = [
    { tahun: "1995", peristiwa: "Pendirian Masjid Al Huda", detail: "Dimulai dari musholla kecil dengan 50 jamaah" },
    { tahun: "2000", peristiwa: "Renovasi Pertama", detail: "Perluasan ruang sholat hingga 200 jamaah" },
    { tahun: "2010", peristiwa: "Pembangunan Menara", detail: "Penambahan menara setinggi 35 meter" },
    { tahun: "2015", peristiwa: "Renovasi Besar", detail: "Modernisasi fasilitas dan penambahan AC" },
    { tahun: "2020", peristiwa: "Era Digital", detail: "Implementasi sistem digital dan live streaming" },
    { tahun: "2024", peristiwa: "Website Resmi", detail: "Peluncuran sistem manajemen masjid online" },
  ]

  const fasilitas = [
    { nama: "Ruang Sholat Utama", kapasitas: "500 jamaah", icon: Mosque, deskripsi: "Ruang sholat ber-AC dengan karpet premium" },
    { nama: "Ruang Sholat Wanita", kapasitas: "200 jamaah", icon: Building2, deskripsi: "Area khusus wanita dengan akses terpisah" },
    { nama: "Tempat Wudhu", kapasitas: "50 orang", icon: Shield, deskripsi: "Fasilitas wudhu modern dengan air hangat" },
    { nama: "Area Parkir", kapasitas: "100 kendaraan", icon: Car, deskripsi: "Parkir luas dengan keamanan 24 jam" },
  ]

  const programKegiatan = [
    {
      kategori: "Ibadah Harian",
      programs: [
        { nama: "Sholat Berjamaah", jadwal: "5 waktu sehari", peserta: "300+ jamaah", icon: Sun },
        { nama: "Tahajud Berjamaah", jadwal: "Setiap malam", peserta: "50+ jamaah", icon: Moon },
        { nama: "Dzikir Ba'da Sholat", jadwal: "Setelah sholat", peserta: "200+ jamaah", icon: Star },
      ],
    },
    {
      kategori: "Pendidikan Islam",
      programs: [
        { nama: "Tahfidz Al-Quran", jadwal: "Sen-Kam 16:00-18:00", peserta: "80 santri", icon: BookOpen },
        { nama: "Madrasah Diniyah", jadwal: "Sel-Jum 15:00-17:00", peserta: "120 siswa", icon: GraduationCap },
        { nama: "Kajian Rutin", jadwal: "Jum'at 19:30", peserta: "200+ jamaah", icon: Users },
      ],
    },
    {
      kategori: "Sosial Kemasyarakatan",
      programs: [
        { nama: "Santunan Yatim", jadwal: "Setiap bulan", peserta: "50 anak yatim", icon: Heart },
        { nama: "Bakti Sosial", jadwal: "Setiap 3 bulan", peserta: "100+ relawan", icon: Handshake },
        { nama: "Dapur Umum", jadwal: "Ramadhan & Bencana", peserta: "500+ porsi", icon: Soup },
      ],
    },
  ]

  const strukturOrganisasi = [
    { jabatan: "Imam Besar", nama: "KH. Ahmad Syahid, Lc., M.A", pendidikan: "Lulusan Al-Azhar University, Cairo", pengalaman: "25 tahun memimpin masjid", icon: Crown },
    { jabatan: "Ketua Takmir", nama: "Ustadz Muhammad Ridwan, S.Ag", pendidikan: "IAIN Jakarta", pengalaman: "15 tahun di bidang manajemen masjid", icon: Users },
    { jabatan: "Sekretaris", nama: "Ahmad Fauzi, S.Kom", pendidikan: "Universitas Indonesia", pengalaman: "10 tahun administrasi", icon: BookOpen },
    { jabatan: "Bendahara", nama: "Dr. Abdullah Rahman, M.E", pendidikan: "Universitas Trisakti", pengalaman: "20 tahun di bidang keuangan", icon: Award },
    { jabatan: "Ketua Muslimah", nama: "Hj. Fatimah Zahra, S.Pd", pendidikan: "UIN Syarif Hidayatullah", pengalaman: "12 tahun pembinaan muslimah", icon: Heart },
    { jabatan: "Koordinator Pendidikan", nama: "Ustadz Yusuf Mansur, S.Pd.I", pendidikan: "LIPIA Jakarta", pengalaman: "18 tahun di bidang pendidikan", icon: GraduationCap },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-black/80 to-black/80 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/bg-alhuda3.jpeg')" }}
        />

        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="max-w-5xl text-white">
            <div className="flex items-center gap-4 mb-8">
            </div>
            <h1 className="text-8xl md:text-8xl font-extrabold mb-6 leading-tight">
              Masjid Al Huda
            </h1>
            <p className="text-2xl md:text-3xl mb-6 font-medium">
              Pusat Ibadah, Pendidikan, dan Dakwah Islam
            </p>
            <p className="text-lg md:text-xl mb-12 max-w-4xl leading-relaxed">
              Melayani umat Islam di Kabupaten Tabanan dengan komitmen membangun generasi Qurani, berakhlak mulia, dan bermanfaat bagi masyarakat luas.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "29", label: "Tahun Melayani" },
                { value: "700+", label: "Jamaah Aktif" },
                { value: "15+", label: "Program Rutin" },
                { value: "200+", label: "Santri Tahfidz" },
              ].map((stat, i) => (
                <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
                  <div className="mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-20 space-y-32">
        {/* Visi Misi */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <CardHeader className="bg-emerald-50/80 pb-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-emerald-900">
                <Eye className="h-10 w-10 text-emerald-600" />
                Visi Masjid Al Huda
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 text-lg leading-relaxed text-gray-700">
              Menjadi masjid yang unggul dalam pembinaan umat, pusat pendidikan Islam yang berkualitas, dan pelopor dakwah yang rahmatan lil alamiin untuk mewujudkan masyarakat yang beriman, bertakwa, berakhlak mulia, dan sejahtera lahir batin.
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <CardHeader className="bg-emerald-50/80 pb-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-emerald-900">
                <Target className="h-10 w-10 text-emerald-600" />
                Misi Masjid Al Huda
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {[
                "Menyelenggarakan ibadah yang khusyuk dan berjamaah",
                "Mengembangkan pendidikan Islam untuk segala usia",
                "Melaksanakan dakwah dan pembinaan akhlak mulia",
                "Membangun ukhuwah islamiyah yang kuat",
                "Mengembangkan program sosial kemasyarakatan",
              ].map((misi, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">{misi}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Sejarah Timeline */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Sejarah Masjid Al Huda</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Perjalanan panjang membangun rumah Allah dan melayani umat selama hampir 3 dekade
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-emerald-200 rounded-full" />
            {sejarahTimeline.map((item, index) => (
              <div key={index} className="relative flex items-center justify-between mb-16 last:mb-0">
                <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-12" : "opacity-0"}`}>
                  {index % 2 === 0 && (
                    <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardContent className="p-8">
                        <div className="flex items-center justify-end gap-4 mb-4">
                          <Badge className="bg-emerald-600 text-white">{item.tahun}</Badge>
                          <History className="h-7 w-7 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-900">{item.peristiwa}</h3>
                        <p className="text-gray-600 mt-3">{item.detail}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-emerald-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>

                <div className={`w-5/12 ${index % 2 === 1 ? "pl-12" : "opacity-0"}`}>
                  {index % 2 === 1 && (
                    <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                          <History className="h-7 w-7 text-emerald-600" />
                          <Badge className="bg-emerald-600 text-white">{item.tahun}</Badge>
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-900">{item.peristiwa}</h3>
                        <p className="text-gray-600 mt-3">{item.detail}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fasilitas */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Fasilitas Masjid</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fasilitas lengkap dan modern untuk mendukung kegiatan ibadah dan sosial kemasyarakatan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {fasilitas.map((item, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                    <item.icon className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">{item.nama}</h3>
                  <Badge className="bg-emerald-100 text-emerald-700 mb-4">{item.kapasitas}</Badge>
                  <p className="text-gray-600">{item.deskripsi}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Program Kegiatan */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Program & Kegiatan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beragam program untuk memenuhi kebutuhan spiritual, pendidikan, dan sosial jamaah
            </p>
          </div>

          <div className="space-y-20">
            {programKegiatan.map((kategori, index) => (
              <div key={index}>
                <h3 className="text-3xl font-bold text-emerald-900 text-center mb-10">{kategori.kategori}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {kategori.programs.map((program, idx) => (
                    <Card key={idx} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-4 text-xl">
                          <div className="p-3 bg-emerald-100 rounded-xl">
                            <program.icon className="h-8 w-8 text-emerald-600" />
                          </div>
                          {program.nama}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock className="h-5 w-5 text-emerald-500" />
                          <span>{program.jadwal}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Users className="h-5 w-5 text-emerald-500" />
                          <span>{program.peserta}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Struktur Organisasi */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Struktur Organisasi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tim pengurus yang berpengalaman dan berdedikasi tinggi dalam melayani umat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {strukturOrganisasi.map((pengurus, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
                <CardContent className="p-10">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <pengurus.icon className="h-12 w-12 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 mb-4">{pengurus.jabatan}</Badge>
                  <h3 className="font-bold text-2xl mb-3 text-gray-900">{pengurus.nama}</h3>
                  <p className="text-gray-600 mb-2">{pengurus.pendidikan}</p>
                  <p className="text-sm text-gray-500">{pengurus.pengalaman}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Kontak & Lokasi */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-4 text-3xl">
                <Phone className="h-10 w-10 text-emerald-600" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex gap-5">
                <MapPin className="h-8 w-8 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xl mb-2">Alamat</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Jl. Perkutut No.1<br />
                    Dajan Peken, Kec. Tabanan<br />
                    Kabupaten Tabanan, Bali
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <Phone className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Telepon</p>
                    <p className="text-gray-600">021-3456789</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">info@masjidalhuda.org</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-4 text-3xl">
                <MapPin className="h-10 w-10 text-emerald-600" />
                Lokasi & Akses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center mb-8">
                <p className="text-gray-500 text-center">Google Maps Integration</p>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6">
                <MapPin className="h-5 w-5 mr-3" />
                Buka di Google Maps
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}