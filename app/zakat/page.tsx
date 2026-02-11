"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Info, Banknote, Users, HelpCircle, PieChart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

// --- GANTI IMPORT TOAST AGAR SERAGAM DENGAN DONASI PAGE ---
import { toast, Toaster } from "react-hot-toast"

// Import API Zakat
import { 
  createZakatPayment, 
  getZakatDistribution, 
  getDistributionLogs, 
  ZakatDistributionItem 
} from "@/lib/api/zakat"
import type { CreateZakatPaymentPayload } from "@/app/types/zakat"

// Definisi Snap
declare global {
  interface Window {
    snap: any;
  }
}

// Helper User ID
function getUserIdFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/user_id=(\d+)/);
  return match ? Number(match[1]) : null;
}

export default function ZakatPage() {
  // --- STATE FORM ---
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    zakatType: "fitrah",
    peopleCount: 1,
    amount: 50000,
    extraNames: [] as string[],
    message: "",
  })

  const [loading, setLoading] = useState(false)

  // --- STATE DISTRIBUSI ---
  const [distributionStats, setDistributionStats] = useState<ZakatDistributionItem[]>([])
  const [totalZakatPool, setTotalZakatPool] = useState(0)

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distData, logsData] = await Promise.all([
            getZakatDistribution(),
            getDistributionLogs().catch(() => [])
        ])

        const logs = Array.isArray(logsData) ? logsData : []
        const recipientMap: Record<number, number> = {}

        logs.forEach((log: any) => {
            const catId = log.distribution_setting_id
            const count = Number(log.recipient_count) || 0
            recipientMap[catId] = (recipientMap[catId] || 0) + count
        })

        const mergedData = distData.distribution.map((item: any) => ({
            ...item,
            recipients: recipientMap[item.id] || 0
        }))

        setDistributionStats(mergedData)
        setTotalZakatPool(distData.total_zakat)

      } catch (err) {
        console.error("Gagal memuat data distribusi", err)
      }
    }
    fetchData()
  }, [])

  // --- LOGIC FORM UPDATE ---
  const handlePeopleCount = (value: number) => {
    const count = value < 1 ? 1 : Math.floor(value)
    setPaymentForm((prev) => ({
      ...prev,
      peopleCount: count,
      amount: count * 50000,
      extraNames: Array(Math.max(0, count - 1))
        .fill("")
        .map((_, i) => prev.extraNames[i] || ""),
    }))
  }

  const handleExtraNameChange = (index: number, value: string) => {
    const updated = [...paymentForm.extraNames]
    updated[index] = value
    setPaymentForm({ ...paymentForm, extraNames: updated })
  }

  // --- LOGIC SUBMIT (DIPERBAIKI VALIDASINYA) ---
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. VALIDASI DATA DIRI (Menggunakan Toast)
    if (!paymentForm.name.trim()) { 
        toast.error("Nama lengkap wajib diisi")
        return 
    }
    if (!paymentForm.email.trim()) { 
        toast.error("Email wajib diisi untuk bukti pembayaran")
        return 
    }
    if (!paymentForm.phone.trim()) { 
        toast.error("Nomor telepon wajib diisi")
        return 
    }
    if (paymentForm.amount <= 0) { 
        toast.error("Nominal zakat tidak valid")
        return 
    }

    // 2. Cek User ID
    let userId = getUserIdFromCookie();
    if (!userId) {
        userId = 0; // Fallback untuk user guest
    }

    // 3. Cek Script Snap Midtrans
    if (typeof window.snap === "undefined") {
        toast.error("Sistem pembayaran belum siap. Silakan refresh halaman.")
        return;
    }

    setLoading(true)
    const loadingToast = toast.loading("Memproses pembayaran...")

    const payload: CreateZakatPaymentPayload = {
      user_id: userId || undefined,
      name: paymentForm.name.trim(),
      email: paymentForm.email.trim(),
      phone: paymentForm.phone.trim(),
      address: paymentForm.address.trim(),
      zakat_type: paymentForm.zakatType,
      total_people: paymentForm.peopleCount,
      amount: paymentForm.amount,
      extra_names: paymentForm.extraNames.filter(Boolean),
      message: paymentForm.message.trim(),
    }

    try {
      const res = await createZakatPayment(payload)

      if (!res?.token) {
        throw new Error("Gagal mendapatkan token pembayaran.")
      }

      toast.dismiss(loadingToast)
      
      // 4. POPUP MIDTRANS
      window.snap.pay(res.token, {
        onSuccess: function(result: any) {
            window.location.assign(`/payment/status?order_id=${result.order_id}&transaction_status=${result.transaction_status}&status_code=${result.status_code}`);
        },
        onPending: function(result: any) {
            window.location.assign(`/payment/status?order_id=${result.order_id}&transaction_status=pending&status_code=${result.status_code}`);
        },
        onError: function(result: any) {
            window.location.assign(`/payment/status?order_id=${result.order_id}&transaction_status=error&status_code=${result.status_code}`);
        },
        onClose: function() {
            toast.error("Pembayaran dibatalkan/belum selesai")
        }
      })

    } catch (err: any) {
      console.error("Error Submit:", err)
      toast.dismiss(loadingToast)
      toast.error(err?.message || "Terjadi kesalahan server saat memproses zakat")
    } finally {
      setLoading(false)
    }
  }

  // Format Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 to-blue-50/40 font-sans">
      
      {/* --- TOASTER --- */}
      <Toaster position="top-center" reverseOrder={false} />

      <header className="bg-white/95 backdrop-blur border-b shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Zakat Masjid Al Huda</h1>
              <p className="text-gray-600">Pembayaran & informasi zakat terpercaya</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="payment" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="w-full grid grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="payment">Pembayaran Zakat</TabsTrigger>
              <TabsTrigger value="distribution">Laporan Penyaluran</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payment">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Banknote className="h-6 w-6 text-emerald-600" />
                    <span>Form Pembayaran Zakat Fitrah</span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="Nama lengkap (Muzakki)"
                          value={paymentForm.name}
                          onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email <span className="text-red-500">*</span></Label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={paymentForm.email}
                          onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>No. Telepon / WA <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="08xxxxxxxx"
                          value={paymentForm.phone}
                          onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Jumlah Jiwa</Label>
                        <Input
                          type="number"
                          min={1}
                          value={paymentForm.peopleCount}
                          onChange={(e) => handlePeopleCount(Number(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-2 bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                        <Label className="text-emerald-800">Total Zakat (IDR)</Label>
                        <Input 
                            readOnly
                            value={formatCurrency(paymentForm.amount)} 
                            className="bg-white text-lg font-bold text-emerald-700 mt-1" 
                        />
                      </div>
                    </div>

                    {paymentForm.peopleCount > 1 && (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                        <Label>Nama Anggota Keluarga</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {paymentForm.extraNames.map((name, i) => (
                            <Input
                                key={i}
                                placeholder={`Nama orang ke-${i + 2}`}
                                value={name}
                                onChange={(e) => handleExtraNameChange(i, e.target.value)}
                                className="bg-white"
                            />
                            ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Alamat</Label>
                      <Textarea
                        value={paymentForm.address}
                        onChange={(e) => setPaymentForm({ ...paymentForm, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Niat / Doa</Label>
                      <Textarea
                        value={paymentForm.message}
                        onChange={(e) => setPaymentForm({ ...paymentForm, message: e.target.value })}
                      />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6 shadow-lg shadow-emerald-100"
                    >
                      {loading ? "Sedang Memproses..." : "Bayar Zakat Sekarang"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              

              {/* SIDEBAR INFO */}
              <div className="space-y-6">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Info className="h-5 w-5 text-emerald-600" />
                      <span>Apa itu Zakat Fitrah?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-gray-700 text-sm">
                    <p>Zakat fitrah adalah zakat wajib yang dikeluarkan oleh setiap muslim menjelang Idulfitri untuk mensucikan diri.</p>
                    <div className="bg-emerald-50 p-3 rounded font-medium text-emerald-800 mt-2">
                        Besaran: 2.5 kg beras atau Rp 50.000
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Siapa yang wajib?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-700 space-y-2 text-sm">
                    <p>Zakat fitrah wajib untuk:</p>
                    <ul className="list-disc ml-5">
                      <li>Setiap muslim yang hidup saat bulan Ramadan</li>
                      <li>Memiliki kelebihan makanan untuk hari raya</li>
                      <li>Kepala keluarga menanggung anggota keluarganya</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <HelpCircle className="h-5 w-5 text-purple-600" />
                      <span>Kapan dibayarkan?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-700 text-sm space-y-2">
                    <p>Waktu terbaik adalah sejak awal Ramadan hingga sebelum shalat Idulfitri dilaksanakan.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-emerald-600"/>
                            Transparansi Penyaluran
                        </CardTitle>
                        <CardDescription>Laporan penyaluran dana zakat kepada asnaf yang berhak.</CardDescription>
                    </div>
                    <div className="text-right bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Total Dana Terkumpul</p>
                        <p className="text-xl font-bold text-emerald-800">
                            {formatCurrency(totalZakatPool)}
                        </p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {distributionStats.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>Belum ada data distribusi zakat saat ini.</p>
                    </div>
                ) : (
                    distributionStats.map((item, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="font-semibold text-gray-800">{item.category}</p>
                                <p className="text-xs text-gray-500">Alokasi: {item.percentage}%</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-700">{formatCurrency(item.amount)}</p>
                            </div>
                        </div>

                        <Progress 
                            value={item.percentage} 
                            className={`h-3 ${item.color.replace('bg-', 'text-')}`} 
                        />
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 p-2 rounded">
                            <span>Target Penyaluran:</span>
                            <span className="font-medium text-gray-900">{item.recipients} Penerima Manfaat</span>
                        </div>
                    </div>
                    ))
                )}

                <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg flex gap-3 border border-blue-100">
                    <Info className="h-5 w-5 flex-shrink-0" />
                    <p>
                        Data di atas adalah kalkulasi real-time berdasarkan total dana zakat yang masuk. 
                        Penyaluran aktual dilakukan secara bertahap oleh panitia Amil Zakat Masjid Al Huda 
                        sesuai dengan survei dan verifikasi mustahik di lapangan.
                    </p>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}