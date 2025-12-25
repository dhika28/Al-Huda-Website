"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Ambulance,
  Phone,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Download,
} from "lucide-react"

export default function AdminAmbulancePage() {
  const [activeTab, setActiveTab] = useState("requests")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock data
  const ambulanceRequests = [
    {
      id: 1,
      patientName: "Ahmad Wijaya",
      phone: "081234567890",
      address: "Jl. Masjid Raya No. 15, Jakarta",
      emergencyType: "Kecelakaan",
      status: "active",
      requestTime: "2024-01-15 14:30",
      estimatedArrival: "15 menit",
      driver: "Pak Budi",
      ambulanceUnit: "AMB-001",
    },
    {
      id: 2,
      patientName: "Siti Nurhaliza",
      phone: "081987654321",
      address: "Jl. Sudirman No. 45, Jakarta",
      emergencyType: "Sakit Mendadak",
      status: "completed",
      requestTime: "2024-01-15 13:15",
      completedTime: "2024-01-15 14:00",
      driver: "Pak Ahmad",
      ambulanceUnit: "AMB-002",
    },
    {
      id: 3,
      patientName: "Muhammad Rizki",
      phone: "081555666777",
      address: "Jl. Thamrin No. 88, Jakarta",
      emergencyType: "Persalinan",
      status: "cancelled",
      requestTime: "2024-01-15 12:00",
      cancelReason: "Sudah ditangani pihak lain",
      driver: "-",
      ambulanceUnit: "-",
    },
  ]

  const ambulanceFleet = [
    {
      id: 1,
      unit: "AMB-001",
      driver: "Pak Budi",
      phone: "081111222333",
      status: "active",
      location: "Jl. Masjid Raya",
      lastMaintenance: "2024-01-10",
      nextMaintenance: "2024-02-10",
    },
    {
      id: 2,
      unit: "AMB-002",
      driver: "Pak Ahmad",
      phone: "081444555666",
      status: "available",
      location: "Masjid Al Huda",
      lastMaintenance: "2024-01-08",
      nextMaintenance: "2024-02-08",
    },
    {
      id: 3,
      unit: "AMB-003",
      driver: "Pak Hasan",
      phone: "081777888999",
      status: "maintenance",
      location: "Workshop",
      lastMaintenance: "2024-01-15",
      nextMaintenance: "2024-02-15",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Aktif</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>
      case "available":
        return <Badge className="bg-green-100 text-green-800">Tersedia</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Ambulans</h1>
          <p className="text-gray-600">Kelola layanan ambulans dan emergency response</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Unit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Permintaan</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-xs text-green-600">+12% dari bulan lalu</p>
              </div>
              <Ambulance className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sedang Aktif</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-xs text-gray-500">Unit dalam perjalanan</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unit Tersedia</p>
                <p className="text-2xl font-bold text-green-600">2</p>
                <p className="text-xs text-gray-500">Siap melayani</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Waktu Respons</p>
                <p className="text-2xl font-bold text-orange-600">12</p>
                <p className="text-xs text-gray-500">menit rata-rata</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">Permintaan</TabsTrigger>
          <TabsTrigger value="fleet">Armada</TabsTrigger>
          <TabsTrigger value="drivers">Driver</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daftar Permintaan Ambulans</CardTitle>
                  <CardDescription>Kelola semua permintaan layanan ambulans</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ambulanceRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(request.status)}
                          <h3 className="font-semibold">{request.patientName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {request.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {request.address}
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {request.emergencyType}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {request.requestTime}
                          </div>
                          {request.status === "active" && (
                            <>
                              <div className="flex items-center gap-2">
                                <Ambulance className="h-4 w-4" />
                                {request.ambulanceUnit} - {request.driver}
                              </div>
                              <div className="flex items-center gap-2 text-blue-600">
                                <Clock className="h-4 w-4" />
                                ETA: {request.estimatedArrival}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Armada</CardTitle>
              <CardDescription>Kelola unit ambulans dan status operasional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ambulanceFleet.map((unit) => (
                  <div key={unit.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Ambulance className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold">{unit.unit}</h3>
                          {getStatusBadge(unit.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {unit.driver}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {unit.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {unit.location}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Maintenance terakhir: {unit.lastMaintenance} | Selanjutnya: {unit.nextMaintenance}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Driver</CardTitle>
              <CardDescription>Kelola data driver ambulans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Driver
                </Button>
                {/* Driver list would go here */}
                <p className="text-gray-500">Fitur manajemen driver akan ditambahkan...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Layanan Ambulans</CardTitle>
              <CardDescription>Konfigurasi layanan ambulans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Layanan Ambulans Aktif</Label>
                    <p className="text-sm text-gray-600">Aktifkan/nonaktifkan layanan ambulans</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency-phone">Nomor Emergency</Label>
                    <Input id="emergency-phone" defaultValue="081234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="response-time">Target Waktu Respons (menit)</Label>
                    <Input id="response-time" type="number" defaultValue="15" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-area">Area Layanan</Label>
                  <Textarea
                    id="service-area"
                    placeholder="Deskripsi area layanan ambulans..."
                    defaultValue="Jakarta Pusat, Jakarta Selatan, Jakarta Timur"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-contacts">Kontak Emergency Tambahan</Label>
                  <Textarea
                    id="emergency-contacts"
                    placeholder="Daftar kontak emergency..."
                    defaultValue="Rumah Sakit: 021-1234567&#10;Puskesmas: 021-7654321&#10;PMI: 021-9876543"
                  />
                </div>

                <Button>Simpan Pengaturan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
