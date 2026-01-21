import axios from "axios";
import { Donation, Program, DonationAllocation } from "@/app/types/donation"; 
// Pastikan Anda sudah menambahkan type DonationAllocation di types/donation.ts
// Jika belum, lihat catatan di bawah kode ini.

// ===============================
// Base API URL
// ===============================
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api/v1";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_URL tidak ditemukan. Default ke http://localhost:8080/api/v1"
  );
}

// ===============================
// Axios instance
// ===============================
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // penting untuk cookie auth (JWT)
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// PROGRAM (PUBLIC)
// ======================================================

// Ambil semua program donasi
export async function getPrograms(): Promise<Program[]> {
  try {
    const res = await api.get("/programs");
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil data program:", error);
    throw error;
  }
}

// Ambil detail program (by id)
export async function getProgramById(id: number): Promise<Program> {
  try {
    const res = await api.get("/programs/detail", {
      params: { id },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil detail program:", error);
    throw error;
  }
}

// ======================================================
// PROGRAM (ADMIN)
// ======================================================

export async function createProgram(program: Program) {
  try {
    const res = await api.post("/programs", program);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal membuat program:", error);
    throw error;
  }
}

export async function updateProgram(id: number, program: Program) {
  try {
    const res = await api.put("/programs/detail", program, {
      params: { id },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Gagal update program:", error);
    throw error;
  }
}

export async function deleteProgram(id: number) {
  try {
    const res = await api.delete("/programs/detail", {
      params: { id },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Gagal hapus program:", error);
    throw error;
  }
}

// ======================================================
// DONATION (PUBLIC / DASHBOARD)
// ======================================================

// Ambil total donasi (Backend return { "total": 12345 })
export async function getTotalDonations(): Promise<number> {
  try {
    const res = await api.get("/donations/total");
    // Pastikan mengambil property .total dari response object
    return res.data?.total || 0;
  } catch (error) {
    console.error("❌ Gagal mengambil total donasi:", error);
    return 0;
  }
}

// Ambil donasi terbaru (Limit 10) - Untuk Widget/Landing Page
export async function getRecentDonations(): Promise<Donation[]> {
  try {
    const res = await api.get("/donations/recent");
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil donasi terbaru:", error);
    return [];
  }
}

// ======================================================
// DONATION (ADMIN - MANAGE)
// ======================================================

// Ambil SEMUA donasi untuk Tabel Admin
export async function getAllDonations(): Promise<Donation[]> {
  try {
    const res = await api.get("/donations"); // Route ini sudah ada di backend (GET)
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil semua donasi:", error);
    throw error;
  }
}

// Update Status Donasi Manual (Pending -> Success/Failed)
export async function updateDonationStatus(id: number, status: string) {
  try {
    const res = await api.put("/donations/status", { status }, {
      params: { id } 
    });
    return res.data;
  } catch (error) {
    console.error("❌ Gagal update status donasi:", error);
    throw error;
  }
}

// Catat donasi manual (Cash/Offline)
export async function createManualDonation(data: any) {
  try {
    const res = await api.post("/admin/donations/manual", data);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mencatat donasi manual:", error);
    throw error;
  }
}

// ======================================================
// ALLOCATION / PENGELUARAN DANA (ADMIN) - [BARU]
// ======================================================

// Ambil semua data alokasi
export async function getAllocations(type?: string): Promise<DonationAllocation[]> {
  try {
    // Bisa filter by type: 'classification' atau 'operational'
    const config = type ? { params: { type } } : {};
    const res = await api.get("/allocations", config);
    
    // DEBUG: Uncomment baris ini jika ingin melihat struktur data asli di console browser
    // console.log("🔍 API Response Allocations:", res.data);

    // 1. Jika response body kosong/null
    if (!res.data) return [];

    // 2. Jika response langsung Array
    if (Array.isArray(res.data)) return res.data;

    // 3. Jika response dibungkus object { data: [...] }
    // Menggunakan Optional Chaining (?.) agar tidak error jika res.data null
    return res.data?.data || [];
    
  } catch (error) {
    console.error("❌ Gagal mengambil data alokasi:", error);
    return [];
  }
}

// Catat alokasi baru
export async function createAllocation(data: DonationAllocation) {
  try {
    const res = await api.post("/allocations", data);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mencatat alokasi:", error);
    throw error;
  }
}

// Update alokasi
export async function updateAllocation(id: number, data: DonationAllocation) {
  try {
    // Backend menggunakan query param ?id=... untuk PUT
    const res = await api.put("/allocations", data, {
      params: { id }
    });
    return res.data;
  } catch (error) {
    console.error("❌ Gagal update alokasi:", error);
    throw error;
  }
}

// Hapus alokasi
export async function deleteAllocation(id: number) {
  try {
    // Backend menggunakan query param ?id=... untuk DELETE
    const res = await api.delete("/allocations", {
      params: { id }
    });
    return res.data;
  } catch (error) {
    console.error("❌ Gagal hapus alokasi:", error);
    throw error;
  }
}

// ======================================================
// DONATION (CREATE / TRANSACTION)
// ======================================================

export async function createDonation(donation: Donation) {
  try {
    const payload = {
      ...donation,
      donation_type: donation.program_id ? "program" : "quick",
    };

    const res = await api.post("/donations", payload);

    console.log("✅ Donasi berhasil dibuat (Pending):", res.data);
    return res.data; 
  } catch (error: any) {
    console.error("❌ Gagal membuat donasi:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
}

// ======================================================
// DONATION (USER – LOGIN REQUIRED)
// ======================================================

export async function getUserDonations(userId?: number): Promise<Donation[]> {
  try {
    const config = userId ? { params: { user_id: userId } } : {};
    const res = await api.get("/user-donations", config);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil riwayat donasi user");
    return [];
  }
}