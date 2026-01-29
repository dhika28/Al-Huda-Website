"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfYear, startOfWeek, endOfWeek, isToday, isThisWeek, isThisMonth, isThisYear } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Toaster, toast } from "react-hot-toast";
import { endOfYear } from "date-fns";

// Library Grafik (Recharts)
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

// Komponen UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  TrendingUp, TrendingDown, Wallet, Search, Filter, Printer, FileSpreadsheet,
  CalendarRange, ArrowUpRight, ArrowDownRight, Eye, ShieldCheck, AlertTriangle, Loader2,
  HeartHandshake, Coins, Gift, Download, Activity, FileText, PieChart as PieIcon, BarChart3,
  Plus, Save, CheckCircle2, AlertCircle, Clock, User
} from "lucide-react";

// API (Hapus import budget)
import { getFinancialSummary, getCashFlow } from "@/lib/api/report";
import { getDistributionLogs } from "@/lib/api/zakat";

// Warna Grafik
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function FinancialReportsPage() {
  // --- STATE UMUM ---
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // State untuk Breakdown Per Sektor
  const [sectorStats, setSectorStats] = useState({
    donasi: { in: 0, out: 0 },
    zakat: { in: 0, out: 0 },
    qurban: { in: 0, out: 0 },
  });
  
  // Filter & Pagination
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State Filter Waktu (Hari ini, Minggu ini, Bulan ini, Tahun ini)
  const [timeFilter, setTimeFilter] = useState("thisMonth");

  // --- HANDLE TIME FILTER CHANGE ---
  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    const now = new Date();
    let start, end;

    switch (value) {
      case "today":
        start = format(now, "yyyy-MM-dd");
        end = format(now, "yyyy-MM-dd");
        break;
      case "thisWeek":
        start = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
        end = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
        break;
      case "thisMonth":
        start = format(startOfMonth(now), "yyyy-MM-dd");
        end = format(endOfMonth(now), "yyyy-MM-dd");
        break;
      case "thisYear":
        start = format(startOfYear(now), "yyyy-MM-dd");
        end = format(endOfYear(now), "yyyy-MM-dd"); // ✅ benar
        break;

      default:
        // Custom range, do nothing here, handled by date inputs
        return;
    }
    setStartDate(start);
    setEndDate(end);
  };

  // --- FETCH DATA TRANSAKSI ---
