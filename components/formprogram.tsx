"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HandHeart } from "lucide-react"
import { useDonation } from "@/contexts/donation-context"

export default function DonationPopup({ program, onClose }: { program: any; onClose: () => void }) {
  const donationCtx = useDonation()
  const submitDonation = donationCtx?.submitDonation
  const isLoading = donationCtx?.isLoading || false

  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [donor, setDonor] = useState({ name: "", phone: "", email: "", message: "" })

  const quickAmounts = [
    { amount: "50000", label: "Rp 50.000" },
    { amount: "100000", label: "Rp 100.000" },
    { amount: "250000", label: "Rp 250.000" },
    { amount: "500000", label: "Rp 500.000" },
    { amount: "1000000", label: "Rp 1.000.000" },
    { amount: "custom", label: "Jumlah Lain" },
  ]

  const handleDonate = async () => {
    if (!selectedAmount) return alert("Lengkapi nominal dan metode pembayaran")
    if (!donor.name || !donor.phone || !donor.email) return alert("Isi data donatur dengan lengkap")
    if (!submitDonation) return alert("Donation service not ready")

    const amount = selectedAmount === "custom" ? parseInt(customAmount) : parseInt(selectedAmount)

    const donationData = {
      program_id: program?.id,
      name: donor.name,
      phone: donor.phone,
      email: donor.email,
      amount,
      message: donor.message,
      payment_method: paymentMethod,
      donation_type: "program"
    }

    await submitDonation(donationData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HandHeart className="h-6 w-6 text-emerald-600" />
            <span>Donasi untuk {program?.title}</span>
          </CardTitle>
          <CardDescription>Isi data berikut untuk melanjutkan donasi</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Amount */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Pilih Jumlah Donasi</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickAmounts.map((item) => (
                <Button
                  key={item.amount}
                  variant={selectedAmount === item.amount ? "default" : "outline"}
                  className={`h-11 ${selectedAmount === item.amount ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
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
                className="mt-3 h-11"
              />
            )}
          </div>

          {/* Donor Info */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Informasi Donatur</Label>
            <Input placeholder="Nama Lengkap" value={donor.name} onChange={(e) => setDonor({ ...donor, name: e.target.value })} />
            <Input placeholder="Nomor Telepon" value={donor.phone} onChange={(e) => setDonor({ ...donor, phone: e.target.value })} />
            <Input placeholder="Email" value={donor.email} onChange={(e) => setDonor({ ...donor, email: e.target.value })} />
            <Textarea placeholder="Pesan (opsional)" rows={3} value={donor.message} onChange={(e) => setDonor({ ...donor, message: e.target.value })} />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleDonate} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Memproses..." : "Lanjutkan Donasi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
