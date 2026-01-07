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

import { toast } from "@/components/ui/use-toast"
// Import API Zakat
import { createZakatPayment, getZakatDistribution, ZakatDistributionItem } from "@/lib/api/zakat"
import type { CreateZakatPaymentPayload } from "@/app/types/zakat"

export default function ZakatPage() {
  // --- STATE FORM PEMBAYARAN ---
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

  // --- STATE DISTRIBUSI (REALTIME) ---
  const [distributionStats, setDistributionStats] = useState<ZakatDistributionItem[]>([])
  const [totalZakatPool, setTotalZakatPool] = useState(0)

  // --- FETCH DATA DISTRIBUSI ON LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getZakatDistribution()
        setDistributionStats(data.distribution)
        setTotalZakatPool(data.total_zakat)
      } catch (err) {
        console.error("Gagal memuat data distribusi", err)
      }
    }
    fetchData()
  }, [])

  // --- LOGIC FORM ---
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

  const validate = (): string | null => {
    if (!paymentForm.name.trim()) return "Nama utama wajib diisi."
    if (!paymentForm.email.trim()) return "Email wajib diisi."
    if (!paymentForm.phone.trim()) return "Nomor telepon wajib diisi."
    if (paymentForm.peopleCount < 1) return "Jumlah orang minimal 1."
    if (paymentForm.amount <= 0) return "Jumlah zakat tidak boleh 0."
    return null
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const v = validate()
    if (v) {
      toast({ title: "Validasi", description: v, variant: "destructive" })
      return
    }

    setLoading(true)

    const payload: CreateZakatPaymentPayload = {
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

      if (res.redirect_url) {
        window.location.href = res.redirect_url
        return
      }

      // Jika backend tidak kirim redirect_url (misal mode manual/testing), beri notif sukses
      toast({
        title: "Berhasil",
        description: "Data zakat berhasil dikirim. Silakan lanjutkan pembayaran.",
      })
      // Optional: Reset form here
    } catch (err: any) {
      console.error("zakat submit error:", err)
      toast({
        title: "Gagal",
        description: err?.message || "Server error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper Format Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 to-blue-50/40">
      {/* HEADER */}
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

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="payment" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="w-full grid grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="payment">Pembayaran Zakat</TabsTrigger>
              <TabsTrigger value="distribution">Laporan Penyaluran</TabsTrigger>
            </TabsList>
          </div>

          {/* =============================== */}
          {/* TAB 1: FORM PEMBAYARAN */}
          {/* =============================== */}
          <TabsContent value="payment">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT: FORM */}
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Banknote className="h-6 w-6 text-emerald-600" />
                    <span>Form Pembayaran Zakat Fitrah</span>
                  </CardTitle>
                  <CardDescription>Isi data untuk memproses pembayaran zakat fitrah.</CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">

                    {/* INPUT GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Nama Lengkap</Label>
                        <Input
                          placeholder="Nama lengkap (Muzakki)"
                          value={paymentForm.name}
                          onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={paymentForm.email}
                          onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>No. Telepon / WA</Label>
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
                            type="text" 
                            value={formatCurrency(paymentForm.amount)} 
                            disabled 
                            className="bg-white text-lg font-bold text-emerald-700 mt-1" 
                        />
                        <p className="text-xs text-emerald-600 mt-1">*Nilai setara 2.5 kg beras (Rp 50.000) per jiwa.</p>
                      </div>
                    </div>

                    {/* EXTRA NAMES */}
                    {paymentForm.peopleCount > 1 && (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                        <Label>Nama Anggota Keluarga (Niat Zakat Untuk)</Label>
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
                        placeholder="Alamat lengkap domisili"
                        value={paymentForm.address}
                        onChange={(e) => setPaymentForm({ ...paymentForm, address: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Niat / Doa (Opsional)</Label>
                      <Textarea
                        placeholder="Tuliskan niat atau doa khusus..."
                        value={paymentForm.message}
                        onChange={(e) => setPaymentForm({ ...paymentForm, message: e.target.value })}
                      />
                    </div>

                    <Button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6" type="submit">
                      {loading ? "Memproses..." : "Bayar Zakat Sekarang"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* RIGHT: INFORMASI ZAKAT */}
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

          {/* =============================== */}
          {/* TAB 2: DISTRIBUSI (DATA REALTIME) */}
          {/* =============================== */}
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

                        {/* Progress Bar dengan warna dinamis dari API */}
                        <Progress 
                            value={item.percentage} 
                            className={`h-3 ${item.color.replace('bg-', 'text-')}`} 
                            // Note: Shadcn Progress uses 'indicatorClassName' for color usually, 
                            // or verify if your Progress component supports className override
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