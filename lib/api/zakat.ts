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
// TRANSAKSI ZAKAT
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
    // Backend mengirim array langsung untuk endpoint user
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
    // Backend admin mengirim object { data: [...] }
    return res.data?.data || [];
  } catch (error: any) {
    console.error("❌ Gagal mengambil data zakat:", error);
    return [];
  }
}

// [BARU] UPDATE Status Zakat (Admin)
export async function updateZakatStatus(id: number, status: string) {
  try {
    // Endpoint sesuai backend manual handling: /api/v1/admin/zakat/{id}/status
    const res = await api.put(`/admin/zakat/${id}/status`, { status });
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal update status zakat:", error.response || error.message);
    throw error;
  }
}

// ==========================================
// DISTRIBUSI ZAKAT
// ==========================================

export interface ZakatDistributionItem {
  id: number;
  category: string;
  percentage: number;
  amount: number;
  recipients: number;
  color: string;
}

export interface ZakatDistributionResponse {
  total_zakat: number;
  distribution: ZakatDistributionItem[];
}

// GET Data Distribusi Zakat
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

// UPDATE Setting Distribusi (Admin)
export async function updateZakatDistribution(data: {id: number, percentage: number}[]) {
  try {
    const res = await api.put("/admin/zakat/distribution", data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal update distribusi:", error);
    throw error;
  }
}