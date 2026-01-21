"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Wallet,
  CalendarIcon,
  Mail,
  User,
  Info,
  Edit,
  TrendingDown,
  Receipt
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import { Program, Donation, DonationAllocation } from "@/app/types/donation";
import { useDonation } from "@/contexts/donation-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* =======================
   PAGE COMPONENT
======================= */
export default function AdminDonationsPage() {
  const {
    donations,
    programs,
    allocations, // Data Alokasi dari Database (via Context)
    isLoading,
    
    // Actions Program
    handleAddProgram,
    handleUpdateProgram,
    handleDeleteProgram,
    
    // Actions Donation
    handleUpdateStatus,
    handleManualDonation,

    // Actions Allocation (Connected to DB)
    handleAddAllocation,
    handleUpdateAllocation,
    handleDeleteAllocation
  } = useDonation();

  // --- STATE LOKAL (UI Only) ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingAllocation, setEditingAllocation] = useState<DonationAllocation | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // --- CALCULATIONS (Real-time Stats) ---
  const stats = useMemo(() => {
    // 1. Total Masuk (Hanya status success/paid)
    const totalIn = donations
      .filter(d => d.status === 'success' || d.status === 'paid')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 2. Total Keluar (Dari data database)
    const totalOut = allocations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 3. Sisa Saldo
    const balance = totalIn - totalOut;

    return { totalIn, totalOut, balance };
  }, [donations, allocations]);

  // Helper Formatters
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  /* =======================
     LOGIC FILTER & PAGINATION (TRANSAKSI)
  ======================= */
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setCurrentPage(1); };
  const handleFilterChange = (status: string) => { setStatusFilter(status); setCurrentPage(1); };

  /* =======================
     HELPER: VISUALS
  ======================= */
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "failed": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      case "failed": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  /* =======================
     HANDLERS: ACTIONS
  ======================= */
  const onStatusChange = async (id: number, newStatus: string) => {
    if (handleUpdateStatus) {
      toast.promise(handleUpdateStatus(id, newStatus), {
        loading: 'Mengupdate status...',
        success: <b>Status berhasil diperbarui!</b>,
        error: <b>Gagal mengupdate status.</b>,
      });
    }
  };

  const onDeleteProgram = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <div className="font-semibold text-sm text-gray-900">Hapus program ini?</div>
        <div className="text-xs text-gray-500">Data yang dihapus tidak dapat dikembalikan.</div>
        <div className="flex gap-2 justify-end mt-3">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">Batal</button>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try { await handleDeleteProgram(id); toast.success("Program berhasil dihapus"); }
            catch (e) { toast.error("Gagal menghapus program"); }
          }} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition">Ya, Hapus</button>
        </div>
      </div>
    ), { duration: 5000, style: { minWidth: '300px', border: '1px solid #eee' } });
  };

  /* =======================
     HANDLERS: ALLOCATION (DB CONNECTED)
  ======================= */
  const handleSaveAllocation = async (data: any) => {
    const operationalCategories = ["Operasional", "Pembangunan", "Listrik", "Air", "Gaji", "Lainnya"];
    const type = operationalCategories.includes(data.category) ? "operational" : "classification";

    const payload = {
        ...data,
        amount: Number(data.amount),
        allocation_type: type
    };
    
    if (editingAllocation && editingAllocation.id) {
        await toast.promise(
            handleUpdateAllocation(editingAllocation.id, payload),
            { loading: 'Menyimpan perubahan...', success: 'Alokasi diperbarui!', error: 'Gagal update' }
        );
    } else {
        await toast.promise(
            handleAddAllocation(payload),
            { loading: 'Mencatat penyaluran...', success: 'Penyaluran berhasil dicatat!', error: 'Gagal mencatat' }
        );
    }
    
    setIsAllocationModalOpen(false);
    setEditingAllocation(null);
  };

  const onDeleteAllocation = (id: number) => {
      toast((t) => (
        <div className="flex flex-col gap-2 p-1">
          <div className="font-semibold text-sm text-gray-900">Hapus data penyaluran ini?</div>
          <div className="text-xs text-gray-500">Saldo akan dikembalikan ke kas.</div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">Batal</button>
            <button onClick={async () => {
                toast.dismiss(t.id);
                try {
                    await handleDeleteAllocation(id);
                    toast.success("Data dihapus");
                } catch(e) {
                    toast.error("Gagal menghapus");
                }
              }} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition">Ya, Hapus</button>
          </div>
        </div>
      ));
  };

  const openAddAllocation = () => { setEditingAllocation(null); setIsAllocationModalOpen(true); };
  const openEditAllocation = (alloc: DonationAllocation) => { setEditingAllocation(alloc); setIsAllocationModalOpen(true); };


  /* =======================
     HANDLERS: EXPORT
  ======================= */
  const handleExportExcel = () => {
    if (donations.length === 0) return toast.error("Tidak ada data.");
    try {
      const headers = ["ID Donasi", "Tanggal", "Nama Donatur", "Email", "Nominal (IDR)", "Status", "Tipe", "Pesan"];
      const rows = donations.map(d => [d.id, d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : "-", `"${d.name}"`, d.email, d.amount, d.status || "pending", d.donation_type, `"${d.message || ""}"`]);
      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Donasi_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast.success("Export Excel Berhasil!");
    } catch (error) { toast.error("Gagal export."); }
  };

  const handleExportPDF = () => {
    if (donations.length === 0) return toast.error("Tidak ada data.");
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) return toast.error("Pop-up diblokir.");
    
    // Logic untuk tabel Pemasukan (Donasi Sukses)
    const successDonations = donations.filter(d => d.status === 'success' || d.status === 'paid');

    const htmlContent = `
    <html>
      <head>
        <title>Laporan Keuangan Donasi</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
          .header p { margin: 5px 0 0; font-size: 14px; }
          h2 { text-align: center; text-decoration: underline; margin-bottom: 20px; font-size: 18px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
          .amount { text-align: right; }
          
          .section-title { font-weight: bold; margin-top: 30px; font-size: 14px; }
          .summary-box { margin-top: 30px; border: 1px solid #000; padding: 15px; width: 60%; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .summary-row.total { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; margin-top: 5px; }
          
          .footer { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .sign { text-align: center; width: 200px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MASJID AL-HUDA TABANAN</h1>
          <p>Jl. Mawar No. 12, Tabanan, Bali | Telp: (0361) 123456</p>
        </div>

        <h2>LAPORAN KEUANGAN DONASI</h2>
        <p style="text-align:center">Periode: ${new Date().toLocaleDateString('id-ID', {month:'long', year:'numeric'})}</p>

        <div class="section-title">I. PEMASUKAN (Donasi Masuk)</div>
        <table>
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="15%">Tanggal</th>
              <th>Nama Donatur</th>
              <th width="15%">Tipe</th>
              <th width="20%">Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${successDonations.length > 0 ? successDonations.map((d, i) => `
              <tr>
                <td style="text-align:center">${i + 1}</td>
                <td>${d.created_at ? new Date(d.created_at).toLocaleDateString("id-ID") : "-"}</td>
                <td>${d.name}</td>
                <td style="text-align:center">${d.donation_type}</td>
                <td class="amount">${formatCurrency(d.amount)}</td>
              </tr>
            `).join('') : '<tr><td colspan="5" style="text-align:center">Belum ada donasi masuk.</td></tr>'}
            <tr style="font-weight:bold; background-color:#f9f9f9;">
              <td colspan="4" style="text-align:right">TOTAL PEMASUKAN</td>
              <td class="amount">${formatCurrency(stats.totalIn)}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">II. PENGELUARAN (Penyaluran Dana)</div>
        <table>
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="15%">Tanggal</th>
              <th width="15%">Kategori</th>
              <th>Keterangan</th>
              <th width="20%">Nominal</th>
            </tr>
          </thead>
          <tbody>
            ${allocations.length > 0 ? allocations.map((a, i) => `
              <tr>
                <td style="text-align:center">${i + 1}</td>
                <td>${a.date ? new Date(a.date).toLocaleDateString("id-ID") : "-"}</td>
                <td>${a.category}</td>
                <td>${a.description}</td>
                <td class="amount">${formatCurrency(a.amount)}</td>
              </tr>
            `).join('') : '<tr><td colspan="5" style="text-align:center">Belum ada pengeluaran dana.</td></tr>'}
            <tr style="font-weight:bold; background-color:#f9f9f9;">
              <td colspan="4" style="text-align:right">TOTAL PENGELUARAN</td>
              <td class="amount">${formatCurrency(stats.totalOut)}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-row"><span>Total Pemasukan</span><span>${formatCurrency(stats.totalIn)}</span></div>
          <div class="summary-row"><span>Total Pengeluaran</span><span>(${formatCurrency(stats.totalOut)})</span></div>
          <div class="summary-row total"><span>SISA SALDO (KAS)</span><span>${formatCurrency(stats.balance)}</span></div>
        </div>

        <div class="footer">
          <div class="sign">
            <p>Mengetahui,<br/>Ketua Yayasan</p>
            <br/><br/><br/>
            <p>( ........................... )</p>
          </div>
          <div class="sign">
            <p>Tabanan, ${new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}<br/>Bendahara</p>
            <br/><br/><br/>
            <p>( ........................... )</p>
          </div>
        </div>

        <script>window.onload=function(){window.print()}</script>
      </body>
    </html>
    `;
    printWindow.document.write(htmlContent); 
    printWindow.document.close();
  };

  // Modal Handlers (Program)
  const openCreateModal = () => { setEditingProgram(null); setIsModalOpen(true); };
  const openEditModal = (program: Program) => { setEditingProgram(program); setIsModalOpen(true); };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 space-y-6 print:bg-white print:p-0">
      <Toaster position="top-center" reverseOrder={false} />

      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Kelola Donasi</h2>
          <p className="text-sm text-slate-500 mt-1">Pantau arus kas, kelola program, dan alokasi dana umat.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsManualModalOpen(true)} variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-slate-200">
            <Wallet className="mr-2 h-4 w-4" /> Catat Manual
          </Button>
          <Button onClick={openCreateModal} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Program Baru
          </Button>
        </div>
      </div>

      {/* STATS CARDS (DYNAMIC CALCULATION) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        <StatCard title="Total Dana Masuk" value={formatCurrency(stats.totalIn)} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} trend="Donasi Terverifikasi" bg="bg-emerald-50" />
        <StatCard title="Total Penyaluran" value={formatCurrency(stats.totalOut)} icon={<TrendingDown className="h-5 w-5 text-red-600" />} trend="Alokasi Dana" bg="bg-red-50" />
        <StatCard title="Sisa Saldo Kas" value={formatCurrency(stats.balance)} icon={<Wallet className="h-5 w-5 text-blue-600" />} trend="Dana Tersedia" bg="bg-blue-50" />
        <StatCard title="Program Aktif" value={programs.length.toString()} icon={<Calendar className="h-5 w-5 text-orange-600" />} trend="Kampanye Berjalan" bg="bg-orange-50" />
      </div>

      {/* MAIN CONTENT (TABS) */}
      <Tabs defaultValue="transactions" className="space-y-6">

        <div className="border-b border-slate-200 pb-1 print:hidden">
          <TabsList className="bg-transparent p-0 h-auto gap-6">
            <TabsTrigger value="transactions" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Riwayat Transaksi</TabsTrigger>
            <TabsTrigger value="allocations" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Alokasi Dana</TabsTrigger>
            <TabsTrigger value="programs" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Program Donasi</TabsTrigger>
            <TabsTrigger value="reports" className="px-0 py-2 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none transition-all">Laporan</TabsTrigger>
          </TabsList>
        </div>

        {/* --- TAB: TRANSACTIONS --- */}
        <TabsContent value="transactions" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Cari nama donatur atau email..." className="pl-10 bg-slate-50 border-slate-200" value={search} onChange={handleSearchChange} />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'success', 'pending', 'failed'].map(s => (
                <Button key={s} variant="outline" size="sm" onClick={() => handleFilterChange(s)} className={`capitalize border h-9 ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>{s}</Button>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              {isLoading ? (
                <div className="p-12 text-center text-slate-500">Memuat data transaksi...</div>
              ) : (
                <table className="w-full text-sm text-left table-auto">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">ID & Tanggal</th>
                      <th className="px-6 py-4 whitespace-nowrap">Donatur</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Nominal</th>
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDonations.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Tidak ada data yang ditemukan.</td></tr>
                    )}
                    {currentDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5 align-top">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border">#{d.id}</span>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(d.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="font-medium text-slate-900">{d.name}</div>
                          <Badge variant="outline" className={`mt-1 text-[10px] bg-white border-slate-200 text-slate-600 font-normal`}>
                            {d.donation_type === "program" ? "Program" : "Umum"}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 align-top text-right font-bold text-emerald-600 whitespace-nowrap">
                          {formatCurrency(d.amount)}
                        </td>
                        <td className="px-6 py-5 align-top whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(d.status || 'pending')}`}>
                            {getStatusIcon(d.status || 'pending')}
                            {d.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-top text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => setSelectedDonation(d)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-auto px-2 text-xs border border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-600 gap-1"><Edit className="h-3 w-3" /><span className="hidden sm:inline">Status</span></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => d.id && onStatusChange(d.id, "success")} className="cursor-pointer text-emerald-600"><CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Success</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => d.id && onStatusChange(d.id, "pending")} className="cursor-pointer text-yellow-600"><Clock className="mr-2 h-4 w-4" /> Mark as Pending</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => d.id && onStatusChange(d.id, "failed")} className="cursor-pointer text-red-600"><XCircle className="mr-2 h-4 w-4" /> Mark as Failed</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {filteredDonations.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50">
                <p className="text-xs text-slate-500">Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">{Math.min(indexOfLastItem, filteredDonations.length)}</span> dari <span className="font-medium">{filteredDonations.length}</span> transaksi</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                  <div className="text-xs font-medium bg-white border px-3 py-1.5 rounded">Halaman {currentPage}</div>
                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* --- TAB: ALLOCATIONS (BARU) --- */}
        <TabsContent value="allocations" className="mt-4 space-y-6">
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-emerald-600"/> Rekap Alokasi Dana</CardTitle>
                        <CardDescription>Catat penyaluran dana ke mustahik sesuai klasifikasi user dan biaya operasional.</CardDescription>
                    </div>
                    <Button onClick={openAddAllocation} className="bg-red-600 hover:bg-red-700 text-white">
                        <TrendingDown className="mr-2 h-4 w-4" /> Catat Penyaluran
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Kategori (Klasifikasi)</th>
                                    <th className="px-6 py-4">Keterangan</th>
                                    <th className="px-6 py-4">PIC</th>
                                    <th className="px-6 py-4 text-right">Nominal</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allocations.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada data penyaluran dana.</td></tr>
                                ) : allocations.map((alloc) => (
                                    <tr key={alloc.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 text-slate-600">{formatDate(alloc.date)}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`
                                                ${['Fakir', 'Miskin'].includes(alloc.category) ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                                  ['Yatim', 'Piatu', 'Yatim Piatu'].includes(alloc.category) ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                  ['Janda', 'Lansia', 'Mualaf'].includes(alloc.category) ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                  'bg-gray-50 text-gray-700 border-gray-200'}
                                            `}>
                                                {alloc.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{alloc.description}</td>
                                        <td className="px-6 py-4 text-slate-500">{alloc.pic}</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600">-{formatCurrency(alloc.amount)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditAllocation(alloc)}><Pencil className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => alloc.id ? onDeleteAllocation(alloc.id) : null}><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* FOOTER TOTAL */}
                                <tr className="bg-slate-50 border-t-2 border-slate-100">
                                    <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-700">Total Tersalurkan:</td>
                                    <td className="px-6 py-4 text-right font-bold text-red-700">{formatCurrency(stats.totalOut)}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- TAB: PROGRAMS --- */}
        <TabsContent value="programs" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
            {!isLoading && programs.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">Belum ada program donasi.</p>
                <Button variant="link" onClick={openCreateModal} className="mt-2 text-emerald-600">Buat Program Pertama</Button>
              </div>
            )}
            {programs.map((p) => {
              const progress = p.target > 0 ? Math.round((p.collected / p.target) * 100) : 0;
              return (
                <Card key={p.id} className="group overflow-hidden border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-lg transition-all duration-300 bg-white">
                  <div className="h-2 bg-emerald-500 w-full" /> 
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg text-slate-900 leading-snug line-clamp-2">{p.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600 print:hidden"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(p)}><Pencil className="mr-2 h-4 w-4 text-slate-500" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => p.id && onDeleteProgram(p.id)}><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">{p.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end text-sm">
                        <div><p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">Terkumpul</p><p className="font-bold text-emerald-600 text-lg leading-none">{formatCurrency(p.collected)}</p></div>
                        <div className="text-right"><p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Target</p><p className="font-medium text-slate-700 leading-none">{formatCurrency(p.target)}</p></div>
                      </div>
                      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* --- TAB: REPORTS --- */}
        <TabsContent value="reports" className="mt-4 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={handleExportExcel} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48">
                <div className="flex justify-between items-start"><div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><FileSpreadsheet className="h-6 w-6" /></div><Download className="h-5 w-5 text-slate-300" /></div>
                <div>
                  <h4 className="font-semibold text-slate-900">Export Excel (CSV)</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Unduh data mentah transaksi donasi dalam format .csv.</p>
                  <span className="text-[10px] text-green-600 font-medium mt-3 block bg-green-50 w-fit px-2 py-1 rounded">{donations.length} Data Siap Unduh</span></div>
            </div>
            <div onClick={handleExportPDF} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-48">
                <div className="flex justify-between items-start"><div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"><Printer className="h-6 w-6" /></div><Download className="h-5 w-5 text-slate-300" /></div>
                <div>
                  <h4 className="font-semibold text-slate-900">Cetak Laporan PDF</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Dokumen resmi siap cetak (A4) dengan Kop Yayasan.</p>
                <span className="text-[10px] text-red-600 font-medium mt-3 block bg-red-50 w-fit px-2 py-1 rounded">Format Laporan Keuangan</span></div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* =======================================
          MODALS
      ======================================= */}
      {isModalOpen && <ProgramModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={editingProgram} onSubmit={editingProgram ? handleUpdateProgram : handleAddProgram} />}
      {isManualModalOpen && <ManualDonationModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} programs={programs} onSubmit={handleManualDonation} />}
      
      {/* NEW: ALLOCATION MODAL */}
      <AllocationFormModal 
          isOpen={isAllocationModalOpen}
          onClose={() => setIsAllocationModalOpen(false)}
          onSave={handleSaveAllocation}
          initialData={editingAllocation}
      />

      {/* NEW: DETAIL MODAL */}
      {selectedDonation && (
        <DonationDetailModal data={selectedDonation} onClose={() => setSelectedDonation(null)} />
      )}
    </div>
  );
}

/* =======================
   SUB-COMPONENT: DETAIL MODAL (POPUP)
======================= */
function DonationDetailModal({ data, onClose }: { data: Donation; onClose: () => void }) {
    if (!data) return null;
    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900">Detail Donasi</h2>
                            <Badge variant="outline" className="bg-white">{data.donation_type === 'program' ? 'Program' : 'Umum'}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">ID: #{data.id} • {new Date(data.created_at || '').toLocaleString("id-ID")}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition"><X className="h-5 w-5" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                        data.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                        data.status === 'pending' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' :
                        'bg-red-50 border-red-100 text-red-800'
                    }`}>
                        {data.status === 'success' ? <CheckCircle2 className="h-5 w-5"/> : <Clock className="h-5 w-5"/>}
                        <div>
                            <p className="font-bold text-sm uppercase">Status: {data.status || 'Pending'}</p>
                            <p className="text-xs opacity-80">Total: {formatCurrency(data.amount)}</p>
                        </div>
                    </div>

                    {/* Identitas Donatur */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><User className="h-4 w-4 text-emerald-600"/> Data Donatur</h3>
                        <div className="grid grid-cols-1 gap-4 text-sm">
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs">Nama Lengkap</Label>
                                <p className="font-medium text-slate-900">{data.name}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs">Email / Kontak</Label>
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 text-slate-400"/>
                                    <p className="font-medium text-slate-900">{data.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pesan / Doa */}
                    {data.message && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2"><Info className="h-4 w-4 text-purple-600"/> Pesan / Doa</h3>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">"{data.message}"</div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
                    <Button onClick={onClose} variant="outline">Tutup</Button>
                </div>
            </div>
        </div>
    )
}

/* =======================
   SUB-COMPONENT: STAT CARD (SAMA)
======================= */
function StatCard({ title, value, icon, trend, bg }: { title: string; value: string; icon: React.ReactNode; trend: string, bg?: string }) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4"><p className="text-sm font-medium text-slate-500">{title}</p><div className={`p-2 rounded-lg ${bg || 'bg-slate-50'}`}>{icon}</div></div>
        <div><h3 className="text-2xl font-bold text-slate-900">{value}</h3><p className="text-xs text-slate-400 mt-1">{trend}</p></div>
      </CardContent>
    </Card>
  );
}

