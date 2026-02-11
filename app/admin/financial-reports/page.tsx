"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  format, startOfMonth, endOfMonth, startOfYear, endOfYear, 
  startOfWeek, endOfWeek, subMonths, isValid, parseISO 
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Toaster, toast } from "react-hot-toast";

// Library Grafik (Recharts)
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

// Komponen UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  TrendingUp, TrendingDown, Wallet, Search, Filter,
  FileSpreadsheet, Loader2, HeartHandshake, Coins, Gift, 
  Download, Activity, PieChart as PieIcon, BarChart3,
  Calendar,
  FileText
} from "lucide-react";

// API Imports (Pastikan path ini sesuai project Anda)
import { getFinancialSummary, getCashFlow } from "@/lib/api/report";
import { getDistributionLogs } from "@/lib/api/zakat";

// --- TYPES ---
interface Transaction {
  id: string;
  fullDate: Date;      // Object Date asli untuk sorting & math
  displayDate: string; // String ISO asli dari backend
  amount: number;
  type: "masuk" | "keluar";
  category: string;
  description: string;
  fund_type: "Zakat" | "Qurban" | "Umum";
  source?: string;
  running_balance: number;
}

interface SectorStats {
  donasi: { in: number; out: number };
  zakat: { in: number; out: number };
  qurban: { in: number; out: number };
}

