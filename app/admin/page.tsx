"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  DollarSign,
  Calendar,
  Truck,
  Bell,
  Plus,
  Download,
  Search,
  Home,
  Heart,
  AlertTriangle,
  HandHeart,
  Clock,
  BarChart3,
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

/* =======================
   DUMMY DATA
======================= */
const chartData = [
  { name: "Jan", total: 20 },
  { name: "Feb", total: 35 },
  { name: "Mar", total: 28 },
  { name: "Apr", total: 45 },
  { name: "Mei", total: 38 },
  { name: "Jun", total: 50 },
]

const COLORS = ["#10b981", "#059669", "#047857", "#065f46", "#064e3b", "#064e3b"] // Gradient hijau emerald

export default function AdminDashboard() {
  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">

        {/* MAIN CONTENT - Scrollable & Full Width */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
          {/* STAT CARDS - Lebih rapat & modern */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Users" value="1.234" icon={<Users className="h-5 w-5" />} color="text-blue-600" />
            <StatCard title="Donasi" value="Rp 125 Jt" icon={<DollarSign className="h-5 w-5" />} color="text-emerald-600" />
            <StatCard title="Zakat" value="Rp 35 Jt" icon={<Heart className="h-5 w-5" />} color="text-purple-600" />
            <StatCard title="Kegiatan" value="12" icon={<Calendar className="h-5 w-5" />} color="text-orange-600" />
            <StatCard title="Qurban" value="27" icon={<HandHeart className="h-5 w-5" />} color="text-pink-600" />
            <StatCard title="Ambulance" value="3" icon={<Truck className="h-5 w-5" />} color="text-indigo-600" />
          </div>

          {/* CHART & SIDE PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CHART - Lebih besar & cantik */}
            <Card className="lg:col-span-2 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                  Statistik Kegiatan (6 Bulan Terakhir)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="total" radius={[12, 12, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* SIDE PANEL */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Perlu Tindakan Segera
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>• Verifikasi pembayaran qurban</p>
                  <p>• Jadwal ambulance minggu ini</p>
                  <p>• Review proposal kegiatan baru</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Aksi Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <QuickButton icon={<Plus />} label="Tambah Kegiatan" primary />
                  <QuickButton icon={<HandHeart />} label="Kelola Qurban" />
                  <QuickButton icon={<Truck />} label="Kelola Ambulance" />
                  <QuickButton icon={<Download />} label="Export Laporan" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

/* =======================
   COMPONENTS - Dipercantik
======================= */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={color}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
          <Clock className="h-3 w-3" />
          Update terbaru
        </p>
      </CardContent>
    </Card>
  )
}

function QuickButton({
  icon,
  label,
  primary,
}: {
  icon: React.ReactNode
  label: string
  primary?: boolean
}) {
  return (
    <Button
      variant={primary ? "default" : "outline"}
      className={`w-full justify-start h-11 ${
        primary
          ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          : "hover:bg-gray-50"
      }`}
    >
      <span className="mr-3 h-5 w-5">{icon}</span>
      {label}
    </Button>
  )
}