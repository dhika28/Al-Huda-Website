import axios from "axios";
import type { CreateZakatPaymentPayload, ZakatPayment } from "@/app/types/zakat";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ==========================================
// 1. TRANSAKSI ZAKAT (PEMASUKAN)
// ==========================================

// POST zakat (Create New)
export async function createZakatPayment(data: CreateZakatPaymentPayload) {
  try {
    const res = await api.post("/zakat", data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal mengirim zakat:", error.response || error.message);
    throw error;
  }
}

// GET semua zakat user (History per User) → userId wajib di-pass
export async function getAllZakatPayments(userId: number) {
  try {
    const res = await api.get(`/zakat?user_id=${userId}`);
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  } catch (error: any) {
    console.error("❌ Gagal mengambil data zakat:", error.response || error.message);
    throw error;
  }
}

// GET semua zakat (Admin List)
export async function getAllZakat() {
  try {
    const res = await api.get("/admin/zakat-list"); 
    return res.data?.data || [];
  } catch (error: any) {
    console.error("❌ Gagal mengambil data zakat:", error);
    return [];
  }
}

// UPDATE Status Zakat (Admin)
export async function updateZakatStatus(id: number, status: string) {
  try {
    const res = await api.put(`/admin/zakat/${id}/status`, { status });
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal update status zakat:", error.response || error.message);
    throw error;
  }
}

// ==========================================
// 2. DISTRIBUSI ZAKAT (ALOKASI / RENCANA)
// ==========================================

export interface ZakatDistributionItem {
  id: number;
  category: string;
  percentage: number;
  
  // Financials
  amount: number;    // Pagu Anggaran
  used: number;      // [BARU] Realisasi
  remaining: number; // [BARU] Sisa Dana
  
  recipients: number;
  color: string;
}

export interface ZakatDistributionResponse {
  total_zakat: number;
  distribution: ZakatDistributionItem[];
}

// GET Data Distribusi Zakat (Summary)
export async function getZakatDistribution(): Promise<ZakatDistributionResponse> {
  try {
    const res = await api.get("/zakat/distribution");
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal load distribusi zakat:", error);
    return {
      total_zakat: 0,
      distribution: []
    };
  }
}

// UPDATE Setting Distribusi (Admin) - Update Persentase
export async function updateZakatDistribution(data: {id: number, percentage: number}[]) {
  try {
    const res = await api.put("/admin/zakat/distribution", data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal update distribusi:", error);
    throw error;
  }
}

// ==========================================
// 3. LOG PENYALURAN (REALISASI / PENGELUARAN)
// ==========================================

export interface DistributionLogItem {
  id: number;
  distribution_setting_id: number;
  category_name?: string; // Dari join backend
  amount: number;
  recipient_count: number;
  distribution_type: string;
  status: string;
  distribution_date: string;
  pic_name: string;
  document_ref: string;
  notes: string;
  created_at: string;
}

export interface CreateDistributionLogPayload {
  distribution_setting_id: number;
  amount: number;
  recipient_count: number;
  distribution_type: string; // 'tunai', 'transfer', 'barang'
  status?: string;           // 'draft', 'approved'
  distribution_date?: string;
  pic_name?: string;
  document_ref?: string;
  notes: string;
}

// GET History Penyaluran
export async function getDistributionLogs() {
  try {
    const res = await api.get("/admin/zakat/distribution/logs");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    console.error("❌ Gagal load history penyaluran:", error);
    return [];
  }
}

// CREATE Log Penyaluran Baru
export async function createDistributionLog(data: CreateDistributionLogPayload) {
  try {
    const res = await api.post("/admin/zakat/distribution/logs", data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal mencatat penyaluran:", error);
    throw error;
  }
}

// DELETE Log Penyaluran (BARU)
export async function deleteDistributionLog(id: number) {
  try {
    // Axios otomatis mengubah object params menjadi query string: ?id=...
    const res = await api.delete("/admin/zakat/distribution/logs", {
      params: { id }
    });
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal menghapus log penyaluran:", error);
    throw error;
  }
}