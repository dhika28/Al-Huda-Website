"use client"

import { useEffect, useMemo, useState } from "react"
import { ActivityService } from "@/lib/api/activity"
import { Activity } from "@/app/types/activity"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  User,
  Phone,
  Mail,
  Award,
  Mic,
} from "lucide-react"

export default function KegiatanPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    ActivityService.getAll()
      .then((res: any) => {
        const items: Activity[] = res?.data ?? res
        setActivities(items)
      })
      .catch(console.error)
  }, [])

  const filteredActivities = useMemo(() => {
    return activities.filter((a) =>
      a.judul.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [activities, searchTerm])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "terbuka":
        return <Badge className="bg-emerald-100 text-emerald-800 text-xs font-medium">Terbuka</Badge>
      case "selesai":
        return <Badge className="bg-gray-100 text-gray-700 text-xs font-medium">Selesai</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Info</Badge>
    }
  }

  const getCategoryIcon = (kategori?: string) => {
    switch (kategori?.toLowerCase()) {
      case "kajian":
        return <BookOpen className="h-5 w-5 text-emerald-600" />
      case "pendidikan":
        return <GraduationCap className="h-5 w-5 text-emerald-600" />
      case "sosial":
        return <Heart className="h-5 w-5 text-emerald-600" />
      case "seminar":
        return <Mic className="h-5 w-5 text-emerald-600" />
      case "pelatihan":
        return <Award className="h-5 w-5 text-emerald-600" />
      default:
        return <Star className="h-5 w-5 text-emerald-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div
        className="relative h-[420px] bg-cover bg-bottom"
        style={{ backgroundImage: "url('/bg-alhuda.jpeg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/80" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
              Kegiatan Masjid Al-Huda
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
              Informasi kajian, pendidikan, dan kegiatan sosial yang diselenggarakan oleh Masjid Al-Huda
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* SEARCH */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari kegiatan…"
              className="pl-12 pr-6 py-6 text-base border-gray-200 focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* LIST */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Kegiatan belum tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredActivities.map((k) => (
              <Card 
                key={k.id} 
                className="overflow-hidden border-gray-200 hover:shadow-xl transition-shadow duration-300 bg-white"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        {getCategoryIcon(k.kategori)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-2">
                          {k.judul}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {getStatusBadge(k.status)}
                          {k.kategori && (
                            <Badge variant="secondary" className="text-xs">
                              {k.kategori}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-5">
                  {/* Info Utama */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {k.tanggal && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{k.tanggal}</span>
                      </div>
                    )}
                    {k.waktu && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{k.waktu}</span>
                      </div>
                    )}
                    {k.lokasi && (
                      <div className="flex items-center gap-3 text-gray-700 sm:col-span-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{k.lokasi}</span>
                      </div>
                    )}
                    {k.pemateri && (
                      <div className="flex items-center gap-3 text-gray-700 sm:col-span-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{k.pemateri}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-5" />

                  {/* Detail Tambahan */}
                  <div className="space-y-5 text-sm">
                    {k.tema && (
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Tema</p>
                        <p className="text-gray-600 leading-relaxed">{k.tema}</p>
                      </div>
                    )}

                    {k.deskripsi && (
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Deskripsi</p>
                        <p className="text-gray-600 leading-relaxed">{k.deskripsi}</p>
                      </div>
                    )}

                    {(k.biaya || k.kontak) && (
                      <div className="grid grid-cols-2 gap-6">
                        {k.biaya && (
                          <div>
                            <p className="font-medium text-gray-900">Biaya</p>
                            <p className="text-emerald-600 font-medium">{k.biaya}</p>
                          </div>
                        )}
                        {k.kontak && (
                          <div>
                            <p className="font-medium text-gray-900">Kontak</p>
                            <p className="text-gray-700">{k.kontak}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {k.fasilitas && k.fasilitas.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Fasilitas</p>
                        <div className="flex flex-wrap gap-2">
                          {k.fasilitas.map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA */}
          <div className="mt-20">
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
              <CardContent className="py-16 px-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Punya Usulan Kegiatan?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Masjid terbuka untuk ide kegiatan yang bermanfaat dan membangun umat
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {/* Kirim Usulan */}
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    asChild
                  >
                    <a
                      href="mailto:alhudatabanan@gmail.com?subject=Usulan%20Kegiatan%20Masjid%20Al-Huda"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Kirim Usulan
                    </a>
                  </Button>

                  {/* Hubungi Takmir */}
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    asChild
                  >
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Hubungi Takmir
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

      </div>
    </div>
  )
}