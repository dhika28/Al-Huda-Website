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

// POST zakat
export async function createZakatPayment(data: CreateZakatPaymentPayload) {
  try {
    const res = await api.post("/zakat", data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal mengirim zakat:", error.response || error.message);
    throw error;
  }
}

// GET semua zakat user → userId wajib di-pass
export async function getAllZakatPayments(userId: number) {
  try {
    const res = await api.get(`/zakat?user_id=${userId}`);
    return res.data?.data || [];
  } catch (error: any) {
    console.error("❌ Gagal mengambil data zakat:", error.response || error.message);
    throw error;
  }
}


