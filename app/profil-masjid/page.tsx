"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

// Import Type & API
import { MosqueProfile } from "@/app/types/masjid"
import { getMosqueProfile } from "@/lib/api/masjid"

// Import Semua Icon yang dibutuhkan
import {
  Building2, MapPin, Phone, Mail, Clock, Users, Heart, BookOpen, 
  ChurchIcon as Mosque, Car, Shield, Award, Target, Eye, Star, 
  History, Crown, Handshake, GraduationCap, Soup, Sun, Moon, 
  CheckCircle2, Info
} from "lucide-react"

// --- 1. ICON MAP (String -> Component) ---
// Ini jembatan antara Database (Text) ke Frontend (Component)
const ICON_MAP: Record<string, any> = {
  "Sun": Sun,
  "Moon": Moon,
  "Star": Star,
  "BookOpen": BookOpen,
  "GraduationCap": GraduationCap,
  "Users": Users,
  "Heart": Heart,
  "Handshake": Handshake,
  "Soup": Soup,
  "Mosque": Mosque,
  "Building2": Building2,
  "Shield": Shield,
  "Car": Car,
  "Crown": Crown,
  "Award": Award,
  "CheckCircle2": CheckCircle2,
  "Info": Info,
  // Default fallback
  "Default": Star 
}

export default function ProfilMasjidPage() {
  const [profile, setProfile] = useState<MosqueProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // --- 2. FETCH DATA ---
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMosqueProfile()
        setProfile(data)
      } catch (error) {
        console.error("Gagal memuat profil:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Helper untuk render Icon
  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = ICON_MAP[iconName] || ICON_MAP["Default"]
    return <IconComponent className={className} />
  }

  // --- 3. LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-emerald-600">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Memuat Profil Masjid...</p>
      </div>
    )
  }

  // Jika data kosong / belum disetup admin
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border">
          <Info className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Profil Belum Tersedia</h2>
          <p className="text-gray-500 mt-2">Administrator belum mengatur profil masjid ini.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-black/80 to-black/80 overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Dynamic Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-1000"
          style={{ backgroundImage: `url('${profile.bg_image_url || "/bg-alhuda3.jpeg"}')` }}
        />

        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="max-w-5xl text-white">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight drop-shadow-lg">
              {profile.nama_masjid}
            </h1>
            <p className="text-2xl md:text-3xl mb-6 font-medium text-emerald-300">
              {profile.tagline || "Pusat Ibadah, Pendidikan, dan Dakwah Islam"}
            </p>
            <p className="text-lg md:text-xl mb-12 max-w-4xl leading-relaxed text-gray-200">
              {profile.deskripsi_hero}
            </p>

            {/* Dynamic Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {profile.stats && profile.stats.map((stat, i) => (
                <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/10">
                  <div className="text-4xl md:text-5xl font-bold text-emerald-400">{stat.value}</div>
                  <div className="mt-2 text-gray-300">{stat.label}</div>
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
                Visi Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 text-lg leading-relaxed text-gray-700">
              {profile.visi || "Belum ada visi."}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
            <CardHeader className="bg-emerald-50/80 pb-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-emerald-900">
                <Target className="h-10 w-10 text-emerald-600" />
                Misi Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {profile.misi && profile.misi.length > 0 ? (
                 profile.misi.map((misi, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{misi}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Belum ada misi.</p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Sejarah Timeline */}
        {profile.sejarah && profile.sejarah.length > 0 && (
          <section>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Sejarah Perjalanan</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Jejak langkah pembangunan dan pelayanan umat
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-emerald-200 rounded-full" />
              {profile.sejarah.map((item, index) => (
                <div key={index} className="relative flex items-center justify-between mb-16 last:mb-0">
                  <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-12" : "opacity-0"}`}>
                    {index % 2 === 0 && (
                      <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-emerald-100/50">
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
                      <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-emerald-100/50">
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
        )}

        {/* Fasilitas */}
        {profile.fasilitas && profile.fasilitas.length > 0 && (
          <section>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Fasilitas Masjid</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Sarana pendukung kenyamanan ibadah jamaah
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {profile.fasilitas.map((item, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                      {/* Random Icon logic for Facilities since we don't store icon name for facilities specifically in simple JSON, 
                          OR we can assume a default one. Let's use Building2 as default if logic complex */}
                      <Building2 className="h-12 w-12 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900">{item.nama}</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 mb-4">{item.kapasitas}</Badge>
                    <p className="text-gray-600">{item.deskripsi}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Program Kegiatan */}
        {profile.program && profile.program.length > 0 && (
          <section>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Program & Kegiatan</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Agenda rutin untuk memakmurkan masjid
              </p>
            </div>

            <div className="space-y-20">
              {profile.program.map((kategori, index) => (
                <div key={index}>
                  <h3 className="text-3xl font-bold text-emerald-900 text-center mb-10 border-b-2 border-emerald-100 pb-4 inline-block w-full">{kategori.kategori}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {kategori.programs.map((program, idx) => (
                      <Card key={idx} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-4 text-xl">
                            <div className="p-3 bg-emerald-100 rounded-xl">
                              {/* Cek apakah ada icon property, jika tidak gunakan default */}
                              {renderIcon(program.icon || "Star", "h-8 w-8 text-emerald-600")}
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
        )}

        {/* Struktur Organisasi */}
        {profile.struktur && profile.struktur.length > 0 && (
          <section>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Struktur Organisasi</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Khadimul Ummah (Pelayan Umat) Masjid Al Huda
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {profile.struktur.map((pengurus, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
                  <CardContent className="p-10">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-12 w-12 text-emerald-600" />
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 mb-4">{pengurus.jabatan}</Badge>
                    <h3 className="font-bold text-2xl mb-3 text-gray-900">{pengurus.nama}</h3>
                    <p className="text-gray-600 mb-2 font-medium">{pengurus.pendidikan}</p>
                    <p className="text-sm text-gray-500 italic">{pengurus.pengalaman}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Kontak & Lokasi */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-4 text-3xl text-slate-800">
                <Phone className="h-8 w-8 text-emerald-600" />
                Hubungi Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="flex gap-5 group">
                <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors h-fit">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-2 text-slate-900">Alamat</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {profile.alamat}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4 group">
                  <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors h-fit">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Telepon / WA</p>
                    <p className="text-gray-600">{profile.telepon}</p>
                  </div>
                </div>
                <div className="flex gap-4 group">
                  <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors h-fit">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-gray-600">{profile.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-4 text-3xl text-slate-800">
                <MapPin className="h-8 w-8 text-emerald-600" />
                Peta Lokasi
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex-1 relative min-h-[300px]">
              {/* GOOGLE MAPS EMBED */}
              {/* Note: Pastikan di Admin Panel nanti menginput URL EMBED (src), bukan URL biasa */}
              <iframe
                src={profile.google_maps_url || "https://www.google.com/maps/embed?pb=..."} // Fallback jika kosong
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "350px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              <div className="absolute bottom-4 left-4 right-4">
                 <Button
                    asChild
                    className="w-full bg-white/90 hover:bg-white text-emerald-700 shadow-lg backdrop-blur-sm border border-emerald-100"
                  >
                    <a
                      href={profile.google_maps_url} // Ini bisa diganti link "View on Maps" jika datanya dipisah
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Buka Google Maps
                    </a>
                  </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}