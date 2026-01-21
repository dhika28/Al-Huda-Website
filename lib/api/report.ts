import axios from "axios";
import { 
  FinancialSummary, 
  CashFlowItem, 
  ReportParams,
} from "@/app/types/report";

// ===============================
// KONFIGURASI AXIOS
// ===============================
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR: Otomatis pasang Token JWT dari LocalStorage
api.interceptors.request.use(
  (config) => {
    // Pastikan kode ini berjalan di sisi client (browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// 1. REPORTING API (EXISTING)
// ===============================

/**
 * Mengambil ringkasan keuangan (Card Statistik)
 * Endpoint: GET /reports/summary
 */
export async function getFinancialSummary(params?: ReportParams): Promise<FinancialSummary> {
  try {
    const res = await api.get("/reports/summary", { params });
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil ringkasan keuangan:", error);
    // Kembalikan nilai default agar UI tidak crash
    return {
      total_income_donation: 0,
      total_income_zakat: 0,
      total_income_qurban: 0,
      total_expense_donation: 0,
      total_expense_qurban: 0,
      total_income: 0,
      total_expense: 0,
      net_balance: 0,
    };
  }
}

/**
 * Mengambil data arus kas gabungan (Tabel Ledger)
 * Endpoint: GET /reports/cashflow
 */
export async function getCashFlow(params?: ReportParams): Promise<CashFlowItem[]> {
  try {
    const res = await api.get("/reports/cashflow", { params });
    // Pastikan return array kosong jika data null (safety)
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("❌ Gagal mengambil data arus kas:", error);
    return [];
  }
}