/* =======================
   SUB-COMPONENT: PROGRAM MODAL (SAMA)
======================= */
function ProgramModal({ isOpen, onClose, initialData, onSubmit }: { isOpen: boolean; onClose: () => void; initialData: Program | null; onSubmit: (idOrData: any, data?: any) => Promise<void> }) {
  const [formData, setFormData] = useState<Partial<Program>>(initialData || { title: "", description: "", target: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try { 
        if (initialData && initialData.id) { await onSubmit(initialData.id, formData); toast.success("Program berhasil diperbarui!"); } 
        else { await onSubmit(formData); toast.success("Program berhasil dibuat!"); } 
        onClose(); 
    } catch (error) { toast.error("Terjadi kesalahan."); } finally { setIsSubmitting(false); }
  };
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
            <div><h2 className="text-lg font-bold text-slate-900">{initialData ? "Edit Program" : "Buat Program Baru"}</h2></div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-2"><Label>Judul Program</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Target Donasi (Rp)</Label><Input type="number" value={formData.target || ""} onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })} required /></div>
            <div className="space-y-2"><Label>Deskripsi</Label><Textarea className="h-32" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></div>
            </form>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={handleSubmit} className="bg-emerald-600 text-white" disabled={isSubmitting}>Simpan</Button></div>
        </div>
    </div>
  );
}

