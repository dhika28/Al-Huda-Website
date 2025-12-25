"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  HandHeart,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDonation } from "@/contexts/donation-context"
import DonationPopup from "@/components/formprogram"

export default function DonasiPageClient() {
  const donationCtx = useDonation()

  const programs = donationCtx?.programs || []
  const donations = donationCtx?.donations || []
  const submitDonation = donationCtx?.submitDonation
  const isLoading = donationCtx?.isLoading || false

  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [donor, setDonor] = useState({ name: "", phone: "", email: "", message: "" })

  const [openPopup, setOpenPopup] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<any>(null)

  const quickAmounts = [
    { amount: "50000", label: "Rp 50.000" },
    { amount: "100000", label: "Rp 100.000" },
    { amount: "250000", label: "Rp 250.000" },
    { amount: "500000", label: "Rp 500.000" },
    { amount: "1000000", label: "Rp 1.000.000" },
    { amount: "custom", label: "Jumlah Lain" },
  ]

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)

  const getProgress = (collected: number, target: number) => (target > 0 ? Math.round((collected / target) * 100) : 0)

  const handleDonate = async () => {
    if (!selectedAmount) return alert("Lengkapi nominal dan metode pembayaran")
    if (!donor.name || !donor.phone || !donor.email) return alert("Isi data donatur dengan lengkap")
    if (!submitDonation) return alert("Donation service not ready")

    const amount = selectedAmount === "custom" ? parseInt(customAmount) : parseInt(selectedAmount)

    const donationData = {
      program_id: null,
      name: donor.name,
      phone: donor.phone,
      email: donor.email,
      amount,
      message: donor.message,
      payment_method: paymentMethod,
      donation_type: "quick",
    }

    await submitDonation(donationData)
  }

  if (!donationCtx) {
    return <p className="text-center py-20 text-gray-500">Memuat data donasi...</p>
  }

  return (
    <div className="min-h-screen bg-white">
      {openPopup && (
        <DonationPopup program={selectedProgram} onClose={() => setOpenPopup(false)} />
      )}

      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-50">
              <ArrowLeft className="h-5 w-5 text-emerald-600" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Donasi & Infaq</h1>
            <p className="text-sm text-gray-500">Wujudkan kebermanfaatan bersama</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT SECTION */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="quick" className="space-y-6">
              {/* TABS */}
              <TabsList className="w-full grid grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="quick" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Donasi Cepat</TabsTrigger>
                <TabsTrigger value="program" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Pilih Program</TabsTrigger>
              </TabsList>

              {/* --- DONASI CEPAT --- */}
              <TabsContent value="quick" className="space-y-6">
                <Card className="border-0 shadow-md rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-emerald-700">
                      <HandHeart className="h-6 w-6" />
                      Donasi Umum
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Salurkan donasi untuk operasional masjid & kegiatan sosial
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">

                    {/* NOMINAL */}
                    <div>
                      <Label className="text-base font-semibold">Nominal Donasi</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                        {quickAmounts.map((item) => (
                          <Button
                            key={item.amount}
                            variant={selectedAmount === item.amount ? "default" : "outline"}
                            className={`h-12 rounded-xl text-sm font-medium transition ${
                              selectedAmount === item.amount ? "bg-emerald-600 text-white" : "hover:bg-gray-100"
                            }`}
                            onClick={() => setSelectedAmount(item.amount)}
                          >
                            {item.label}
                          </Button>
                        ))}
                      </div>

                      {selectedAmount === "custom" && (
                        <Input
                          type="number"
                          placeholder="Masukkan jumlah donasi"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="h-12 text-lg mt-3 rounded-xl"
                        />
                      )}
                    </div>

                    {/* FORM DONATUR */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Data Donatur</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nama Lengkap</Label>
                          <Input className="rounded-xl" value={donor.name} onChange={(e) => setDonor({ ...donor, name: e.target.value })} />
                        </div>
                        <div>
                          <Label>Nomor Telepon</Label>
                          <Input className="rounded-xl" value={donor.phone} onChange={(e) => setDonor({ ...donor, phone: e.target.value })} />
                        </div>
                      </div>

                      <div>
                        <Label>Email</Label>
                        <Input type="email" className="rounded-xl" value={donor.email} onChange={(e) => setDonor({ ...donor, email: e.target.value })} />
                      </div>

                      <div>
                        <Label>Pesan (Opsional)</Label>
                        <Textarea rows={3} className="rounded-xl" value={donor.message} onChange={(e) => setDonor({ ...donor, message: e.target.value })} />
                      </div>
                    </div>

                    {/* BUTTON */}
                    <Button
                      onClick={handleDonate}
                      disabled={isLoading}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-lg"
                    >
                      {isLoading ? "Memproses..." : "Lanjutkan Donasi"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* --- PROGRAM DONASI --- */}
              <TabsContent value="program" className="space-y-6">
                {programs.length > 0 ? (
                  programs.map((program) => (
                    <Card key={program.id} className="border-0 shadow-md rounded-2xl hover:shadow-lg transition">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-emerald-600 p-3 rounded-xl text-white">
                            <Target className="h-6 w-6" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{program.description}</p>

                            <div className="mt-4 space-y-3">
                              <div className="flex justify-between text-sm text-gray-700">
                                <span>{formatCurrency(program.collected)}</span>
                                <span>Target {formatCurrency(program.target)}</span>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${getProgress(program.collected, program.target)}%` }}
                                ></div>
                              </div>

                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                  <Users className="h-4 w-4" /> {program.donors || 0} donatur
                                </span>

                                <Button
                                  className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                  onClick={() => {
                                    setSelectedProgram(program)
                                    setOpenPopup(true)
                                  }}
                                >
                                  Donasi Sekarang
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">Belum ada program donasi</p>
                )}
              </TabsContent>
              {/* Informasi Penting */}
              <div className="rounded-xl border bg-white shadow-sm p-6 mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penting</h4>

                <ul className="space-y-4 text-sm text-gray-700">
                  <li className="flex items-start space-x-3">
                    <div className="h-6 w-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-md">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span>
                      Seluruh donasi akan dicatat secara otomatis dan dapat dilihat pada menu <strong>Riwayat Donasi</strong>.
                    </span>
                  </li>

                  <li className="flex items-start space-x-3">
                    <div className="h-6 w-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-md">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span>
                      Donasi program akan disalurkan sesuai kebutuhan program terkait dan tidak dicampur dengan donasi umum.
                    </span>
                  </li>

                  <li className="flex items-start space-x-3">
                    <div className="h-6 w-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-md">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span>
                      Nominal donasi bersifat fleksibel. Tidak ada jumlah minimum ataupun maksimum.
                    </span>
                  </li>

                  <li className="flex items-start space-x-3">
                    <div className="h-6 w-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-md">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span>
                      Bukti donasi elektronik akan dikirim ke email setelah pembayaran berhasil.
                    </span>
                  </li>
                </ul>
              </div>


            </Tabs>
          </div>


          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {donations.length > 0 && (
              <>
                <h3 className="font-semibold text-gray-800 text-lg">Donasi Terbaru</h3>

                {donations.map((donation, index) => (
                  <Card key={index} className="border-0 shadow-sm rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <HandHeart className="h-5 w-5 text-emerald-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-gray-900">{donation.name}</p>
                          <Badge className="text-xs bg-emerald-600 text-white">
                            {formatCurrency(donation.amount)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(donation.created_at || "").toLocaleString("id-ID")}</p>
                        {donation.message && <p className="text-xs mt-1 italic text-gray-700">"{donation.message}"</p>}
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
