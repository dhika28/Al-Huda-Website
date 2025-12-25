"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Info, Banknote, Users, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

import { toast } from "@/components/ui/use-toast"
import { createZakatPayment } from "@/lib/api/zakat"
import type { CreateZakatPaymentPayload } from "@/app/types/zakat"

export default function ZakatPage() {
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

      toast({
        title: "Error",
        description: "Midtrans URL tidak ditemukan di response backend.",
        variant: "destructive",
      })
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

  const distributionData = [
    { category: "Fakir & Miskin", percentage: 60, amount: 180000000, recipients: 450, color: "bg-emerald-500" },
    { category: "Amil Zakat", percentage: 12.5, amount: 37500000, recipients: 15, color: "bg-blue-500" },
    { category: "Muallaf", percentage: 12.5, amount: 37500000, recipients: 25, color: "bg-purple-500" },
    { category: "Riqab & Gharimin", percentage: 15, amount: 45000000, recipients: 30, color: "bg-orange-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 to-blue-50/40">
      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Zakat Masjid Al Huda</h1>
              <p className="text-gray-600">Pembayaran & informasi zakat</p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="payment" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment">Pembayaran Zakat</TabsTrigger>
            <TabsTrigger value="distribution">Distribusi Zakat</TabsTrigger>
          </TabsList>

          {/* =============================== */}
          {/* FORM PEMBAYARAN + INFO ZAKAT */}
          {/* =============================== */}
          <TabsContent value="payment">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT: FORM */}
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Banknote className="h-6 w-6 text-emerald-600" />
                    <span>Form Pembayaran Zakat</span>
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
                          placeholder="Nama lengkap"
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
                        <Label>No. Telepon</Label>
                        <Input
                          placeholder="08xxxxxxxx"
                          value={paymentForm.phone}
                          onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Jumlah Orang</Label>
                        <Input
                          type="number"
                          min={1}
                          value={paymentForm.peopleCount}
                          onChange={(e) => handlePeopleCount(Number(e.target.value))}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Total Zakat (IDR)</Label>
                        <Input type="number" value={paymentForm.amount} disabled className="bg-gray-100" />
                        <p className="text-sm text-gray-500 mt-1">Per orang: Rp 50.000 (beras 2.5 kg)</p>
                      </div>
                    </div>

                    {/* EXTRA NAMES */}
                    {paymentForm.peopleCount > 1 && (
                      <div className="space-y-3">
                        <Label>Nama Tambahan</Label>
                        {paymentForm.extraNames.map((name, i) => (
                          <Input
                            key={i}
                            placeholder={`Nama orang ke-${i + 2}`}
                            value={name}
                            onChange={(e) => handleExtraNameChange(i, e.target.value)}
                          />
                        ))}
                      </div>
                    )}

                    <div>
                      <Label>Alamat</Label>
                      <Textarea
                        placeholder="Alamat lengkap"
                        value={paymentForm.address}
                        onChange={(e) => setPaymentForm({ ...paymentForm, address: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Catatan</Label>
                      <Textarea
                        placeholder="Catatan opsional"
                        value={paymentForm.message}
                        onChange={(e) => setPaymentForm({ ...paymentForm, message: e.target.value })}
                      />
                    </div>

                    <Button disabled={loading} className="w-full" type="submit">
                      {loading ? "Memproses..." : "Bayar Sekarang"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* RIGHT: INFORMASI ZAKAT */}
              <div className="space-y-6">
                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="h-5 w-5 text-emerald-600" />
                      <span>Apa itu Zakat Fitrah?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-gray-700">
                    <p>Zakat fitrah adalah zakat wajib yang dikeluarkan oleh setiap muslim menjelang Idulfitri.</p>
                    <p>Besaran zakat fitrah ditetapkan setara:</p>
                    <ul className="list-disc ml-5 text-sm">
                      <li>2.5 kg beras</li>
                      <li>Atau senilai Rp 50.000</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Siapa yang wajib?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-700 space-y-2">
                    <p>Zakat fitrah wajib untuk:</p>
                    <ul className="list-disc ml-5 text-sm">
                      <li>Setiap muslim hidup sebelum maghrib malam Idulfitri</li>
                      <li>Kepala keluarga membayarkan untuk seluruh anggota</li>
                      <li>Bayi hingga dewasa</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5 text-purple-600" />
                      <span>Kapan dibayarkan?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-700 text-sm space-y-2">
                    <p>Waktu terbaik membayar zakat fitrah:</p>
                    <ul className="list-disc ml-5">
                      <li>Sejak awal Ramadan</li>
                      <li>Paling lambat sebelum salat Id</li>
                    </ul>
                    <p className="text-xs text-gray-500">*Melewati waktu tersebut hukumnya menjadi sedekah biasa.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* DISTRIBUSI */}
          <TabsContent value="distribution">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Distribusi Zakat</CardTitle>
                <CardDescription>Penyaluran dana zakat sesuai asnaf</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {distributionData.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <p className="font-medium">{item.category}</p>
                      <p>{item.percentage}%</p>
                    </div>

                    <Progress value={item.percentage} className={item.color} />

                    <p className="text-sm text-gray-600">
                      {item.recipients} penerima • Rp {item.amount.toLocaleString()}
                    </p>
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