// --- FETCH DATA TRANSAKSI (UPDATED) ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      
      // 1. Ambil Data Transaksi Umum & Data Distribusi Zakat Sekaligus
      const [resSummary, resFlow, resZakatDist] = await Promise.all([
        getFinancialSummary(params),
        getCashFlow(params),
        getDistributionLogs() // Ambil semua log distribusi (filter tanggal manual di bawah jika API belum support params)
      ]);

      setSummary(resSummary);

      // 2. Normalisasi Data Distribusi Zakat agar formatnya sama dengan Transaksi Umum
      // Asumsi resZakatDist adalah array object seperti di halaman admin zakat
      const zakatExpenses = (Array.isArray(resZakatDist) ? resZakatDist : []).map(item => ({
          id: `ZKT-OUT-${item.id}`,           // ID Unik semu
          date: item.distribution_date || item.created_at, // Samakan field tanggal
          category: "Penyaluran Zakat",       // Kategori hardcode/dinamis
          description: `${item.category_name || 'Zakat'} - ${item.notes || ''}`,
          amount: Number(item.amount),
          type: "keluar",                     // Pastikan tipe 'keluar'
          source: "zakat",                    // Penanda sumber dana
          status: "approved"
      })).filter(item => {
          // Filter manual berdasarkan tanggal (karena getDistributionLogs mungkin ambil semua)
          if (!startDate || !endDate) return true;
          const itemDate = new Date(item.date).getTime();
          return itemDate >= new Date(startDate).getTime() && itemDate <= new Date(endDate).getTime();
      });

      // 3. Gabungkan Transaksi Umum + Pengeluaran Zakat
      const rawTransactions = [...(resFlow || []), ...zakatExpenses];

      // 4. Sortir & Hitung Saldo (Logika sama seperti sebelumnya)
      const sortedAsc = [...rawTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let currentBalance = 0; 
      let dIn = 0, dOut = 0; 
      let zIn = 0, zOut = 0; 
      let qIn = 0, qOut = 0; 

      const enrichedTransactions = sortedAsc.map((t) => {
        const amountVal = Number(t.amount) || 0;
        
        const catLower = (t.category || "").toLowerCase();
        const srcLower = (t.source || "").toLowerCase();
        const descLower = (t.description || "").toLowerCase();

        // Hitung Saldo
        if (t.type === 'masuk') {
            currentBalance += amountVal;
        } else {
            currentBalance -= amountVal;
        }

        // Deteksi Jenis Dana
        const isZakat = catLower.includes('zakat') || srcLower.includes('zakat') || descLower.includes('zakat');
        const isQurban = catLower.includes('qurban') || srcLower.includes('qurban');

        // Akumulasi Sektor
        if (isZakat) {
            if (t.type === 'masuk') zIn += amountVal; 
            else zOut += amountVal; // <-- INI SEKARANG AKAN TERISI DARI DATA DISTRIBUTION
        } else if (isQurban) {
            if (t.type === 'masuk') qIn += amountVal; 
            else qOut += amountVal;
        } else {
            if (t.type === 'masuk') dIn += amountVal; 
            else dOut += amountVal;
        }

        return {
          ...t,
          running_balance: currentBalance,
          fund_type: isZakat ? "Zakat" : (isQurban ? "Qurban" : "Umum")
        };
      });

      setTransactions(enrichedTransactions.reverse());
      setSectorStats({
        donasi: { in: dIn, out: dOut },
        zakat: { in: zIn, out: zOut },
        qurban: { in: qIn, out: qOut },
      });

    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data laporan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // set default sekali saat mount
    if (!startDate && !endDate) {
      const now = new Date();
      setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
      setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
      return;
    }

    fetchData();
  }, [startDate, endDate]);

  const trendData = useMemo(() => {
    const grouped = {};
    transactions.forEach((t) => {
      const key = t.date?.slice(0, 10);
      if (!grouped[key]) grouped[key] = { date: key, masuk: 0, keluar: 0 };
      grouped[key][t.type === "masuk" ? "masuk" : "keluar"] +=
        Number(t.amount) || 0;
    });
    return Object.values(grouped);
  }, [transactions]);

  /* ===============================
     GRAFIK: SUMBER DANA
  =============================== */
  const categoryData = useMemo(() => {
    const grouped = {};
    transactions.forEach((t) => {
      if (t.type === "masuk") {
        const cat = t.category || "Lainnya";
        grouped[cat] = (grouped[cat] || 0) + Number(t.amount || 0);
      }
    });
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  const sectorChartData = useMemo(() => [
    { name: "Donasi Umum", Masuk: sectorStats.donasi.in, Keluar: sectorStats.donasi.out },
    { name: "Zakat", Masuk: sectorStats.zakat.in, Keluar: sectorStats.zakat.out },
    { name: "Qurban", Masuk: sectorStats.qurban.in, Keluar: sectorStats.qurban.out },
  ], [sectorStats]);

  // --- FILTER & PAGINATION ---
  const filteredData = transactions.filter((t) => {
    const search = searchTerm.toLowerCase();
    const matchSearch = (t.description?.toLowerCase() || "").includes(search) || (t.category?.toLowerCase() || "").includes(search) || (t.id?.toLowerCase() || "").includes(search);
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1) }
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1) }

  // --- HELPERS ---
  const formatCurrency = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);
  const formatDate = (dateString) => { try { return format(new Date(dateString), "dd MMM yyyy", { locale: localeId }); } catch { return dateString; } };
  const handlePrint = () => { toast.success("Mempersiapkan PDF..."); };
  const handleExportExcel = () => { toast.success("Mempersiapkan Excel..."); };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-6">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Laporan Keuangan</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <p>Monitoring arus kas, donasi, zakat, dan qurban</p>
          </div>
        </div>
        
        {/* GLOBAL DATE FILTER - UPDATED */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
                <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                    <SelectTrigger className="w-[140px] h-9 text-sm bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Pilih Periode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="thisWeek">Minggu Ini</SelectItem>
                        <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                        <SelectItem value="thisYear">Tahun Ini</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Total Pemasukan</p><h3 className="text-xl font-bold text-emerald-600">{isLoading ? "..." : formatCurrency(summary?.total_income)}</h3></div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="h-6 w-6" /></div>
            </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Total Pengeluaran</p><h3 className="text-xl font-bold text-red-600">{isLoading ? "..." : formatCurrency(summary?.total_expense)}</h3></div>
                <div className="p-3 bg-red-50 text-red-600 rounded-lg"><TrendingDown className="h-6 w-6" /></div>
            </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Saldo Kas Bersih</p><h3 className="text-xl font-bold text-blue-600">{isLoading ? "..." : formatCurrency(summary?.net_balance)}</h3></div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Wallet className="h-6 w-6" /></div>
            </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Total Transaksi</p><h3 className="text-xl font-bold text-purple-600">{transactions.length}</h3></div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Activity className="h-6 w-6" /></div>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <div className="border-b border-slate-200 pb-1">
            <TabsList className="bg-transparent p-0 h-auto gap-6">
                <TabsTrigger value="overview" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Ringkasan Sektor</TabsTrigger>
                <TabsTrigger value="cashbook" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Buku Kas</TabsTrigger>
                <TabsTrigger value="charts" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Analisa Grafik</TabsTrigger>
                <TabsTrigger value="reports" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Laporan</TabsTrigger>
            </TabsList>
        </div>

        {/* TAB 1: GRAFIK & ANALISA (DEFAULT TAB) */}
        <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-600"/>
                            <div>
                                <CardTitle>Tren Arus Kas</CardTitle>
                                <CardDescription>Analisa fluktuasi pemasukan dan pengeluaran</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {/* PASTIKAN DATA ADA SEBELUM RENDER */}
                        {trendData && trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tickFormatter={(d) => d.substring(5)} fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                                    <YAxis tickFormatter={(v) => `Rp${v/1000000}jt`} fontSize={12} tickLine={false} axisLine={false}/>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                        formatter={(v) => formatCurrency(v)} 
                                    />
                                    <Area type="monotone" dataKey="masuk" stroke="#10b981" strokeWidth={2} fill="url(#colorMasuk)" name="Pemasukan"/>
                                    <Area type="monotone" dataKey="keluar" stroke="#ef4444" strokeWidth={2} fill="url(#colorKeluar)" name="Pengeluaran"/>
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Activity className="h-12 w-12 mb-2 opacity-20"/>
                                <p>Belum ada data visualisasi untuk grafik tren.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. KOMPOSISI DANA (PIE CHART) */}
                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5 text-blue-600"/>
                            <div>
                                <CardTitle>Sumber Dana</CardTitle>
                                <CardDescription>Distribusi kategori pemasukan</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {categoryData && categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                    <Legend verticalAlign="bottom"/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <PieIcon className="h-12 w-12 mb-2 opacity-20"/>
                                <p>Belum ada data sumber dana.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ROW 2: PERBANDINGAN SEKTOR (BAR CHART) */}
            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600"/>
                        <div>
                            <CardTitle>Perbandingan Sektor</CardTitle>
                            <CardDescription>Pemasukan vs Pengeluaran per kategori dana</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectorChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                            <YAxis tickFormatter={(v) => `Rp${v/1000000}jt`} fontSize={12} tickLine={false} axisLine={false}/>
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                formatter={(v) => formatCurrency(v)} 
                            />
                            <Legend />
                            <Bar dataKey="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} barSize={50} name="Pemasukan" />
                            <Bar dataKey="Keluar" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={50} name="Pengeluaran" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>

        {/* TAB 2: RINGKASAN SEKTOR */}
        <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SEKTOR DONASI */}
                <Card className="shadow-sm border border-slate-200">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 font-semibold text-slate-700">
                                <HeartHandshake className="h-4 w-4 text-blue-500"/> Donasi & Infaq
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Dana Umum</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm"><span>Masuk</span><span className="font-semibold text-emerald-600">+{formatCurrency(sectorStats.donasi.in)}</span></div>
                        <div className="flex justify-between text-sm"><span>Keluar</span><span className="font-semibold text-red-600">-{formatCurrency(sectorStats.donasi.out)}</span></div>
                        <div className="pt-2 border-t flex justify-between font-medium text-sm"><span>Surplus</span><span className="text-blue-600">{formatCurrency(sectorStats.donasi.in - sectorStats.donasi.out)}</span></div>
                    </CardContent>
                </Card>

                {/* SEKTOR ZAKAT */}
                <Card className="shadow-sm border border-slate-200">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 font-semibold text-slate-700">
                                <Coins className="h-4 w-4 text-yellow-500"/> Zakat
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Terikat</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm"><span>Terkumpul</span><span className="font-semibold text-emerald-600">+{formatCurrency(sectorStats.zakat.in)}</span></div>
                        <div className="flex justify-between text-sm"><span>Disalurkan</span><span className="font-semibold text-red-600">-{formatCurrency(sectorStats.zakat.out)}</span></div>
                        <div className="pt-2 border-t">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{ width: `${Math.min((sectorStats.zakat.out / (sectorStats.zakat.in || 1)) * 100, 100)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>Penyaluran</span><span>{((sectorStats.zakat.out/(sectorStats.zakat.in||1))*100).toFixed(1)}%</span></div>
                        </div>
                    </CardContent>
                </Card>

                {/* SEKTOR QURBAN */}
                <Card className="shadow-sm border border-slate-200">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 font-semibold text-slate-700">
                                <Gift className="h-4 w-4 text-purple-500"/> Qurban
                            </div>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Seasonal</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm"><span>Masuk</span><span className="font-semibold text-emerald-600">+{formatCurrency(sectorStats.qurban.in)}</span></div>
                        <div className="flex justify-between text-sm"><span>Operasional</span><span className="font-semibold text-red-600">-{formatCurrency(sectorStats.qurban.out)}</span></div>
                        <div className="pt-2 border-t flex justify-between font-medium text-sm"><span>Saldo</span><span className="text-purple-600">{formatCurrency(sectorStats.qurban.in - sectorStats.qurban.out)}</span></div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* TAB 3: BUKU KAS (TRANSAKSI) */}
        <TabsContent value="cashbook" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Cari uraian, kategori..." className="pl-10 bg-slate-50 border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white h-9 border-slate-200">
                        <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
                        <SelectValue placeholder="Semua Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="masuk">Pemasukan (+)</SelectItem>
                        <SelectItem value="keluar">Pengeluaran (-)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                                <tr>
                                    <th className="px-6 py-4 w-[120px]">Tanggal</th>
                                    <th className="px-6 py-4 w-[120px]">No. Bukti</th>
                                    <th className="px-6 py-4">Uraian Transaksi</th>
                                    <th className="px-6 py-4 text-center">Dana</th>
                                    <th className="px-6 py-4 text-right">Uang Masuk</th>
                                    <th className="px-6 py-4 text-right">Uang Keluar</th>
                                    <th className="px-6 py-4 text-right bg-slate-100/50">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {isLoading ? (
                                    <tr><td colSpan={8} className="p-16 text-center text-slate-400"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2"/>Memuat Buku Kas...</td></tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr><td colSpan={8} className="p-16 text-center text-slate-400">Tidak ada transaksi pada periode ini.</td></tr>
                                ) : (
                                    paginatedData.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{formatDate(t.date)}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.id}</td>
                                            <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                                                <div className="font-medium text-slate-900">{t.category}</div>
                                                <div className="text-xs text-slate-500" title={t.description}>{t.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {t.fund_type === 'Restricted' ? 
                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Terikat</Badge> : 
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Umum</Badge>
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-right text-emerald-600 font-medium">{t.type === 'masuk' ? formatCurrency(t.amount) : "-"}</td>
                                            <td className="px-6 py-4 text-right text-red-600 font-medium">{t.type === 'keluar' ? formatCurrency(t.amount) : "-"}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-700 bg-slate-50/50">{formatCurrency(t.running_balance)}</td>
                                            
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredData.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50">
                            <p className="text-xs text-slate-500">Menampilkan {paginatedData.length} dari {filteredData.length} data</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>Sebelumnya</Button>
                                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Selanjutnya</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* TAB 5: LAPORAN (EXPORT) */}
        <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={handleExportExcel} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48 transition-all">
                    <div className="flex justify-between items-start"><div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><FileSpreadsheet className="h-6 w-6" /></div><Download className="h-5 w-5 text-slate-300 group-hover:text-green-600 transition-colors" /></div>
                    <div><h4 className="font-semibold text-slate-900 text-lg">Export Excel (CSV)</h4><p className="text-sm text-slate-500 mt-1">Unduh detail transaksi keuangan.</p><span className="text-xs text-green-700 font-medium mt-3 block bg-green-50 w-fit px-2 py-1 rounded border border-green-100">{filteredData.length} Data Siap Unduh</span></div>
                </div>
                <div onClick={handlePrint} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48 transition-all">
                    <div className="flex justify-between items-start"><div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><FileText className="h-6 w-6" /></div><Download className="h-5 w-5 text-slate-300 group-hover:text-red-600 transition-colors" /></div>
                    <div><h4 className="font-semibold text-slate-900 text-lg">Cetak Laporan PDF</h4><p className="text-sm text-slate-500 mt-1">Format laporan resmi siap cetak.</p><span className="text-xs text-red-700 font-medium mt-3 block bg-red-50 w-fit px-2 py-1 rounded border border-red-100">Siap Cetak</span></div>
                </div>
            </div>
        </TabsContent>

      </Tabs>

    </div>
  );
}