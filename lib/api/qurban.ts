import axios from "axios";
// Pastikan path import types ini sesuai dengan project Anda
import {
  QurbanPackage,
  QurbanRegistrationInput,
  QurbanRegistrationResponse,
} from "@/app/types/qurban";

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

// --- PUBLIC / USER ENDPOINTS ---

export async function getQurbanPackages(): Promise<QurbanPackage[]> {
  try {
    const res = await api.get("/qurban/packages");
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil paket qurban:", error);
    return []; // Return empty array biar ga crash
  }
}

export async function createQurbanRegistration(
  data: QurbanRegistrationInput
): Promise<QurbanRegistrationResponse> {
  try {
    const res = await api.post("/qurban/register", data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal mendaftar:", error.response?.data || error.message);
    throw error;
  }
}

export async function getQurbanHistory(userId: number) {
  if (!userId) throw new Error("User ID required");
  const res = await api.get(`/qurban/history?user_id=${userId}`);
  return res.data;
}

// --- ADMIN ENDPOINTS ---

// 1. GET ALL REGISTRATIONS (ADMIN)
export async function getAllQurbanRegistrations() {
  try {
    const res = await api.get("/admin/qurban/registrations");
    return res.data;
  } catch (error) {
    console.error("❌ Admin: Gagal load data pendaftar:", error);
    return [];
  }
}

// 2. CREATE PACKAGE (ADMIN)
export async function createQurbanPackage(data: Partial<QurbanPackage>) {
  try {
    const res = await api.post("/admin/qurban/packages", data);
    return res.data;
  } catch (error) {
    throw error;
  }
}

// 3. UPDATE PACKAGE (ADMIN)
export async function updateQurbanPackage(id: number, data: Partial<QurbanPackage>) {
  try {
    const res = await api.put(`/admin/qurban/packages/${id}`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
}

// 4. DELETE PACKAGE (ADMIN)
export async function deleteQurbanPackage(id: number) {
  try {
    const res = await api.delete(`/admin/qurban/packages/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

// 5. UPDATE STATUS PEMBAYARAN (ADMIN)
export async function updateQurbanStatus(id: number, status: string) {
    try {
        const res = await api.put(`/admin/qurban/registrations/${id}/status`, { status });
        return res.data;
    } catch (error) {
        throw error;
    }
}

// --- EXPENSES ENDPOINTS (KEUANGAN OPERASIONAL) ---

// 6. GET ALL EXPENSES
export async function getQurbanExpenses() {
  try {
    const res = await api.get("/qurban/expenses");
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil data pengeluaran:", error);
    return [];
  }
}

// 7. CREATE EXPENSE
export async function createQurbanExpense(data: any) {
  try {
    const res = await api.post("/qurban/expenses", data);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal menyimpan pengeluaran:", error);
    throw error;
  }
}

// 8. UPDATE EXPENSE (BARU)
export async function updateQurbanExpense(id: number, data: any) {
  try {
    const res = await api.put(`/qurban/expenses/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal update pengeluaran:", error);
    throw error;
  }
}

// 9. DELETE EXPENSE (BARU)
export async function deleteQurbanExpense(id: number) {
  try {
    const res = await api.delete(`/qurban/expenses/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal hapus pengeluaran:", error);
    throw error;
  }
}