// Warna Grafik
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function FinancialReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    net_balance: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [sectorStats, setSectorStats] = useState<SectorStats>({
    donasi: { in: 0, out: 0 },
    zakat: { in: 0, out: 0 },
    qurban: { in: 0, out: 0 },
  });
  
  // Filter & Pagination
  const [timeFilter, setTimeFilter] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- DATE HANDLERS ---
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    const now = new Date();
    
    // Helper reset jam ke 00:00:00 agar filter akurat
    const getStart = (d: Date) => format(d, "yyyy-MM-dd");
    const getEnd = (d: Date) => format(d, "yyyy-MM-dd");

    switch (value) {
      case "today":
        setStartDate(getStart(now));
        setEndDate(getEnd(now));
        break;
      case "thisWeek":
        setStartDate(getStart(startOfWeek(now, { weekStartsOn: 1 })));
        setEndDate(getEnd(endOfWeek(now, { weekStartsOn: 1 })));
        break;
      case "thisMonth":
        setStartDate(getStart(startOfMonth(now)));
        setEndDate(getEnd(endOfMonth(now)));
        break;
      case "lastMonth":
        const prevMonth = subMonths(now, 1);
        setStartDate(getStart(startOfMonth(prevMonth)));
        setEndDate(getEnd(endOfMonth(prevMonth)));
        break;
      case "thisYear":
        setStartDate(getStart(startOfYear(now)));
        setEndDate(getEnd(endOfYear(now)));
        break;
    }
  };

  useEffect(() => {
    const now = new Date();
    setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
  }, []);

  // --- FETCH DATA UTAMA ---
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

      // --- 🛠️ HELPER NORMALISASI KUAT (Logika Profile Page) ---
      const normalizeTransaction = (item: any, defaultType: "masuk" | "keluar", prefix: string): Transaction | null => {
        
        // 1. DETEKSI WAKTU (Persis seperti Profile Page mapItem)
        // Kita cari field yang memiliki JAM. Backend Go sering mengembalikan PascalCase (CreatedAt)
        // 'date' seringkali hanya YYYY-MM-DD, jadi kita taruh di prioritas akhir.
        const rawDate = item.created_at || item.CreatedAt || item.distribution_date || item.date || new Date().toISOString();
        
        const dateObj = new Date(rawDate);
        
        // Filter Client-Side (Abaikan jam untuk filtering range tanggal)
        const dateStrYMD = format(isValid(dateObj) ? dateObj : new Date(), "yyyy-MM-dd");
        if (dateStrYMD < startDate || dateStrYMD > endDate) return null;

        // 2. DETEKSI AMOUNT (Handle Case Sensitivity: amount vs Amount vs price vs Price)
        const amount = Number(item.amount || item.Amount || item.price || item.Price || 0);

        // 3. DETEKSI CATEGORY (Handle ProgramName, ZakatType, etc)
        const category = item.category || item.category_name || item.ProgramName || item.ZakatType || item.PackageName || "Umum";
        const description = item.description || item.notes || "-";

        // 4. DETEKSI TIPE DANA
        const catLower = String(category).toLowerCase();
        const descLower = String(description).toLowerCase();
        let fundType: "Zakat" | "Qurban" | "Umum" = "Umum";
        
        if (catLower.includes('zakat') || descLower.includes('zakat')) fundType = "Zakat";
        else if (catLower.includes('qurban') || descLower.includes('qurban')) fundType = "Qurban";

        return {
            id: `${prefix}-${item.id || item.ID || Math.random()}`,
            fullDate: dateObj, // Digunakan untuk sorting milidetik
            displayDate: rawDate,
            amount: amount,
            type: item.type ? (item.type === 'masuk' ? 'masuk' : 'keluar') : defaultType,
            category: category,
            description: description,
            fund_type: fundType,
            source: item.source || "system",
            running_balance: 0
        };
      };

      // 1. Mapping Data
      const zakatExpenses = (Array.isArray(resZakatDist) ? resZakatDist : [])
        .map((item: any) => normalizeTransaction(item, "keluar", "ZKT"))
        .filter((item: any): item is Transaction => item !== null);

      const flowTransactions = (Array.isArray(resFlow) ? resFlow : [])
        .map((item: any) => normalizeTransaction(item, "masuk", "TRX"))
        .filter((item: any): item is Transaction => item !== null);

      // 2. Gabungkan Semua
      const combined = [...flowTransactions, ...zakatExpenses];

      // 3. 🔥 LOGIKA SALDO BERJALAN:
      // Kita harus urutkan dari TERLAMA ke TERBARU dulu untuk menghitung matematika saldo.
      // (Saldo hari ini = Saldo kemarin + Masuk - Keluar)
      combined.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

      // 4. Hitung Saldo
      let currentBalance = 0;
      let dIn = 0, dOut = 0, zIn = 0, zOut = 0, qIn = 0, qOut = 0;

      const processed = combined.map(t => {
        if (t.type === 'masuk') currentBalance += t.amount;
        else currentBalance -= t.amount;

        // Stats Accumulator
        if (t.fund_type === 'Zakat') {
            t.type === 'masuk' ? zIn += t.amount : zOut += t.amount;
        } else if (t.fund_type === 'Qurban') {
            t.type === 'masuk' ? qIn += t.amount : qOut += t.amount;
        } else {
            t.type === 'masuk' ? dIn += t.amount : dOut += t.amount;
        }

        return { ...t, running_balance: currentBalance };
      });

      // 5. 🔥 FINAL REVERSE:
      // Setelah saldo dihitung dengan benar, kita BALIK array-nya.
      // Tujuannya agar data TERBARU (Malam ini) muncul di PALING ATAS tabel.
      setTransactions([...processed].reverse());

      // Set Stats
      setSectorStats({
        donasi: { in: dIn, out: dOut },
        zakat: { in: zIn, out: zOut },
        qurban: { in: qIn, out: qOut },
      });

      setSummary({
        total_income: dIn + zIn + qIn,
        total_expense: dOut + zOut + qOut,
        net_balance: (dIn + zIn + qIn) - (dOut + zOut + qOut)
      });

    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Gagal memuat data laporan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // --- MEMOIZED DATA FOR CHARTS (Grafik butuh urutan Lama -> Baru) ---
  const chartData = useMemo(() => {
    // Clone dan sort Ascending lagi khusus untuk grafik
    const sorted = [...transactions].sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
    const grouped: Record<string, any> = {};
    
    sorted.forEach(t => {
      const dateKey = format(t.fullDate, "yyyy-MM-dd");
      if (!grouped[dateKey]) grouped[dateKey] = { date: dateKey, masuk: 0, keluar: 0 };
      if (t.type === 'masuk') grouped[dateKey].masuk += t.amount;
      else grouped[dateKey].keluar += t.amount;
    });
    return Object.values(grouped);
  }, [transactions]);

  const sourceData = useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'masuk') {
        const cat = t.category || "Lainnya";
        grouped[cat] = (grouped[cat] || 0) + t.amount;
      }
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const sectorChartData = useMemo(() => [
    { name: "Donasi", Masuk: sectorStats.donasi.in, Keluar: sectorStats.donasi.out },
    { name: "Zakat", Masuk: sectorStats.zakat.in, Keluar: sectorStats.zakat.out },
    { name: "Qurban", Masuk: sectorStats.qurban.in, Keluar: sectorStats.qurban.out },
  ], [sectorStats]);

  // --- FILTER & PAGINATION ---
  const filteredData = transactions.filter((t) => {
    const search = searchTerm.toLowerCase();
    const matchSearch = 
      (t.description?.toLowerCase() || "").includes(search) || 
      (t.category?.toLowerCase() || "").includes(search);
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1) };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1) };

  // --- FORMATTERS ---
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val || 0);
  
  // Format Header (Hanya Tanggal)
  const formatDateHeader = (dateString: string) => { 
      try { return format(new Date(dateString), "dd MMM yyyy", { locale: localeId }); } 
      catch { return dateString; } 
  };

  // 🔥 FORMATTER JAM & TANGGAL (Menggunakan toLocaleDateString seperti Profile Page)
  // Ini kunci agar jam "20.20" muncul, bukan "08.00"
  const formatDateTime = (dateObj: Date) => { 
    try { 
        if (!isValid(dateObj)) return "-";
        
        return dateObj.toLocaleDateString('id-ID', {
            day: 'numeric', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit'
        });
    } catch { 
        return "-"; 
    } 
  };

  const handlePrint = () => toast.success("Fitur Cetak PDF akan diimplementasikan.");
  const handleExportExcel = () => toast.success("Fitur Export Excel akan diimplementasikan.");

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-6 font-sans">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Laporan Keuangan</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <p>Periode: <span className="font-semibold text-emerald-600">{formatDateHeader(startDate)}</span> s.d. <span className="font-semibold text-emerald-600">{formatDateHeader(endDate)}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                <SelectTrigger className="w-[160px] h-9 text-sm bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="thisWeek">Minggu Ini</SelectItem>
                    <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                    <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
                    <SelectItem value="thisYear">Tahun Ini</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Total Pemasukan</p><h3 className="text-xl font-bold text-emerald-600">{isLoading ? "..." : formatCurrency(summary.total_income)}</h3></div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="h-6 w-6" /></div>
            </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Total Pengeluaran</p><h3 className="text-xl font-bold text-red-600">{isLoading ? "..." : formatCurrency(summary.total_expense)}</h3></div>
                <div className="p-3 bg-red-50 text-red-600 rounded-lg"><TrendingDown className="h-6 w-6" /></div>
            </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Saldo (Periode Ini)</p><h3 className="text-xl font-bold text-blue-600">{isLoading ? "..." : formatCurrency(summary.net_balance)}</h3></div>
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
                <TabsTrigger value="charts" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Analisa Grafik</TabsTrigger>
                <TabsTrigger value="overview" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Ringkasan Sektor</TabsTrigger>
                <TabsTrigger value="cashbook" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Buku Kas</TabsTrigger>
                <TabsTrigger value="reports" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Laporan</TabsTrigger>
            </TabsList>
        </div>

        {/* TAB 1: GRAFIK */}
        <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-600"/>
                            <div><CardTitle>Tren Arus Kas</CardTitle><CardDescription>Fluktuasi harian pemasukan vs pengeluaran</CardDescription></div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tickFormatter={(d) => format(parseISO(d), 'dd MMM')} fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                                    <YAxis tickFormatter={(v) => `${v/1000}k`} fontSize={12} tickLine={false} axisLine={false}/>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(v: number) => formatCurrency(v)} />
                                    <Area type="monotone" dataKey="masuk" stroke="#10b981" strokeWidth={2} fill="url(#colorMasuk)" name="Pemasukan"/>
                                    <Area type="monotone" dataKey="keluar" stroke="#ef4444" strokeWidth={2} fill="url(#colorKeluar)" name="Pengeluaran"/>
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">Belum ada data grafik.</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5 text-blue-600"/>
                            <div><CardTitle>Sumber Dana</CardTitle><CardDescription>Komposisi pemasukan</CardDescription></div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {sourceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={sourceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                    <Legend verticalAlign="bottom"/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">Belum ada data pemasukan.</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600"/>
                        <div><CardTitle>Perbandingan Sektor</CardTitle><CardDescription>Komparasi Pemasukan vs Pengeluaran</CardDescription></div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectorChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                            <YAxis tickFormatter={(v) => `${v/1000}k`} fontSize={12} tickLine={false} axisLine={false}/>
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(v: number) => formatCurrency(v)} />
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
                {[
                    { label: "Donasi Umum", icon: HeartHandshake, color: "blue", data: sectorStats.donasi },
                    { label: "Zakat", icon: Coins, color: "yellow", data: sectorStats.zakat },
                    { label: "Qurban", icon: Gift, color: "purple", data: sectorStats.qurban }
                ].map((item, idx) => (
                    <Card key={idx} className="shadow-sm border border-slate-200">
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 font-semibold text-slate-700">
                                    <item.icon className={`h-4 w-4 text-${item.color}-500`}/> {item.label}
                                </div>
                                <Badge variant="outline" className={`bg-${item.color}-50 text-${item.color}-700 border-${item.color}-200`}>Dana</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between text-sm"><span>Masuk</span><span className="font-semibold text-emerald-600">+{formatCurrency(item.data.in)}</span></div>
                            <div className="flex justify-between text-sm"><span>Keluar</span><span className="font-semibold text-red-600">-{formatCurrency(item.data.out)}</span></div>
                            <div className="pt-2 border-t flex justify-between font-medium text-sm"><span>Saldo</span><span className={`text-${item.color}-600`}>{formatCurrency(item.data.in - item.data.out)}</span></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>

        {/* TAB 3: BUKU KAS (FIXED TIME & ORDER) */}
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
                                    <th className="px-6 py-4 w-[200px]">Waktu & Tanggal</th>
                                    <th className="px-6 py-4 w-[120px]">No. Bukti</th>
                                    <th className="px-6 py-4">Uraian Transaksi</th>
                                    <th className="px-6 py-4 text-center">Dana</th>
                                    <th className="px-6 py-4 text-right">Uang Masuk</th>
                                    <th className="px-6 py-4 text-right">Uang Keluar</th>
                                    <th className="px-6 py-4 text-right bg-slate-50">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {isLoading ? (
                                    <tr><td colSpan={7} className="p-16 text-center text-slate-400"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2"/>Memuat Buku Kas...</td></tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr><td colSpan={7} className="p-16 text-center text-slate-400">Tidak ada transaksi pada periode ini.</td></tr>
                                ) : (
                                    paginatedData.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium text-xs">
                                                {formatDateTime(t.fullDate)}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.id}</td>
                                            <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                                                <div className="font-medium text-slate-900">{t.category}</div>
                                                <div className="text-xs text-slate-500" title={t.description}>{t.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="outline" className={`border ${t.fund_type === 'Zakat' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{t.fund_type}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-emerald-600 font-medium">{t.type === 'masuk' ? formatCurrency(t.amount) : "-"}</td>
                                            <td className="px-6 py-4 text-right text-red-600 font-medium">{t.type === 'keluar' ? formatCurrency(t.amount) : "-"}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-700 bg-slate-50">{formatCurrency(t.running_balance)}</td>
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

        {/* TAB 4: LAPORAN (EXPORT) */}
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