/* =======================
   SUB-COMPONENT: MANUAL DONATION MODAL (SAMA)
======================= */
function ManualDonationModal({ isOpen, onClose, programs, onSubmit }: { isOpen: boolean; onClose: () => void; programs: Program[]; onSubmit: (data: any) => Promise<void>; }) {
  const [formData, setFormData] = useState({ name: "", email: "", amount: "", program_id: "general", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
        await onSubmit({ name: formData.name, email: formData.email, amount: parseInt(formData.amount), message: formData.message, program_id: formData.program_id === "general" ? null : parseInt(formData.program_id) });
        toast.success("Donasi manual berhasil dicatat!"); onClose();
    } catch (error) { toast.error("Gagal mencatat donasi."); } finally { setIsSubmitting(false); }
  };
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-600" /> Catat Donasi Manual</h2>
                <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-1"><Label>Nominal (Rp)</Label><Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required /></div>
                <div className="space-y-1"><Label>Tujuan Donasi</Label><select className="flex h-10 w-full rounded-md border px-3 py-2 text-sm" value={formData.program_id} onChange={(e) => setFormData({...formData, program_id: e.target.value})}><option value="general">Donasi Umum</option>{programs.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}</select></div>
                <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><Label>Nama</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div><div className="space-y-1"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div></div>
                <div className="space-y-1"><Label>Catatan</Label><Textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} /></div>
            </form>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={handleSubmit} className="bg-emerald-600 text-white" disabled={isSubmitting}>Simpan</Button></div>
        </div>
    </div>
  );
}

