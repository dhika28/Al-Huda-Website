"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Bell,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Star,
  Volume2,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function JadwalSholatPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [notificationEnabled, setNotificationEnabled] = useState(false)

  const prayerTimes = [
    {
      name: "Subuh",
      time: "05:30",
      nextTime: "05:29",
      icon: <Sunrise className="h-6 w-6" />,
      status: "Selesai",
      color: "bg-blue-500",
      description: "Waktu subuh hingga terbit matahari",
    },
    {
      name: "Dzuhur",
      time: "12:45",
      nextTime: "12:44",
      icon: <Sun className="h-6 w-6" />,
      status: "Selanjutnya",
      color: "bg-yellow-500",
      description: "Waktu dzuhur hingga ashar",
    },
    {
      name: "Ashar",
      time: "16:15",
      nextTime: "16:14",
      icon: <Sun className="h-6 w-6" />,
      status: "Akan Datang",
      color: "bg-orange-500",
      description: "Waktu ashar hingga maghrib",
    },
    {
      name: "Maghrib",
      time: "18:30",
      nextTime: "18:29",
      icon: <Sunset className="h-6 w-6" />,
      status: "Akan Datang",
      color: "bg-red-500",
      description: "Waktu maghrib hingga isya",
    },
    {
      name: "Isya",
      time: "20:00",
      nextTime: "19:59",
      icon: <Moon className="h-6 w-6" />,
      status: "Akan Datang",
      color: "bg-purple-500",
      description: "Waktu isya hingga subuh",
    },
  ]

  const weeklySchedule = [
    { day: "Senin", subuh: "05:30", dzuhur: "12:45", ashar: "16:15", maghrib: "18:30", isya: "20:00" },
    { day: "Selasa", subuh: "05:30", dzuhur: "12:45", ashar: "16:15", maghrib: "18:30", isya: "20:00" },
    { day: "Rabu", subuh: "05:30", dzuhur: "12:45", ashar: "16:15", maghrib: "18:30", isya: "20:00" },
    { day: "Kamis", subuh: "05:30", dzuhur: "12:45", ashar: "16:15", maghrib: "18:30", isya: "20:00" },
    { day: "Jumat", subuh: "05:30", dzuhur: "12:00", ashar: "16:15", maghrib: "18:30", isya: "20:00" },
    { day: "Sabtu", subuh: "05:30", dzuhur: "12:45", ashar: "16:15", maghrib: "18:30", isya: "20:00" },
    { day: "Minggu", subuh: "05:30", dzuhur: "12:45", ashar: "16:15", maghrib: "18:30", isya: "20:00" },
  ]

  const specialEvents = [
    { date: "2024-12-15", event: "Kajian Rutin", time: "19:30", type: "Kajian" },
    { date: "2024-12-17", event: "Sholat Jumat", time: "12:00", type: "Sholat" },
    { date: "2024-12-20", event: "Tarawih Ramadan", time: "20:30", type: "Ibadah" },
    { date: "2024-12-22", event: "Tahajud Bersama", time: "03:00", type: "Ibadah" },
  ]

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getCurrentPrayer = () => {
    return prayerTimes.find((prayer) => prayer.status === "Selanjutnya") || prayerTimes[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Jadwal Sholat</h1>
              <p className="text-gray-600">Waktu sholat akurat sesuai lokasi masjid</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Current Date & Location */}
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{formatDate(selectedDate)}</h2>
                <div className="flex items-center space-x-2 text-emerald-100">
                  <MapPin className="h-4 w-4" />
                  <span>Jakarta Selatan, Indonesia</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-sm">Sholat Selanjutnya</p>
                <p className="text-3xl font-bold">{getCurrentPrayer().name}</p>
                <p className="text-xl">{getCurrentPrayer().time}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="today" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Hari Ini</TabsTrigger>
                <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                <TabsTrigger value="monthly">Bulanan</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-6">
                {/* Today's Prayer Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  {prayerTimes.map((prayer, index) => (
                    <Card
                      key={index}
                      className={`border-0 shadow-lg transition-all duration-300 ${
                        prayer.status === "Selanjutnya"
                          ? "ring-2 ring-emerald-500 shadow-xl scale-105"
                          : "hover:shadow-xl"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`${prayer.color} p-3 rounded-full text-white`}>{prayer.icon}</div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{prayer.name}</h3>
                              <p className="text-sm text-gray-600">{prayer.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-gray-900">{prayer.time}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge
                                className={
                                  prayer.status === "Selanjutnya"
                                    ? "bg-emerald-500"
                                    : prayer.status === "Selesai"
                                      ? "bg-gray-500"
                                      : "bg-blue-500"
                                }
                              >
                                {prayer.status}
                              </Badge>
                              {prayer.status !== "Selesai" && (
                                <Button variant="ghost" size="sm">
                                  <Bell className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      <span>Jadwal Mingguan</span>
                    </CardTitle>
                    <CardDescription>Jadwal sholat untuk minggu ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-semibold">Hari</th>
                            <th className="text-center p-3 font-semibold">Subuh</th>
                            <th className="text-center p-3 font-semibold">Dzuhur</th>
                            <th className="text-center p-3 font-semibold">Ashar</th>
                            <th className="text-center p-3 font-semibold">Maghrib</th>
                            <th className="text-center p-3 font-semibold">Isya</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weeklySchedule.map((schedule, index) => (
                            <tr
                              key={index}
                              className={`border-b hover:bg-gray-50 ${schedule.day === "Jumat" ? "bg-emerald-50" : ""}`}
                            >
                              <td className="p-3 font-medium">
                                {schedule.day}
                                {schedule.day === "Jumat" && (
                                  <Badge className="ml-2 bg-emerald-500 text-xs">Jumat</Badge>
                                )}
                              </td>
                              <td className="text-center p-3">{schedule.subuh}</td>
                              <td className="text-center p-3">{schedule.dzuhur}</td>
                              <td className="text-center p-3">{schedule.ashar}</td>
                              <td className="text-center p-3">{schedule.maghrib}</td>
                              <td className="text-center p-3">{schedule.isya}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Kalender Bulanan</CardTitle>
                    <CardDescription>Pilih tanggal untuk melihat jadwal sholat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                        <div key={day} className="text-center font-semibold p-2 text-gray-600">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                        <Button
                          key={date}
                          variant={date === 14 ? "default" : "ghost"}
                          className={`h-10 w-10 p-0 ${date === 14 ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                        >
                          {date}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prayer Notifications */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-emerald-600" />
                  <span>Notifikasi Sholat</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Aktifkan Notifikasi</span>
                  <Button
                    variant={notificationEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNotificationEnabled(!notificationEnabled)}
                  >
                    {notificationEnabled ? "Aktif" : "Nonaktif"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Adzan Subuh</span>
                    <Volume2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Adzan Dzuhur</span>
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Adzan Ashar</span>
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Adzan Maghrib</span>
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Adzan Isya</span>
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan Notifikasi
                </Button>
              </CardContent>
            </Card>

            {/* Special Events */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-orange-600" />
                  <span>Kegiatan Khusus</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {specialEvents.map((event, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{event.event}</h4>
                      <Badge
                        className={
                          event.type === "Sholat"
                            ? "bg-emerald-500"
                            : event.type === "Kajian"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                        }
                      >
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Qibla Direction */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-emerald-800">Arah Kiblat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="absolute inset-4 border-2 border-emerald-500 rounded-full"></div>
                  <div className="w-1 h-16 bg-emerald-600 transform rotate-45"></div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Arah Kiblat dari lokasi masjid</p>
                <p className="font-bold text-emerald-800">295° Barat Laut</p>
              </CardContent>
            </Card>

            {/* Prayer Counter */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Waktu Tersisa</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Menuju {getCurrentPrayer().name}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-50 p-2 rounded">
                      <p className="text-2xl font-bold text-emerald-600">02</p>
                      <p className="text-xs text-gray-600">Jam</p>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded">
                      <p className="text-2xl font-bold text-emerald-600">15</p>
                      <p className="text-xs text-gray-600">Menit</p>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded">
                      <p className="text-2xl font-bold text-emerald-600">30</p>
                      <p className="text-xs text-gray-600">Detik</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
