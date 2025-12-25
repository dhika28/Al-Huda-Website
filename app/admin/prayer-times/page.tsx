"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Clock, MapPin, Bell, Calendar, Sun, Moon, Sunrise, Sunset, Edit, Save, RefreshCw } from "lucide-react"

export default function AdminPrayerTimesPage() {
  const [activeTab, setActiveTab] = useState("schedule")
  const [isEditing, setIsEditing] = useState(false)

  // Mock data
  const prayerTimes = {
    today: "2024-01-15",
    location: "Jakarta Pusat",
    coordinates: { lat: -6.2088, lng: 106.8456 },
    times: {
      fajr: "04:45",
      sunrise: "05:58",
      dhuhr: "12:05",
      asr: "15:18",
      maghrib: "18:12",
      isha: "19:25",
    },
    adjustments: {
      fajr: 0,
      sunrise: 0,
      dhuhr: 2,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
  }

  const monthlySchedule = [
    {
      date: "2024-01-15",
      fajr: "04:45",
      sunrise: "05:58",
      dhuhr: "12:05",
      asr: "15:18",
      maghrib: "18:12",
      isha: "19:25",
    },
    {
      date: "2024-01-16",
      fajr: "04:45",
      sunrise: "05:58",
      dhuhr: "12:05",
      asr: "15:19",
      maghrib: "18:13",
      isha: "19:26",
    },
    {
      date: "2024-01-17",
      fajr: "04:45",
      sunrise: "05:58",
      dhuhr: "12:06",
      asr: "15:19",
      maghrib: "18:13",
      isha: "19:26",
    },
  ]

  const getPrayerIcon = (prayer: string) => {
    switch (prayer) {
      case "fajr":
        return <Moon className="h-4 w-4 text-blue-600" />
      case "sunrise":
        return <Sunrise className="h-4 w-4 text-orange-600" />
      case "dhuhr":
        return <Sun className="h-4 w-4 text-yellow-600" />
      case "asr":
        return <Sun className="h-4 w-4 text-orange-500" />
      case "maghrib":
        return <Sunset className="h-4 w-4 text-red-600" />
      case "isha":
        return <Moon className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPrayerName = (prayer: string) => {
    const names: { [key: string]: string } = {
      fajr: "Subuh",
      sunrise: "Terbit",
      dhuhr: "Dzuhur",
      asr: "Ashar",
      maghrib: "Maghrib",
      isha: "Isya",
    }
    return names[prayer] || prayer
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Jadwal Sholat</h1>
          <p className="text-gray-600">Kelola jadwal sholat dan pengaturan waktu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sinkronisasi
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Current Prayer Times Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Jadwal Sholat Hari Ini
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {prayerTimes.location} - {prayerTimes.today}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Aktif
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(prayerTimes.times).map(([prayer, time]) => (
              <div key={prayer} className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">{getPrayerIcon(prayer)}</div>
                <h3 className="font-semibold text-sm">{getPrayerName(prayer)}</h3>
                <p className="text-lg font-bold text-green-600">{time}</p>
                {prayerTimes.adjustments[prayer as keyof typeof prayerTimes.adjustments] !== 0 && (
                  <p className="text-xs text-gray-500">
                    {prayerTimes.adjustments[prayer as keyof typeof prayerTimes.adjustments] > 0 ? "+" : ""}
                    {prayerTimes.adjustments[prayer as keyof typeof prayerTimes.adjustments]} menit
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Jadwal</TabsTrigger>
          <TabsTrigger value="adjustments">Penyesuaian</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Jadwal Bulanan</CardTitle>
                  <CardDescription>Jadwal sholat untuk bulan ini</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="2024-01">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-01">Januari 2024</SelectItem>
                      <SelectItem value="2024-02">Februari 2024</SelectItem>
                      <SelectItem value="2024-03">Maret 2024</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tanggal</th>
                      <th className="text-center p-2">Subuh</th>
                      <th className="text-center p-2">Terbit</th>
                      <th className="text-center p-2">Dzuhur</th>
                      <th className="text-center p-2">Ashar</th>
                      <th className="text-center p-2">Maghrib</th>
                      <th className="text-center p-2">Isya</th>
                      <th className="text-center p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySchedule.map((day, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{day.date}</td>
                        <td className="text-center p-2">{day.fajr}</td>
                        <td className="text-center p-2">{day.sunrise}</td>
                        <td className="text-center p-2">{day.dhuhr}</td>
                        <td className="text-center p-2">{day.asr}</td>
                        <td className="text-center p-2">{day.maghrib}</td>
                        <td className="text-center p-2">{day.isha}</td>
                        <td className="text-center p-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Penyesuaian Waktu Sholat</CardTitle>
              <CardDescription>Sesuaikan waktu sholat berdasarkan kondisi lokal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(prayerTimes.times).map(([prayer, time]) => (
                <div key={prayer} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPrayerIcon(prayer)}
                    <div>
                      <h3 className="font-semibold">{getPrayerName(prayer)}</h3>
                      <p className="text-sm text-gray-600">Waktu dasar: {time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`adjust-${prayer}`} className="text-sm">
                      Penyesuaian:
                    </Label>
                    <Input
                      id={`adjust-${prayer}`}
                      type="number"
                      className="w-20"
                      defaultValue={prayerTimes.adjustments[prayer as keyof typeof prayerTimes.adjustments]}
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">menit</span>
                  </div>
                </div>
              ))}
              <Button>Terapkan Penyesuaian</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>Kelola notifikasi adzan dan pengingat sholat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notifikasi Adzan</Label>
                    <p className="text-sm text-gray-600">Kirim notifikasi saat waktu adzan</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Pengingat Sebelum Sholat</Label>
                    <p className="text-sm text-gray-600">Kirim pengingat 10 menit sebelum waktu sholat</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notifikasi Website</Label>
                    <p className="text-sm text-gray-600">Tampilkan notifikasi di website</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notifikasi WhatsApp</Label>
                    <p className="text-sm text-gray-600">Kirim notifikasi via WhatsApp</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Pengaturan Notifikasi per Waktu Sholat</h3>
                {Object.entries(prayerTimes.times).map(([prayer, time]) => (
                  <div key={prayer} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPrayerIcon(prayer)}
                      <span className="font-medium">{getPrayerName(prayer)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Lokasi dan Metode</CardTitle>
              <CardDescription>Konfigurasi lokasi dan metode perhitungan waktu sholat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Kota</Label>
                  <Input id="city" defaultValue="Jakarta" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Negara</Label>
                  <Input id="country" defaultValue="Indonesia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" defaultValue="-6.2088" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" defaultValue="106.8456" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calculation-method">Metode Perhitungan</Label>
                <Select defaultValue="kemenag">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kemenag">Kementerian Agama RI</SelectItem>
                    <SelectItem value="isna">Islamic Society of North America</SelectItem>
                    <SelectItem value="mwl">Muslim World League</SelectItem>
                    <SelectItem value="egypt">Egyptian General Authority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Waktu</Label>
                <Select defaultValue="wib">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wib">WIB (UTC+7)</SelectItem>
                    <SelectItem value="wita">WITA (UTC+8)</SelectItem>
                    <SelectItem value="wit">WIT (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto Update</Label>
                  <p className="text-sm text-gray-600">Update otomatis jadwal sholat setiap hari</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button>Simpan Pengaturan</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
