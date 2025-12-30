"use client"

import { JSX, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

/* ================== TYPES ================== */
type Timings = {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

type PrayerItem = {
  name: string
  time: string
  icon: JSX.Element
  color: string
}

const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
]

/* ================== PAGE ================== */
export default function JadwalSholatPage() {
  const [timings, setTimings] = useState<Timings | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState("Mendeteksi lokasi…")
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  const today = new Date()

  /* ================== GPS ================== */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName("Geolocation tidak didukung")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setCoords({ lat, lon })

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          )
          const data = await res.json()
          setLocationName(data.display_name ?? "Lokasi tidak diketahui")
        } catch {
          setLocationName("Lokasi tidak diketahui")
        }
      },
      () => setLocationName("Izin lokasi ditolak")
    )
  }, [])

  /* ================== API SHOLAT ================== */
  useEffect(() => {
    if (!coords) return

    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lon}&method=20`
        )
        const json = await res.json()
        setTimings(json.data.timings)
      } catch (e) {
        console.error("Gagal ambil jadwal sholat", e)
      } finally {
        setLoading(false)
      }
    }

    fetchPrayerTimes()
  }, [coords])

  /* ================== FORMAT ================== */
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)

  /* ================== LIST SHOLAT ================== */
  const prayerList: PrayerItem[] = useMemo(() => {
    if (!timings) return []

    return [
      { name: "Subuh", time: timings.Fajr, icon: <Sunrise />, color: "bg-blue-500" },
      { name: "Dzuhur", time: timings.Dhuhr, icon: <Sun />, color: "bg-yellow-500" },
      { name: "Ashar", time: timings.Asr, icon: <Sun />, color: "bg-orange-500" },
      { name: "Maghrib", time: timings.Maghrib, icon: <Sunset />, color: "bg-red-500" },
      { name: "Isya", time: timings.Isha, icon: <Moon />, color: "bg-purple-500" },
    ]
  }, [timings])

  /* ================== NEXT PRAYER ================== */
  const nextPrayer = useMemo(() => {
    if (!prayerList.length) return null
    const now = new Date()
    const minutesNow = now.getHours() * 60 + now.getMinutes()

    for (const p of prayerList) {
      const [h, m] = p.time.split(":").map(Number)
      if (h * 60 + m > minutesNow) return p
    }
    return prayerList[0]
  }, [prayerList])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat jadwal sholat…</p>
      </div>
    )
  }

  /* ================== RENDER ================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Jadwal Sholat</h1>
            <p className="text-sm text-muted-foreground">
              Jadwal Sholat Akurat
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* INFO */}
        <Card className="mb-8 bg-emerald-600 text-white">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{formatDate(today)}</h2>
              <div className="flex items-center gap-2 text-emerald-100 text-sm">
                <MapPin className="h-4 w-4" />
                {locationName}
              </div>
            </div>

            {nextPrayer && (
              <div className="text-right">
                <p className="text-sm text-emerald-100">Sholat Selanjutnya</p>
                <p className="text-2xl font-bold">{nextPrayer.name}</p>
                <p className="text-lg">{nextPrayer.time}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TABS */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="today">Hari Ini</TabsTrigger>
            <TabsTrigger value="weekly">Mingguan</TabsTrigger>
            <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          </TabsList>

          {/* HARI INI */}
          <TabsContent value="today" className="space-y-4">
            {prayerList.map((p) => {
              const isNext = nextPrayer?.name === p.name
              return (
                <Card key={p.name} className={isNext ? "ring-2 ring-emerald-500" : ""}>
                  <CardContent className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`${p.color} p-3 rounded-full text-white`}>
                        {p.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{p.name}</p>
                        {isNext && (
                          <Badge className="mt-1 bg-emerald-500">Selanjutnya</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{p.time}</p>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* MINGGUAN */}
          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Mingguan</CardTitle>
                <CardDescription>Perkiraan jadwal sholat per hari</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Hari</th>
                      {prayerList.map((p) => (
                        <th key={p.name} className="p-2 text-center">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <tr key={day} className="border-b">
                        <td className="p-2 font-medium">{day}</td>
                        {prayerList.map((p) => (
                          <td key={p.name} className="p-2 text-center">
                            {p.time}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BULANAN */}
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Bulanan</CardTitle>
                <CardDescription>Ringkasan Minggu 1–4</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((week) => (
                  <div key={week} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Minggu ke-{week}</h4>
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left">Hari</th>
                          {prayerList.map((p) => (
                            <th key={p.name} className="text-center">
                              {p.name.slice(0, 2)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day) => (
                          <tr key={day}>
                            <td className="py-1 font-medium">{day}</td>
                            {prayerList.map((p) => (
                              <td key={p.name} className="text-center">
                                {p.time}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
