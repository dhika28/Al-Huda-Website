"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Filter,
  Eye,
  CheckCircle,
  Wallet,
  Activity,
  FileSpreadsheet,
  Loader2,
  HeartHandshake, 
  Users,
  Target, 
  Award,  
  Send,
  Repeat,
  Star,
  CalendarCheck
} from "lucide-react"
import { 
  format, startOfMonth, endOfMonth, startOfYear, startOfWeek, endOfWeek, endOfYear 
} from "date-fns"
import { id as localeId } from "date-fns/locale"

// Recharts for Visualization
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

// PDF & Excel Libraries
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster, toast } from "react-hot-toast"

// API Imports
import { getFinancialSummary, getCashFlow } from "@/lib/api/report";
import { getDistributionLogs } from "@/lib/api/zakat";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function LaporanKeuanganPage() {
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Filter State
  const [timeFilter, setTimeFilter] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sector Stats State
  const [sectorStats, setSectorStats] = useState({
    donasi: { in: 0, out: 0 },
    zakat: { in: 0, out: 0 },
    qurban: { in: 0, out: 0 },
  });

  // Participation Stats State
  const [participationStats, setParticipationStats] = useState({
    activeDonors: 0,
    beneficiaries: 0,
    programsRealized: 0,
    averageDonation: 0,
    zakatDistributed: 0,
    fundEfficiency: 0,
    highestDonation: 0,
    donationFrequency: 0, 
    favoriteCategory: "-", 
    busiestDay: "-"       
  });

  // --- HANDLERS ---

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
         const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
         start = format(startOfMonth(lastMonth), "yyyy-MM-dd");
         end = format(endOfMonth(lastMonth), "yyyy-MM-dd");
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => { 
    try { 
        return format(new Date(dateString), "dd MMM yyyy", { locale: localeId }); 
    } catch { 
        return dateString; 
    } 
  };

  // --- DOWNLOAD PDF FUNCTION ---
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Judul Laporan
    doc.setFontSize(18);
    doc.text("Laporan Keuangan Masjid Al-Huda", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 30);
    doc.text(`Dicetak pada: ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: localeId })}`, 14, 36);

    // Ringkasan
    doc.setFontSize(12);
    doc.text("Ringkasan Keuangan:", 14, 45);
    
    const summaryData = [
      ["Total Pemasukan", formatCurrency(summary?.total_income)],
      ["Total Pengeluaran", formatCurrency(summary?.total_expense)],
      ["Saldo Bersih", formatCurrency(summary?.net_balance)],
      ["Total Donasi Umum", formatCurrency(sectorStats.donasi.in)],
      ["Total Zakat", formatCurrency(sectorStats.zakat.in)],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Keterangan', 'Jumlah']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }, // Emerald Green
      columnStyles: { 1: { halign: 'right' } }
    });

    // Tabel Transaksi
    // @ts-ignore (untuk akses lastAutoTable.finalY)
    const finalY = doc.lastAutoTable.finalY || 50;
    
    doc.text("Rincian Transaksi:", 14, finalY + 15);

    const tableRows = transactions.map(t => [
      formatDate(t.date),
      t.category,
      t.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      t.description,
      formatCurrency(t.amount)
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Tanggal', 'Kategori', 'Tipe', 'Keterangan', 'Nominal']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Blue
      columnStyles: { 4: { halign: 'right' } }
    });

    doc.save(`Laporan_Keuangan_Masjid_${startDate}_${endDate}.pdf`);
    toast.success("Laporan PDF berhasil diunduh!");
  };

  // --- DOWNLOAD EXCEL FUNCTION ---
  const downloadExcel = () => {
    // Persiapkan Data
    const data = transactions.map(t => ({
      "Tanggal": formatDate(t.date),
      "ID Transaksi": t.id,
      "Kategori": t.category,
      "Tipe": t.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      "Jenis Dana": t.fund_type,
      "Keterangan": t.description,
      "Nominal (IDR)": t.amount,
      "Sumber/Penerima": t.source || "-" 
    }));

    // Buat Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");

    // Atur lebar kolom (opsional)
    const wscols = [
        {wch: 15}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 30}, {wch: 15}, {wch: 20}
    ];
    worksheet['!cols'] = wscols;

    // Simpan File
    XLSX.writeFile(workbook, `Laporan_Keuangan_Masjid_${startDate}_${endDate}.xlsx`);
    toast.success("Laporan Excel berhasil diunduh!");
  };

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      
      const [resSummary, resFlow, resZakatDist] = await Promise.all([
        getFinancialSummary(params),
        getCashFlow(params),
        getDistributionLogs()
      ]);

      setSummary(resSummary);

      const zakatExpenses = (Array.isArray(resZakatDist) ? resZakatDist : []).map((item: any) => ({
          id: `ZKT-${item.id}`,
          date: item.distribution_date || item.created_at,
          category: "Penyaluran Zakat",
          description: `${item.category_name || 'Zakat'} - ${item.notes || ''}`,
          amount: Number(item.amount),
          type: "keluar",
          source: "zakat",
          recipient_count: 1
      })).filter((item: any) => {
          if (!startDate || !endDate) return true;
          const itemDate = new Date(item.date).getTime();
          return itemDate >= new Date(startDate).getTime() && itemDate <= new Date(endDate).getTime();
      });

      const rawTransactions = [...(resFlow || []), ...zakatExpenses];
      const sortedAsc = [...rawTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let dIn = 0, dOut = 0, zIn = 0, zOut = 0, qIn = 0, qOut = 0;
      let uniqueDonors = new Set();
      let uniqueBeneficiaries = 0; 
      let programsCount = 0; 
      let totalIncomingCount = 0;
      let maxDonation = 0; 

      const categoryCount: Record<string, number> = {};
      const dayCount: Record<string, number> = {};
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      const enrichedTransactions = sortedAsc.map((t: any) => {
        const amountVal = Number(t.amount) || 0;
        const catLower = (t.category || "").toLowerCase();
        const srcLower = (t.source || "").toLowerCase();

        const isZakat = catLower.includes('zakat') || srcLower.includes('zakat');
        const isQurban = catLower.includes('qurban') || srcLower.includes('qurban');

        if (isZakat) {
            t.type === 'masuk' ? zIn += amountVal : zOut += amountVal;
        } else if (isQurban) {
            t.type === 'masuk' ? qIn += amountVal : qOut += amountVal;
        } else {
            t.type === 'masuk' ? dIn += amountVal : dOut += amountVal;
        }

        if (t.type === 'masuk') {
            if(t.source) uniqueDonors.add(t.source); 
            else uniqueDonors.add(`donor-${t.id}`);
            totalIncomingCount++;

            if (!isZakat && !isQurban) {
                if (amountVal > maxDonation) maxDonation = amountVal; 
            }

            const cat = t.category || "Lainnya";
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;

            try {
              const dayIndex = new Date(t.date).getDay();
              const dayName = days[dayIndex];
              dayCount[dayName] = (dayCount[dayName] || 0) + 1;
            } catch (e) {}

        } else {
            uniqueBeneficiaries += (t.recipient_count || 1); 
            programsCount++;
        }

        return { ...t, fund_type: isZakat ? "Zakat" : (isQurban ? "Qurban" : "Umum") };
      });

      setTransactions(enrichedTransactions.reverse());
      setSectorStats({
        donasi: { in: dIn, out: dOut },
        zakat: { in: zIn, out: zOut },
        qurban: { in: qIn, out: qOut },
      });

      const totalIncome = dIn + zIn + qIn;
      const totalExpense = dOut + zOut + qOut;
      const avgDonation = totalIncomingCount > 0 ? totalIncome / totalIncomingCount : 0;
      const efficiency = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

      const favCategory = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b, "-");
      const busyDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, "-");

      setParticipationStats({
        activeDonors: uniqueDonors.size > 0 ? uniqueDonors.size : 0, 
        beneficiaries: uniqueBeneficiaries,
        programsRealized: programsCount,
        averageDonation: avgDonation,
        zakatDistributed: zOut, 
        fundEfficiency: efficiency, 
        highestDonation: maxDonation,
        donationFrequency: totalIncomingCount, 
        favoriteCategory: favCategory,
        busiestDay: busyDay
      });

    } catch (error) {
      console.error("Failed to fetch financial data:", error);
      toast.error("Gagal memuat data keuangan terbaru.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!startDate) {
        const now = new Date();
        setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
    } else {
        fetchData();
    }
  }, [startDate, endDate]);

  // --- CHART DATA ---
  const trendData = useMemo(() => {
    const grouped: any = {};
    const sortedForChart = [...transactions].reverse(); 
    
    sortedForChart.forEach((t) => {
      const key = t.date?.slice(0, 10);
      if (!grouped[key]) grouped[key] = { date: key, masuk: 0, keluar: 0 };
      grouped[key][t.type === "masuk" ? "masuk" : "keluar"] += Number(t.amount) || 0;
    });
    return Object.values(grouped);
  }, [transactions]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 pb-12 font-sans">
      <Toaster position="top-center" />
      
      {/* Header */}
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
                <p className="text-sm text-gray-600">Transparansi pengelolaan dana umat</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Pemasukan</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : formatCurrency(summary?.total_income)}
                  </p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Total Pengeluaran</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : formatCurrency(summary?.total_expense)}
                  </p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Saldo Bersih</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : formatCurrency(summary?.net_balance)}
                  </p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                    <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD TOTAL DONASI */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Donasi</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : formatCurrency(sectorStats.donasi.in)}
                  </p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                    <HeartHandshake className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">Ringkasan Grafik</TabsTrigger>
                <TabsTrigger value="transactions">Data Transaksi</TabsTrigger>
                <TabsTrigger value="reports">Download Laporan</TabsTrigger>
              </TabsList>

              {/* TAB 1: GRAFIK */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span>Grafik Arus Kas ({timeFilter === 'thisYear' ? 'Tahun Ini' : 'Bulan Ini'})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(d) => d.slice(8,10)} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis tickFormatter={(v) => `${v/1000}k`} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(v:any) => formatCurrency(v)} />
                                <Area type="monotone" dataKey="masuk" stroke="#10b981" fill="url(#colorMasuk)" name="Pemasukan" />
                                <Area type="monotone" dataKey="keluar" stroke="#ef4444" fill="url(#colorKeluar)" name="Pengeluaran" />
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
                                <span>Sumber Dana Masuk</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
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
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-sm">
                                <Activity className="h-4 w-4 text-purple-600" />
                                <span>Ringkasan Sektor</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm font-medium text-blue-800">Donasi Umum</span>
                                <span className="font-bold text-blue-600">{formatCurrency(sectorStats.donasi.in)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                <span className="text-sm font-medium text-yellow-800">Zakat</span>
                                <span className="font-bold text-yellow-600">{formatCurrency(sectorStats.zakat.in)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                                <span className="text-sm font-medium text-purple-800">Qurban</span>
                                <span className="font-bold text-purple-600">{formatCurrency(sectorStats.qurban.in)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
              </TabsContent>

              {/* TAB 2: TRANSAKSI */}
              <TabsContent value="transactions">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Riwayat Transaksi</CardTitle>
                    <CardDescription>Detail mutasi dana masjid terkini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {isLoading ? (
                          <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600"/></div>
                      ) : transactions.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">Tidak ada transaksi pada periode ini.</div>
                      ) : (
                          transactions.slice(0, 8).map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center space-x-4">
                                <div className={`p-2.5 rounded-full ${t.type === 'masuk' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {t.type === 'masuk' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm">{t.category}</p>
                                  <p className="text-xs text-gray-500">{formatDate(t.date)} • {t.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold text-sm ${t.type === 'masuk' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {t.type === 'masuk' ? '+' : '-'}{formatCurrency(t.amount)}
                                </p>
                                <Badge variant="outline" className="text-[10px] h-5 mt-1 border-gray-200 text-gray-500">
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
                <Card className="border-0 shadow-lg cursor-pointer hover:bg-slate-50 transition-colors" onClick={downloadPDF}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg"><FileText className="h-6 w-6 text-red-600"/></div>
                            <div>
                                <h4 className="font-bold text-gray-800">Laporan PDF</h4>
                                <p className="text-sm text-gray-500">Format resmi siap cetak untuk laporan bulanan.</p>
                            </div>
                        </div>
                        <Download className="h-5 w-5 text-gray-400" />
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg cursor-pointer hover:bg-slate-50 transition-colors" onClick={downloadExcel}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg"><FileSpreadsheet className="h-6 w-6 text-green-600"/></div>
                            <div>
                                <h4 className="font-bold text-gray-800">Laporan Excel</h4>
                                <p className="text-sm text-gray-500">Data mentah untuk audit atau analisa lebih lanjut.</p>
                            </div>
                        </div>
                        <Download className="h-5 w-5 text-gray-400" />
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            
            {/* Quick Filter Card */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">Periode Laporan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Button 
                            variant={timeFilter === 'thisMonth' ? 'default' : 'outline'} 
                            className={`w-full justify-start ${timeFilter === 'thisMonth' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => handleTimeFilterChange('thisMonth')}
                        >
                            <Calendar className="mr-2 h-4 w-4" /> Bulan Ini
                        </Button>
                        <Button 
                            variant={timeFilter === 'lastMonth' ? 'default' : 'outline'} 
                            className={`w-full justify-start ${timeFilter === 'lastMonth' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => handleTimeFilterChange('lastMonth')}
                        >
                            <Calendar className="mr-2 h-4 w-4" /> Bulan Lalu
                        </Button>
                        <Button 
                            variant={timeFilter === 'thisYear' ? 'default' : 'outline'} 
                            className={`w-full justify-start ${timeFilter === 'thisYear' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            onClick={() => handleTimeFilterChange('thisYear')}
                        >
                            <Calendar className="mr-2 h-4 w-4" /> Tahun Ini
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Transparency Badge */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-8 w-8 text-blue-200 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">Transparansi 100%</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      Setiap rupiah yang masuk dan keluar tercatat dalam sistem dan dapat diakses oleh publik kapan saja.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* STATISTIK PARTISIPASI (LENGKAP) */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-gray-700 uppercase">Statistik Partisipasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="py-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600"/></div>
                ) : (
                    <>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">Donatur Aktif</span>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">{participationStats.activeDonors} Orang</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">Penerima Manfaat</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">{participationStats.beneficiaries} Keluarga</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">Program Terealisasi</span>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">{participationStats.programsRealized} Kegiatan</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">Rata-rata Donasi</span>
                            <span className="text-sm font-bold text-slate-700">{formatCurrency(participationStats.averageDonation)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">Efisiensi Dana</span>
                            <Badge variant="secondary" className="bg-red-50 text-red-800">{participationStats.fundEfficiency.toFixed(1)}%</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">Hari Teramai</span>
                            <span className="text-sm font-bold text-slate-700">{participationStats.busiestDay}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 flex items-center gap-2">Donasi Tertinggi</span>
                            <span className="text-sm font-bold text-slate-700">{formatCurrency(participationStats.highestDonation)}</span>
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