/* =======================
   SUB-COMPONENT: ALLOCATION MODAL (BARU)
======================= */
function AllocationFormModal({ isOpen, onClose, onSave, initialData }: any) {
    const defaultData = {
        category: "Fakir", // Default category
        description: "",
        amount: "",
        pic: "",
        date: new Date().toISOString().split('T')[0]
    }
    
    const [formData, setFormData] = useState(defaultData)

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                amount: initialData.amount.toString(),
                date: initialData.date.split('T')[0]
            })
        } else {
            setFormData(defaultData)
        }
    }, [initialData, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Alokasi" : "Catat Penyaluran Dana"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Perbarui data penyaluran." : "Input penyaluran dana ke mustahik atau operasional."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label>Kategori (Klasifikasi)</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <DropdownMenuLabel>Mustahik</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <SelectItem value="Fakir">Fakir</SelectItem>
                                <SelectItem value="Miskin">Miskin</SelectItem>
                                <SelectItem value="Yatim">Yatim</SelectItem>
                                <SelectItem value="Piatu">Piatu</SelectItem>
                                <SelectItem value="Yatim Piatu">Yatim Piatu</SelectItem>
                                <SelectItem value="Lansia">Lansia</SelectItem>
                                <SelectItem value="Janda">Janda</SelectItem>
                                <SelectItem value="Mualaf">Mualaf</SelectItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuLabel>Operasional</DropdownMenuLabel>
                                <SelectItem value="Operasional">Operasional Masjid</SelectItem>
                                <SelectItem value="Pembangunan">Pembangunan</SelectItem>
                                <SelectItem value="Listrik">Listrik</SelectItem>
                                <SelectItem value="Air">Air</SelectItem>
                                <SelectItem value="Gaji">Gaji</SelectItem>
                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Keterangan</Label>
                        <Input 
                            placeholder="Contoh: Santunan 10 Anak Yatim" 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Jumlah (Rp)</Label>
                            <Input 
                                type="number" 
                                placeholder="0" 
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Tanggal</Label>
                            <Input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Penanggung Jawab (PIC)</Label>
                        <Input 
                            placeholder="Nama Panitia" 
                            value={formData.pic}
                            onChange={(e) => setFormData({...formData, pic: e.target.value})}
                            required 
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                            {initialData ? "Simpan Perubahan" : "Simpan Penyaluran"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}