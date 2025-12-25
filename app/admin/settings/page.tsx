"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Globe,
  Bell,
  Shield,
  Database,
  Palette,
  Building,
  Save,
  RefreshCw,
  Upload,
  Download,
  Eye,
  EyeOff,
} from "lucide-react"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [showApiKey, setShowApiKey] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-gray-600">Konfigurasi dan pengaturan website masjid</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Default
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Simpan Semua
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="integrations">Integrasi</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informasi Masjid
              </CardTitle>
              <CardDescription>Pengaturan dasar informasi masjid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mosque-name">Nama Masjid</Label>
                  <Input id="mosque-name" defaultValue="Masjid Al Huda" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mosque-email">Email</Label>
                  <Input id="mosque-email" type="email" defaultValue="info@masjidalHuda.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mosque-phone">Telepon</Label>
                  <Input id="mosque-phone" defaultValue="021-1234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mosque-website">Website</Label>
                  <Input id="mosque-website" defaultValue="https://masjidalHuda.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mosque-address">Alamat Lengkap</Label>
                <Textarea
                  id="mosque-address"
                  placeholder="Alamat lengkap masjid..."
                  defaultValue="Jl. Masjid Raya No. 123, Jakarta Pusat, DKI Jakarta 10110"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mosque-description">Deskripsi Masjid</Label>
                <Textarea
                  id="mosque-description"
                  placeholder="Deskripsi singkat tentang masjid..."
                  defaultValue="Masjid Al Huda adalah masjid yang melayani masyarakat dengan berbagai program keagamaan dan sosial."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Kapasitas Jamaah</Label>
                  <Input id="capacity" type="number" defaultValue="500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="established">Tahun Berdiri</Label>
                  <Input id="established" type="number" defaultValue="1995" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Pengaturan Website
              </CardTitle>
              <CardDescription>Konfigurasi umum website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-title">Judul Website</Label>
                  <Input id="site-title" defaultValue="Masjid Al Huda - Website Resmi" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-language">Bahasa Default</Label>
                  <Select defaultValue="id">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  placeholder="Deskripsi untuk SEO..."
                  defaultValue="Website resmi Masjid Al Huda - Informasi jadwal sholat, kegiatan, donasi, dan layanan masjid"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mode Maintenance</Label>
                    <p className="text-sm text-gray-600">Aktifkan untuk maintenance website</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Registrasi User Baru</Label>
                    <p className="text-sm text-gray-600">Izinkan pendaftaran user baru</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Komentar Publik</Label>
                    <p className="text-sm text-gray-600">Izinkan komentar di artikel/kegiatan</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Tema dan Tampilan
              </CardTitle>
              <CardDescription>Kustomisasi tampilan website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema Warna</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-600 rounded-full border-2 border-green-600"></div>
                      <span className="text-sm">Hijau (Default)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-gray-300"></div>
                      <span className="text-sm">Biru</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full border-2 border-gray-300"></div>
                      <span className="text-sm">Ungu</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-orange-600 rounded-full border-2 border-gray-300"></div>
                      <span className="text-sm">Orange</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Logo Masjid</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-upload">Banner Header</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-400">Banner</span>
                    </div>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Banner
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select defaultValue="inter">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="poppins">Poppins</SelectItem>
                        <SelectItem value="arabic">Arabic Font</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Ukuran Font</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Kecil</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="large">Besar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mode Gelap</Label>
                    <p className="text-sm text-gray-600">Aktifkan tema gelap</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Pengaturan Notifikasi
              </CardTitle>
              <CardDescription>Konfigurasi sistem notifikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notifikasi Email</Label>
                    <p className="text-sm text-gray-600">Kirim notifikasi via email</p>
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Push Notification</Label>
                    <p className="text-sm text-gray-600">Notifikasi browser</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Pengaturan Email</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" placeholder="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" placeholder="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">Username</Label>
                    <Input id="smtp-username" placeholder="email@gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input id="smtp-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Pengaturan WhatsApp</h3>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-api">WhatsApp API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="whatsapp-api"
                      type={showApiKey ? "text" : "password"}
                      placeholder="API Key WhatsApp Business"
                    />
                    <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Integrasi Layanan
              </CardTitle>
              <CardDescription>Konfigurasi integrasi dengan layanan eksternal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">M</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Midtrans Payment</h3>
                      <p className="text-sm text-gray-600">Gateway pembayaran untuk donasi</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">G</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Google Maps</h3>
                      <p className="text-sm text-gray-600">Integrasi peta lokasi masjid</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold">W</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">WhatsApp Business</h3>
                      <p className="text-sm text-gray-600">Notifikasi dan komunikasi</p>
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold">F</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Firebase</h3>
                      <p className="text-sm text-gray-600">Push notifications dan analytics</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">API Keys</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="midtrans-key">Midtrans Server Key</Label>
                    <Input id="midtrans-key" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="google-maps-key">Google Maps API Key</Label>
                    <Input id="google-maps-key" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Keamanan Sistem
              </CardTitle>
              <CardDescription>Pengaturan keamanan dan akses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Aktifkan 2FA untuk admin</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Login Attempt Limit</Label>
                    <p className="text-sm text-gray-600">Batasi percobaan login</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">IP Whitelist</Label>
                    <p className="text-sm text-gray-600">Batasi akses berdasarkan IP</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-password">Minimum Karakter</Label>
                    <Input id="min-password" type="number" defaultValue="8" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Masa Berlaku (hari)</Label>
                    <Input id="password-expiry" type="number" defaultValue="90" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="require-uppercase" defaultChecked />
                    <Label htmlFor="require-uppercase">Wajib huruf besar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="require-numbers" defaultChecked />
                    <Label htmlFor="require-numbers">Wajib angka</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="require-symbols" />
                    <Label htmlFor="require-symbols">Wajib simbol</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>Kelola backup data sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto Backup</Label>
                    <p className="text-sm text-gray-600">Backup otomatis harian</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Frekuensi Backup</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-retention">Simpan Backup (hari)</Label>
                  <Input id="backup-retention" type="number" defaultValue="30" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Manual Backup</h3>
                <div className="flex gap-2">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Backup Files
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Restore</h3>
                <div className="space-y-2">
                  <Label htmlFor="restore-file">Upload Backup File</Label>
                  <Input id="restore-file" type="file" accept=".sql,.zip" />
                </div>
                <Button variant="destructive">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
