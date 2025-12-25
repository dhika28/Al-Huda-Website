"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Settings,
  HandHeart,
  Calculator,
  ChurchIcon as Mosque,
  Truck,
  Clock,
  Calendar,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  Save,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function AdminServicesPage() {
  const [services, setServices] = useState([
    {
      id: "donations",
      name: "Donasi & Infaq",
      description: "Layanan donasi dan infaq online untuk jamaah",
      icon: <HandHeart className="h-6 w-6" />,
      color: "emerald",
      enabled: true,
      features: {
        quickDonation: true,
        recurringDonation: true,
        donationPrograms: true,
        receiptGeneration: true,
        donorAnalytics: true,
      },
      settings: {
        minAmount: 10000,
        maxAmount: 100000000,
        defaultAmounts: [50000, 100000, 250000, 500000, 1000000],
        paymentMethods: ["bank_transfer", "ewallet", "qris"],
        autoReceipt: true,
      },
    },
    {
      id: "zakat",
      name: "Pembayaran Zakat",
      description: "Kalkulator dan pembayaran zakat mal, profesi, dan fitrah",
      icon: <Calculator className="h-6 w-6" />,
      color: "blue",
      enabled: true,
      features: {
        zakatCalculator: true,
        zakatMal: true,
        zakatProfesi: true,
        zakatFitrah: true,
        nisabUpdates: true,
      },
      settings: {
        goldPricePerGram: 1000000,
        silverPricePerGram: 15000,
        zakatFitrahAmount: 35000,
        nisabGold: 85,
        nisabSilver: 595,
        autoNisabUpdate: true,
      },
    },
    {
      id: "qurban",
      name: "Pendaftaran Qurban",
      description: "Sistem pendaftaran qurban untuk Idul Adha",
      icon: <Mosque className="h-6 w-6" />,
      color: "orange",
      enabled: true,
      features: {
        animalSelection: true,
        groupQurban: true,
        certificateGeneration: true,
        distributionTracking: true,
        photoDocumentation: true,
      },
      settings: {
        registrationOpen: true,
        maxParticipants: 7,
        packages: [
          { name: "Kambing Lokal", price: 2500000, weight: "25-30 kg" },
          { name: "Kambing Premium", price: 3500000, weight: "35-40 kg" },
          { name: "Sapi Patungan", price: 2000000, weight: "400-500 kg" },
        ],
        deadlineRegistration: "2024-06-25",
      },
    },
    {
      id: "ambulance",
      name: "Layanan Ambulan",
      description: "Layanan ambulan gratis 24/7 untuk jamaah",
      icon: <Truck className="h-6 w-6" />,
      color: "red",
      enabled: true,
      features: {
        emergencyService: true,
        scheduledService: true,
        gpsTracking: true,
        medicalEquipment: true,
        driverManagement: true,
      },
      settings: {
        available24h: true,
        maxDistance: 50,
        emergencyPhone: "0812-3456-7890",
        responseTime: {
          emergency: 10,
          urgent: 30,
          scheduled: 60,
        },
        serviceArea: ["Jakarta Selatan", "Jakarta Pusat", "Jakarta Timur", "Depok"],
      },
    },
    {
      id: "prayer-times",
      name: "Jadwal Sholat",
      description: "Informasi waktu sholat dan kegiatan masjid",
      icon: <Clock className="h-6 w-6" />,
      color: "purple",
      enabled: true,
      features: {
        autoCalculation: true,
        notifications: true,
        qiblaDirection: true,
        specialEvents: true,
        monthlyCalendar: true,
      },
      settings: {
        location: {
          city: "Jakarta",
          latitude: -6.2088,
          longitude: 106.8456,
        },
        calculationMethod: "ISNA",
        adjustments: {
          fajr: 0,
          dhuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0,
        },
        notifications: {
          beforeAdhan: 5,
          afterAdhan: 0,
        },
      },
    },
    {
      id: "events",
      name: "Manajemen Kegiatan",
      description: "Pengelolaan acara dan kegiatan masjid",
      icon: <Calendar className="h-6 w-6" />,
      color: "indigo",
      enabled: true,
      features: {
        eventCreation: true,
        registration: true,
        notifications: true,
        attendance: true,
        feedback: true,
      },
      settings: {
        maxCapacity: 500,
        registrationRequired: true,
        autoReminder: true,
        reminderDays: [7, 3, 1],
        categories: ["Kajian", "Sosial", "Pendidikan", "Ramadan", "Idul Fitri", "Idul Adha"],
      },
    },
  ])

  const [selectedService, setSelectedService] = useState(services[0])
  const [isEditing, setIsEditing] = useState(false)

  const toggleService = (serviceId: string) => {
    setServices(
      services.map((service) => (service.id === serviceId ? { ...service, enabled: !service.enabled } : service)),
    )
  }

  const updateServiceSettings = (serviceId: string, newSettings: any) => {
    setServices(
      services.map((service) =>
        service.id === serviceId ? { ...service, settings: { ...service.settings, ...newSettings } } : service,
      ),
    )
  }

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      orange: "text-orange-600 bg-orange-50 border-orange-200",
      red: "text-red-600 bg-red-50 border-red-200",
      purple: "text-purple-600 bg-purple-50 border-purple-200",
      indigo: "text-indigo-600 bg-indigo-50 border-indigo-200",
    }
    return colors[color as keyof typeof colors] || colors.emerald
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Layanan</h1>
              <p className="text-gray-600">Konfigurasi dan pengaturan layanan masjid</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview Website
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Services List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span>Daftar Layanan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedService.id === service.id
                        ? getColorClasses(service.color)
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={selectedService.id === service.id ? "" : "text-gray-600"}>{service.icon}</div>
                        <div>
                          <h3 className="font-semibold text-sm">{service.name}</h3>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        {service.enabled ? (
                          <ToggleRight
                            className="h-6 w-6 text-emerald-600 cursor-pointer"
                            onClick={() => toggleService(service.id)}
                          />
                        ) : (
                          <ToggleLeft
                            className="h-6 w-6 text-gray-400 cursor-pointer"
                            onClick={() => toggleService(service.id)}
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{service.description}</p>
                    <div className="mt-2">
                      <Badge
                        className={service.enabled ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}
                      >
                        {service.enabled ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Service Configuration */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${getColorClasses(selectedService.color)}`}>
                      {selectedService.icon}
                    </div>
                    <div>
                      <CardTitle>{selectedService.name}</CardTitle>
                      <CardDescription>{selectedService.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={selectedService.enabled}
                      onCheckedChange={() => toggleService(selectedService.id)}
                    />
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {isEditing ? "Selesai Edit" : "Edit"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedService.enabled && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800 font-medium">Layanan ini sedang nonaktif</p>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">Aktifkan layanan untuk menampilkannya di website</p>
                  </div>
                )}

                <Tabs defaultValue="features" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="features">Fitur</TabsTrigger>
                    <TabsTrigger value="settings">Pengaturan</TabsTrigger>
                    <TabsTrigger value="appearance">Tampilan</TabsTrigger>
                  </TabsList>

                  <TabsContent value="features" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Fitur yang Tersedia</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedService.features).map(([key, enabled]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                              </p>
                              <p className="text-sm text-gray-600">{getFeatureDescription(key)}</p>
                            </div>
                            <Switch
                              checked={enabled as boolean}
                              disabled={!isEditing}
                              onCheckedChange={(checked) => {
                                if (isEditing) {
                                  const updatedFeatures = {
                                    ...selectedService.features,
                                    [key]: checked,
                                  }
                                  setSelectedService({
                                    ...selectedService,
                                    features: updatedFeatures,
                                  })
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Pengaturan Layanan</h3>
                      {renderServiceSettings(selectedService, isEditing, updateServiceSettings)}
                    </div>
                  </TabsContent>

                  <TabsContent value="appearance" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Pengaturan Tampilan</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Judul Layanan</Label>
                            <Input
                              id="title"
                              value={selectedService.name}
                              disabled={!isEditing}
                              onChange={(e) => {
                                if (isEditing) {
                                  setSelectedService({
                                    ...selectedService,
                                    name: e.target.value,
                                  })
                                }
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="color">Warna Tema</Label>
                            <select
                              id="color"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              value={selectedService.color}
                              disabled={!isEditing}
                              onChange={(e) => {
                                if (isEditing) {
                                  setSelectedService({
                                    ...selectedService,
                                    color: e.target.value,
                                  })
                                }
                              }}
                            >
                              <option value="emerald">Emerald</option>
                              <option value="blue">Blue</option>
                              <option value="orange">Orange</option>
                              <option value="red">Red</option>
                              <option value="purple">Purple</option>
                              <option value="indigo">Indigo</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Deskripsi</Label>
                          <Textarea
                            id="description"
                            value={selectedService.description}
                            disabled={!isEditing}
                            onChange={(e) => {
                              if (isEditing) {
                                setSelectedService({
                                  ...selectedService,
                                  description: e.target.value,
                                })
                              }
                            }}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function getFeatureDescription(key: string): string {
  const descriptions: { [key: string]: string } = {
    quickDonation: "Donasi cepat dengan jumlah preset",
    recurringDonation: "Donasi berulang otomatis",
    donationPrograms: "Program donasi dengan target",
    receiptGeneration: "Generate bukti donasi otomatis",
    donorAnalytics: "Analitik dan laporan donatur",
    zakatCalculator: "Kalkulator zakat otomatis",
    zakatMal: "Pembayaran zakat mal",
    zakatProfesi: "Pembayaran zakat profesi",
    zakatFitrah: "Pembayaran zakat fitrah",
    nisabUpdates: "Update nisab otomatis",
    animalSelection: "Pilihan hewan qurban",
    groupQurban: "Qurban berkelompok",
    certificateGeneration: "Generate sertifikat qurban",
    distributionTracking: "Tracking distribusi daging",
    photoDocumentation: "Dokumentasi foto penyembelihan",
    emergencyService: "Layanan darurat 24/7",
    scheduledService: "Layanan terjadwal",
    gpsTracking: "Tracking GPS ambulan",
    medicalEquipment: "Peralatan medis lengkap",
    driverManagement: "Manajemen driver",
    autoCalculation: "Perhitungan waktu otomatis",
    notifications: "Notifikasi waktu sholat",
    qiblaDirection: "Penunjuk arah kiblat",
    specialEvents: "Event khusus",
    monthlyCalendar: "Kalender bulanan",
    eventCreation: "Pembuatan event",
    registration: "Sistem registrasi",
    attendance: "Absensi peserta",
    feedback: "Sistem feedback",
  }
  return descriptions[key] || "Fitur layanan"
}

function renderServiceSettings(service: any, isEditing: boolean, updateSettings: Function) {
  switch (service.id) {
    case "donations":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minAmount">Minimum Donasi (IDR)</Label>
              <Input
                id="minAmount"
                type="number"
                value={service.settings.minAmount}
                disabled={!isEditing}
                onChange={(e) => {
                  if (isEditing) {
                    updateSettings(service.id, { minAmount: Number.parseInt(e.target.value) })
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="maxAmount">Maximum Donasi (IDR)</Label>
              <Input
                id="maxAmount"
                type="number"
                value={service.settings.maxAmount}
                disabled={!isEditing}
                onChange={(e) => {
                  if (isEditing) {
                    updateSettings(service.id, { maxAmount: Number.parseInt(e.target.value) })
                  }
                }}
              />
            </div>
          </div>
          <div>
            <Label>Metode Pembayaran</Label>
            <div className="flex space-x-4 mt-2">
              {["bank_transfer", "ewallet", "qris"].map((method) => (
                <label key={method} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={service.settings.paymentMethods.includes(method)}
                    disabled={!isEditing}
                    onChange={(e) => {
                      if (isEditing) {
                        const methods = e.target.checked
                          ? [...service.settings.paymentMethods, method]
                          : service.settings.paymentMethods.filter((m: string) => m !== method)
                        updateSettings(service.id, { paymentMethods: methods })
                      }
                    }}
                  />
                  <span className="capitalize">{method.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )

    case "zakat":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goldPrice">Harga Emas per Gram (IDR)</Label>
              <Input
                id="goldPrice"
                type="number"
                value={service.settings.goldPricePerGram}
                disabled={!isEditing}
                onChange={(e) => {
                  if (isEditing) {
                    updateSettings(service.id, { goldPricePerGram: Number.parseInt(e.target.value) })
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="zakatFitrah">Zakat Fitrah per Orang (IDR)</Label>
              <Input
                id="zakatFitrah"
                type="number"
                value={service.settings.zakatFitrahAmount}
                disabled={!isEditing}
                onChange={(e) => {
                  if (isEditing) {
                    updateSettings(service.id, { zakatFitrahAmount: Number.parseInt(e.target.value) })
                  }
                }}
              />
            </div>
          </div>
        </div>
      )

    case "ambulance":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyPhone">Nomor Darurat</Label>
              <Input
                id="emergencyPhone"
                value={service.settings.emergencyPhone}
                disabled={!isEditing}
                onChange={(e) => {
                  if (isEditing) {
                    updateSettings(service.id, { emergencyPhone: e.target.value })
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="maxDistance">Jarak Maksimal (KM)</Label>
              <Input
                id="maxDistance"
                type="number"
                value={service.settings.maxDistance}
                disabled={!isEditing}
                onChange={(e) => {
                  if (isEditing) {
                    updateSettings(service.id, { maxDistance: Number.parseInt(e.target.value) })
                  }
                }}
              />
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Pengaturan untuk layanan ini akan segera tersedia</p>
        </div>
      )
  }
}
