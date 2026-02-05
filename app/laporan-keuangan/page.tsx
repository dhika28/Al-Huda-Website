"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft, FileText, Download, TrendingUp, TrendingDown,
  PieChart as PieChartIcon, BarChart3, Calendar, Wallet,
  Activity, FileSpreadsheet, Loader2, HeartHandshake, CheckCircle,
  Award
} from "lucide-react"
import { 
  format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, parseISO, isValid 
} from "date-fns"
import { id as localeId } from "date-fns/locale"

// Recharts
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// PDF & Excel
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster, toast } from "react-hot-toast"

// API Imports
import { getFinancialSummary, getCashFlow } from "@/lib/api/report";
import { getDistributionLogs } from "@/lib/api/zakat";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function LaporanKeuanganPage() {
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]); // Data tabel (Newest -> Oldest)
  const [chartData, setChartData] = useState<any[]>([]); // Data grafik (Oldest -> Newest)
  
  // Filter State
  const [timeFilter, setTimeFilter] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Stats State
  const [sectorStats, setSectorStats] = useState({
    donasi: { in: 0, out: 0 },
    zakat: { in: 0, out: 0 },
    qurban: { in: 0, out: 0 },
  });

  const [participationStats, setParticipationStats] = useState({
    activeDonors: 0,
    beneficiaries: 0,
    programsRealized: 0,
    averageDonation: 0,
    fundEfficiency: 0,
    highestDonation: 0,
    busiestDay: "-"       
  });

  // --- HANDLER FILTER TANGGAL ---
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    const now = new Date();
    let start, end;

    switch (value) {
      case "thisMonth":
        start = format(startOfMonth(now), "yyyy-MM-dd");
        end = format(endOfMonth(now), "yyyy-MM-dd");
        break;
      case "lastMonth":
         const prevMonthDate = subMonths(now, 1);
         start = format(startOfMonth(prevMonthDate), "yyyy-MM-dd");
         end = format(endOfMonth(prevMonthDate), "yyyy-MM-dd");
         break;
      case "thisYear":
        start = format(startOfYear(now), "yyyy-MM-dd");
        end = format(endOfYear(now), "yyyy-MM-dd");
        break;
      default:
        start = format(startOfMonth(now), "yyyy-MM-dd");
        end = format(endOfMonth(now), "yyyy-MM-dd");
    }
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    const now = new Date();
    setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
  }, []);

  // --- FORMATTER ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => { 
    try { 
        return format(parseISO(dateString), "dd MMM yyyy", { locale: localeId }); 
    } catch { 
        return dateString; 
    } 
  };

  // --- DATA FETCHING & PROCESSING ---
  const fetchData = async () => {
    if (!startDate || !endDate) return;
    setIsLoading(true);

    try {
      const params = { start_date: startDate, end_date: endDate };
      
      const [resSummary, resFlow, resZakatDist] = await Promise.all([
        getFinancialSummary(params),
        getCashFlow(params),
        getDistributionLogs()
      ]);

      // Normalisasi Data Zakat Keluar
      const zakatExpenses = (Array.isArray(resZakatDist) ? resZakatDist : []).map((item: any) => ({
          id: `ZKT-${item.id}`,
          date: item.distribution_date ? item.distribution_date.split('T')[0] : item.created_at.split('T')[0],
          category: "Penyaluran Zakat",
          description: `${item.category_name || 'Zakat'} - ${item.notes || 'Penyaluran'}`,
          amount: Number(item.amount),
          type: "keluar",
          source: "zakat",
          recipient_count: 1
      })).filter((item: any) => {
          return item.date >= startDate && item.date <= endDate;
      });

      const combinedTransactions = [...(resFlow || []), ...zakatExpenses];

      // 🔥 1. SORTING TRANSAKSI (DESCENDING: TERBARU DI ATAS)
      // Ini untuk Tabel
      const sortedDesc = [...combinedTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // 🔥 2. SORTING GRAFIK (ASCENDING: TERLAMA DI KIRI)
      // Ini untuk Grafik agar alurnya benar dari tgl 1 -> 30
      const sortedAsc = [...combinedTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // CALCULATE STATS
      let dIn = 0, dOut = 0, zIn = 0, zOut = 0, qIn = 0, qOut = 0;
      let uniqueDonors = new Set();
      let uniqueBeneficiaries = 0; 
      let programsCount = 0; 
      let totalIncomingCount = 0;
      let maxDonation = 0; 
      const dayCount: Record<string, number> = {};
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      // Loop menggunakan sortedDesc untuk tabel
      const enrichedTransactions = sortedDesc.map((t: any) => {
        const amountVal = Number(t.amount) || 0;
        const catLower = (t.category || "").toLowerCase();
        const srcLower = (t.source || "").toLowerCase();

        const isZakat = catLower.includes('zakat') || srcLower.includes('zakat');
        const isQurban = catLower.includes('qurban') || srcLower.includes('qurban');

        if (isZakat) { t.type === 'masuk' ? zIn += amountVal : zOut += amountVal; } 
        else if (isQurban) { t.type === 'masuk' ? qIn += amountVal : qOut += amountVal; } 
        else { t.type === 'masuk' ? dIn += amountVal : dOut += amountVal; }

        if (t.type === 'masuk') {
            if(t.source) uniqueDonors.add(t.source); 
            else uniqueDonors.add(`donor-${t.id}`);
            totalIncomingCount++;

            if (!isZakat && !isQurban && amountVal > maxDonation) maxDonation = amountVal; 

            try {
              const dayIndex = new Date(t.date).getDay();
              dayCount[days[dayIndex]] = (dayCount[days[dayIndex]] || 0) + 1;
            } catch (e) {}
        } else {
            uniqueBeneficiaries += (t.recipient_count || 1); 
            programsCount++;
        }

        return { ...t, fund_type: isZakat ? "Zakat" : (isQurban ? "Qurban" : "Umum") };
      });

      setTransactions(enrichedTransactions); // Set data tabel (Desc)

      setSectorStats({
        donasi: { in: dIn, out: dOut },
        zakat: { in: zIn, out: zOut },
        qurban: { in: qIn, out: qOut },
      });

      const realTotalIncome = dIn + zIn + qIn;
      const realTotalExpense = dOut + zOut + qOut;
      
      setSummary({
          total_income: realTotalIncome,
          total_expense: realTotalExpense,
          net_balance: realTotalIncome - realTotalExpense
      });

      const avgDonation = totalIncomingCount > 0 ? realTotalIncome / totalIncomingCount : 0;
      const efficiency = realTotalIncome > 0 ? (realTotalExpense / realTotalIncome) * 100 : 0;
      const busyDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, "-");

      setParticipationStats({
        activeDonors: uniqueDonors.size, 
        beneficiaries: uniqueBeneficiaries,
        programsRealized: programsCount,
        averageDonation: avgDonation,
        fundEfficiency: efficiency, 
        highestDonation: maxDonation,
        busiestDay: busyDay
      });

      // 🔥 3. SIAPKAN DATA GRAFIK (AGGREGATION PER TANGGAL)
      const chartGrouped: any = {};
      sortedAsc.forEach((t) => {
          const dateKey = t.date.includes('T') ? t.date.split('T')[0] : t.date;
          if (!chartGrouped[dateKey]) {
              chartGrouped[dateKey] = { date: dateKey, masuk: 0, keluar: 0 };
          }
          if (t.type === 'masuk') {
              chartGrouped[dateKey].masuk += Number(t.amount);
          } else {
              chartGrouped[dateKey].keluar += Number(t.amount);
          }
      });
      setChartData(Object.values(chartGrouped));

    } catch (error) {
      console.error("Failed to fetch financial data:", error);
      toast.error("Gagal memuat data keuangan terbaru.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const sourceData = useMemo(() => {
    const grouped: any = {};
    transactions.forEach((t) => {
      if (t.type === "masuk") {
        const cat = t.category || "Lainnya";
        grouped[cat] = (grouped[cat] || 0) + Number(t.amount || 0);
      }
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // --- DOWNLOAD FUNCTIONS ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Laporan Keuangan Masjid Al-Huda", 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 30);
    
    const summaryData = [
      ["Total Pemasukan", formatCurrency(summary?.total_income)],
      ["Total Pengeluaran", formatCurrency(summary?.total_expense)],
      ["Saldo (Periode Ini)", formatCurrency(summary?.net_balance)],
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Keterangan', 'Jumlah']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.text("Rincian Transaksi:", 14, finalY + 15);

    const tableRows = transactions.map(t => [
      formatDate(t.date),
      t.category,
      t.type === 'masuk' ? 'Masuk' : 'Keluar',
      t.description,
      formatCurrency(t.amount)
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Tanggal', 'Kategori', 'Tipe', 'Ket', 'Nominal']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: { 4: { halign: 'right' } }
    });

    doc.save(`Laporan_${startDate}_${endDate}.pdf`);
    toast.success("PDF Berhasil diunduh");
  };

  const downloadExcel = () => {
    const data = transactions.map(t => ({
      "Tanggal": formatDate(t.date),
      "Kategori": t.category,
      "Tipe": t.type.toUpperCase(),
      "Dana": t.fund_type,
      "Keterangan": t.description,
      "Nominal": t.amount
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_${startDate}_${endDate}.xlsx`);
    toast.success("Excel Berhasil diunduh");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 pb-12 font-sans">
      <Toaster position="top-center" />
      
      <header className="bg-white/95 backdrop-blur border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
                <p className="text-sm text-gray-600">
                    Periode: <span className="font-semibold text-emerald-600">{formatDate(startDate)}</span> s/d <span className="font-semibold text-emerald-600">{formatDate(endDate)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Pemasukan</p>
                  <p className="text-2xl font-bold mt-1">{isLoading ? "..." : formatCurrency(summary?.total_income)}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg"><TrendingUp className="h-6 w-6 text-white" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Pengeluaran</p>
                  <p className="text-2xl font-bold mt-1">{isLoading ? "..." : formatCurrency(summary?.total_expense)}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg"><TrendingDown className="h-6 w-6 text-white" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Saldo (Periode Ini)</p>
                  <p className="text-2xl font-bold mt-1">{isLoading ? "..." : formatCurrency(summary?.net_balance)}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg"><Wallet className="h-6 w-6 text-white" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Donasi Umum</p>
                  <p className="text-2xl font-bold mt-1">{isLoading ? "..." : formatCurrency(sectorStats.donasi.in)}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg"><HeartHandshake className="h-6 w-6 text-white" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-white p-1 rounded-xl shadow-sm border">
                <TabsTrigger value="overview">Grafik & Analisa</TabsTrigger>
                <TabsTrigger value="transactions">Rincian Transaksi</TabsTrigger>
                <TabsTrigger value="reports">Ekspor Data</TabsTrigger>
              </TabsList>

              {/* TAB 1: GRAFIK (VISUAL DIPERBAIKI) */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span>Trend Arus Kas Harian</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-gray-400">Memuat Grafik...</div>
                    ) : chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400">Belum ada data untuk ditampilkan</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(d) => {
                                      try { return format(parseISO(d), 'dd MMM') } catch { return d }
                                    }} 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    minTickGap={30}
                                />
                                <YAxis tickFormatter={(v) => `${v/1000}k`} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    formatter={(v:any) => formatCurrency(v)} 
                                    labelFormatter={(l) => {
                                      try { return format(parseISO(l), 'dd MMMM yyyy') } catch { return l }
                                    }}
                                />
                                <Area type="monotone" dataKey="masuk" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMasuk)" name="Pemasukan" />
                                <Area type="monotone" dataKey="keluar" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorKeluar)" name="Pengeluaran" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-sm">
                                <PieChartIcon className="h-4 w-4 text-emerald-600" />
                                <span>Komposisi Pemasukan</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            {sourceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={sourceData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                            {sourceData.map((entry:any, index:number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v:any) => formatCurrency(v)} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Tidak ada data pemasukan</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-sm">
                                <Activity className="h-4 w-4 text-purple-600" />
                                <span>Detail Dana</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-sm font-medium text-blue-800">Donasi Umum</span>
                                <span className="font-bold text-blue-600">{formatCurrency(sectorStats.donasi.in)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                <span className="text-sm font-medium text-yellow-800">Zakat (Masuk)</span>
                                <span className="font-bold text-yellow-600">{formatCurrency(sectorStats.zakat.in)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="text-sm font-medium text-red-800">Zakat (Disalurkan)</span>
                                <span className="font-bold text-red-600">{formatCurrency(sectorStats.zakat.out)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
              </TabsContent>

              {/* TAB 2: TRANSAKSI (DESCENDING) */}
              <TabsContent value="transactions">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Riwayat Transaksi</CardTitle>
                        <Badge variant="outline">{transactions.length} Transaksi</Badge>
                    </div>
                    <CardDescription>Semua transaksi masuk dan keluar pada periode ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0 max-h-[600px] overflow-y-auto pr-2">
                      {isLoading ? (
                          <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600"/></div>
                      ) : transactions.length === 0 ? (
                          <div className="p-12 text-center text-gray-500 bg-slate-50 rounded-lg border border-dashed">
                              Tidak ada transaksi ditemukan pada rentang tanggal ini.
                          </div>
                      ) : (
                          transactions.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center space-x-4">
                                <div className={`p-2.5 rounded-full shrink-0 ${t.type === 'masuk' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {t.type === 'masuk' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm line-clamp-1">{t.category}</p>
                                  <p className="text-xs text-gray-500">{formatDate(t.date)} • {t.description}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-4">
                                <p className={`font-bold text-sm ${t.type === 'masuk' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {t.type === 'masuk' ? '+' : '-'}{formatCurrency(t.amount)}
                                </p>
                                <Badge variant="secondary" className="text-[10px] h-5 mt-1 bg-gray-100 text-gray-600">
                                    {t.fund_type}
                                </Badge>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 3: DOWNLOAD */}
              <TabsContent value="reports" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-0 shadow-lg cursor-pointer hover:bg-slate-50 transition-colors group" onClick={downloadPDF}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                                    <FileText className="h-6 w-6 text-red-600"/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Unduh PDF</h4>
                                    <p className="text-xs text-gray-500">Laporan resmi siap cetak.</p>
                                </div>
                            </div>
                            <Download className="h-5 w-5 text-gray-400 group-hover:text-emerald-600" />
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg cursor-pointer hover:bg-slate-50 transition-colors group" onClick={downloadExcel}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <FileSpreadsheet className="h-6 w-6 text-green-600"/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Unduh Excel</h4>
                                    <p className="text-xs text-gray-500">Data mentah untuk audit.</p>
                                </div>
                            </div>
                            <Download className="h-5 w-5 text-gray-400 group-hover:text-emerald-600" />
                        </CardContent>
                    </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <Calendar className="h-4 w-4"/> Filter Periode
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-2">
                        <Button 
                            variant={timeFilter === 'thisMonth' ? 'default' : 'outline'} 
                            className={`w-full justify-start ${timeFilter === 'thisMonth' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => handleTimeFilterChange('thisMonth')}
                        >
                            Bulan Ini ({format(new Date(), 'MMMM')})
                        </Button>
                        <Button 
                            variant={timeFilter === 'lastMonth' ? 'default' : 'outline'} 
                            className={`w-full justify-start ${timeFilter === 'lastMonth' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => handleTimeFilterChange('lastMonth')}
                        >
                            Bulan Lalu ({format(subMonths(new Date(), 1), 'MMMM')})
                        </Button>
                        <Button 
                            variant={timeFilter === 'thisYear' ? 'default' : 'outline'} 
                            className={`w-full justify-start ${timeFilter === 'thisYear' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => handleTimeFilterChange('thisYear')}
                        >
                            Tahun Ini ({format(new Date(), 'yyyy')})
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-8 w-8 text-blue-200 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">Transparansi 100%</h3>
                    <p className="text-blue-100 text-xs leading-relaxed">
                      Laporan ini dibuat secara otomatis oleh sistem berdasarkan transaksi realtime.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2">
                    <Award className="h-4 w-4"/> Insight Data
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {isLoading ? (
                    <div className="py-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600"/></div>
                ) : (
                    <>
                        <div className="flex justify-between items-center border-b border-dashed pb-2">
                            <span className="text-xs text-gray-600">Donatur Aktif</span>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">{participationStats.activeDonors}</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b border-dashed pb-2">
                            <span className="text-xs text-gray-600">Penerima Manfaat</span>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">{participationStats.beneficiaries}</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b border-dashed pb-2">
                            <span className="text-xs text-gray-600">Rata-rata Donasi</span>
                            <span className="text-xs font-bold text-slate-700">{formatCurrency(participationStats.averageDonation)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-dashed pb-2">
                            <span className="text-xs text-gray-600">Efisiensi Dana</span>
                            <span className={`text-xs font-bold ${participationStats.fundEfficiency > 100 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {participationStats.fundEfficiency.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Hari Teramai</span>
                            <span className="text-xs font-bold text-slate-700">{participationStats.busiestDay}</span>
                        </div>
                    </>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}