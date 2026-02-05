"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  DollarSign,
  Calendar,
  Truck,
  Download,
  Heart,
  AlertTriangle,
  HandHeart,
  Clock,
  BarChart3,
  Loader2,
  Wallet,
  ArrowUpRight,
  Activity as ActivityIcon,
  Megaphone
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast, Toaster } from "react-hot-toast"

// --- IMPORTS API ---
// Pastikan path import ini sesuai dengan struktur project Anda
import { UserService } from "@/lib/api/user"
import { getFinancialSummary } from "@/lib/api/report" 
import { ActivityService } from "@/lib/api/activity"
import { getAllQurbanRegistrations } from "@/lib/api/qurban"
import { AmbulanceService } from "@/lib/api/ambulance"
import { getRecentDonations } from "@/lib/api/donation"
import { getAllZakat } from "@/lib/api/zakat"

// --- HELPER CURRENCY ---
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number)
}

const COLORS = ["#10b981", "#8b5cf6", "#f43f5e", "#f59e0b"]

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  
  // --- STATE DASHBOARD ---
  const [stats, setStats] = useState({
    totalUsers: 0,
    netBalance: 0,
    totalDonation: 0,
    totalZakat: 0,
    totalQurbanParticipants: 0,
    activeActivities: 0,
    pendingAmbulance: 0,
    chartData: [] as any[],
    recentActivities: [] as any[], 
    alerts: [] as string[]
  })

  // --- FETCH ALL DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🚀 Starting Dashboard Fetch...")

        const [
          usersRes,
          financeRes,
          activityRes,
          qurbanRes,
          ambulanceRes,
          recentDonations,
          zakatList
        ] = await Promise.all([
          UserService.getAll().catch(err => ({ data: [] })),
          getFinancialSummary().catch(err => ({})),
          ActivityService.getAll().catch(err => ({ data: [] })),
          getAllQurbanRegistrations().catch(err => []),
          AmbulanceService.getAll().catch(err => ({ data: { data: [] } })),
          getRecentDonations().catch(err => []),
          getAllZakat().catch(err => [])
        ])

        // --- 1. DATA PROCESSING ---
        
        // Users
        const usersArray = Array.isArray(usersRes) ? usersRes : (usersRes.data || [])
        const totalUsers = usersArray.length

        // Finance
        const netBalance = (financeRes as any).net_balance || 0
        const totalDonation = (financeRes as any).total_income_donation || 0
        const totalZakat = (financeRes as any).total_income_zakat || 0
        const totalQurbanAmount = (financeRes as any).total_income_qurban || 0

        // Activity Count
        const activityArray = Array.isArray(activityRes) ? activityRes : (activityRes.data || [])
        const activeActivities = activityArray.filter((a: any) => a.status === 'terbuka').length

        // Ambulance
        let ambulanceArray: any[] = []
        if (Array.isArray(ambulanceRes)) ambulanceArray = ambulanceRes
        else if (Array.isArray((ambulanceRes as any).data)) ambulanceArray = (ambulanceRes as any).data
        else if ((ambulanceRes as any).data && Array.isArray((ambulanceRes as any).data.data)) ambulanceArray = (ambulanceRes as any).data.data
        
        const pendingAmbulance = ambulanceArray.filter((a: any) => a.status === 'urgent' || a.status === 'pending').length

        // Qurban
        const qurbanArray = Array.isArray(qurbanRes) ? qurbanRes : ((qurbanRes as any).data || [])

        // Donations
        const donationArray = Array.isArray(recentDonations) ? recentDonations : []

        // Zakat
        const zakatArray = Array.isArray(zakatList) ? zakatList : []

        // --- 2. Chart Data ---
        const chartData = [
          { name: "Donasi", amount: totalDonation },
          { name: "Zakat", amount: totalZakat },
          { name: "Qurban", amount: totalQurbanAmount },
        ]

        // --- 3. MERGE RECENT ACTIVITIES (PERBAIKAN UTAMA DISINI) ---
        
        const allActivities = [
            // Map Donasi
            ...donationArray.map((d: any) => ({
                id: `don-${d.id}`,
                type: 'Donasi',
                title: `Donasi: ${d.donor_name || "Hamba Allah"}`, 
                desc: d.program_title ? `Program: ${d.program_title}` : "Donasi Umum Masjid",
                amount: d.amount,
                date: d.created_at,
                icon: <DollarSign className="h-4 w-4" />,
                color: "text-emerald-600",
                bg: "bg-emerald-100"
            })),

            // Map Zakat
            ...zakatArray.map((z: any) => ({
                id: `zak-${z.id}`,
                type: 'Zakat',
                title: `Zakat: ${z.muzakki_name || "Hamba Allah"}`,
                desc: `Tipe: ${z.zakat_type || "Zakat Maal"}`,
                amount: z.amount,
                date: z.created_at,
                icon: <Heart className="h-4 w-4" />,
                color: "text-purple-600",
                bg: "bg-purple-100"
            })),

            // Map Qurban (FIX UNDEFINED)
            ...qurbanArray.map((q: any) => {
                const detailHewan = q.animal_type || q.package_name || "Paket Qurban";
                return {
                    id: `qur-${q.id}`,
                    type: 'Qurban',
                    title: `Qurban: ${q.participant_name || "Hamba Allah"}`,
                    desc: `Pendaftaran ${detailHewan}`,
                    amount: null, 
                    date: q.registration_date || q.created_at,
                    icon: <HandHeart className="h-4 w-4" />,
                    color: "text-pink-600",
                    bg: "bg-pink-100"
                }
            }),

            // Map Ambulance
            ...ambulanceArray.map((a: any) => ({
                id: `amb-${a.id}`,
                type: 'Ambulance',
                title: `Ambulance: ${a.patient_name}`,
                desc: `Jemput: ${a.pickup_address ? a.pickup_address.substring(0, 25) + "..." : "Lokasi tidak tersedia"}`,
                amount: null,
                date: a.created_at,
                icon: <Truck className="h-4 w-4" />,
                color: "text-blue-600",
                bg: "bg-blue-100"
            })),

            // Map Activity Creation
            ...activityArray.map((ac: any) => ({
                id: `act-${ac.id}`,
                type: 'Kegiatan',
                title: `Event Baru: ${ac.judul}`,
                desc: `Jadwal: ${ac.tanggal ? new Date(ac.tanggal).toLocaleDateString('id-ID') : 'Belum ditentukan'}`,
                amount: null,
                date: ac.created_at || new Date().toISOString(),
                icon: <Megaphone className="h-4 w-4" />,
                color: "text-orange-600",
                bg: "bg-orange-100"
            }))
        ]

        // Sort Descending & Ambil 7 teratas
        const sortedActivities = allActivities
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7)

        // --- 4. Alerts ---
        const alerts: string[] = []
        if (pendingAmbulance > 0) alerts.push(`${pendingAmbulance} Permintaan Ambulance Menunggu`)
        
        // --- 5. Set State ---
        setStats({
          totalUsers,
          netBalance,
          totalDonation,
          totalZakat,
          totalQurbanParticipants: qurbanArray.length,
          activeActivities,
          pendingAmbulance,
          chartData,
          recentActivities: sortedActivities,
          alerts
        })

      } catch (error) {
        console.error("CRITICAL DASHBOARD ERROR:", error)
        toast.error("Gagal memproses data dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">Memuat Ringkasan Data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col h-screen bg-gray-50/50 font-sans">

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-sm text-gray-500">Pantau seluruh aktivitas masjid dalam satu tampilan.</p>
            </div>
          </div>

          {/* STAT CARDS ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Saldo Kas" 
              value={formatRupiah(stats.netBalance)} 
              icon={<Wallet className="h-5 w-5" />} 
              color="text-emerald-600" 
              bg="bg-emerald-50"
              trend="Saldo Bersih Saat Ini"
            />
            <StatCard 
              title="Total Jamaah" 
              value={stats.totalUsers.toString()} 
              icon={<Users className="h-5 w-5" />} 
              color="text-blue-600" 
              bg="bg-blue-50"
              trend="User Terdaftar"
            />
            <StatCard 
              title="Kegiatan Aktif" 
              value={stats.activeActivities.toString()} 
              icon={<Calendar className="h-5 w-5" />} 
              color="text-orange-600" 
              bg="bg-orange-50"
              trend="Acara Bulan Ini"
            />
            <StatCard 
              title="Permintaan Ambulance" 
              value={stats.pendingAmbulance.toString()} 
              icon={<Truck className="h-5 w-5" />} 
              color="text-red-600" 
              bg="bg-red-50"
              trend={stats.pendingAmbulance > 0 ? "Butuh Respon Segera" : "Standby"}
            />
          </div>

          {/* CHART & BREAKDOWN SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CHART */}
            <Card className="lg:col-span-2 border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Komposisi Pemasukan
                </CardTitle>
                <p className="text-xs text-gray-500">Perbandingan Donasi, Zakat, dan Qurban</p>
              </CardHeader>
              <CardContent className="h-[320px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      formatter={(value: number) => formatRupiah(value)}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40}>
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* SIDE PANEL */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                 <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Donasi</p>
                        <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.totalDonation)}</p>
                    </div>
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><DollarSign className="h-5 w-5" /></div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Zakat</p>
                        <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.totalZakat)}</p>
                    </div>
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><Heart className="h-5 w-5" /></div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta Qurban</p>
                        <p className="text-lg font-bold text-gray-900">{stats.totalQurbanParticipants} <span className="text-sm font-normal text-gray-500">Orang</span></p>
                    </div>
                    <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600"><HandHeart className="h-5 w-5" /></div>
                 </div>
              </div>

              {/* ALERT CARD (UPDATED) */}
              <Card className="border-0 shadow-md bg-white border-l-4 border-l-orange-500">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" /> 
                    Tindakan Diperlukan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  {stats.alerts.length > 0 ? (
                    <div className="space-y-3">
                        {stats.alerts.map((alert, i) => (
                            <div key={i} className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                <span className="flex h-2 w-2 mt-1.5 rounded-full bg-orange-500 animate-pulse shrink-0"></span>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">{alert}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Segera proses permintaan ini.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-xs font-medium text-gray-600">Semua aman!</p>
                        <p className="text-[10px] text-gray-400">Tidak ada tugas mendesak.</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link href="/admin/ambulance" className="w-full">
                      <Button variant="outline" className="w-full text-xs h-8">
                        Cek Ambulance
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RECENT ACTIVITIES (ALL TYPES) */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ActivityIcon className="h-5 w-5 text-blue-600" />
                    Aktivitas Terbaru
                  </CardTitle>
                  <span className="text-xs text-gray-400">Real-time update dari seluruh modul</span>
               </div>
            </CardHeader>
            <CardContent>
                {stats.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                        {stats.recentActivities.map((item, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 hover:bg-gray-50/50 p-2 rounded-lg transition-colors cursor-default">
                                <div className="flex items-center gap-4">
                                    {/* Icon Type */}
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${item.bg} ${item.color}`}>
                                        {item.icon}
                                    </div>
                                    
                                    {/* Text Info */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
                                                {item.type}
                                            </Badge>
                                            <p className="text-xs text-gray-500 truncate max-w-[180px] md:max-w-xs">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side Info (Amount or Date) */}
                                <div className="text-right shrink-0 pl-2">
                                    {item.amount ? (
                                        <p className={`text-sm font-bold ${item.color}`}>+{formatRupiah(item.amount)}</p>
                                    ) : (
                                        <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Info Baru</p>
                                    )}
                                    <p className="text-[10px] text-gray-400 flex items-center justify-end gap-1 mt-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Clock className="h-10 w-10 text-gray-200 mb-2" />
                        <p className="text-sm text-gray-500">Belum ada aktivitas tercatat.</p>
                    </div>
                )}
            </CardContent>
          </Card>

        </main>
      </div>
    </>
  )
}

function StatCard({ title, value, icon, color, bg, trend, alert }: { title: string, value: string, icon: React.ReactNode, color: string, bg: string, trend: string, alert?: boolean }) {
  return (
    <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow ${alert ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bg} ${color}`}>{icon}</div>
            {alert && <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
            <p className={`text-xs mt-2 flex items-center gap-1 ${alert ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {alert ? <AlertTriangle className="h-3 w-3"/> : <Clock className="h-3 w-3"/>} {trend}
            </p>
        </div>
      </CardContent>
    </Card>
  )
}