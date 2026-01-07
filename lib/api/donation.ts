import axios from "axios";
import { Donation, Program } from "@/app/types/donation";

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

// [BARU] Ambil SEMUA donasi untuk Tabel Admin
export async function getAllDonations(): Promise<Donation[]> {
  try {
    const res = await api.get("/donations"); // Route ini sudah ada di backend (GET)
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil semua donasi:", error);
    throw error;
  }
}

// [BARU] Update Status Donasi Manual (Pending -> Success/Failed)
export async function updateDonationStatus(id: number, status: string) {
  try {
    // Pastikan backend memiliki route PUT /donations/status?id=... atau sejenisnya
    // Sesuai pola program, kita pakai query param id
    const res = await api.put("/donations/status", { status }, {
      params: { id } 
    });
    return res.data;
  } catch (error) {
    console.error("❌ Gagal update status donasi:", error);
    throw error;
  }
}
export async function createManualDonation(data: any) {
  try {
    // Route ini harus sesuai dengan yang dibuat di Backend Go
    const res = await api.post("/admin/donations/manual", data);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mencatat donasi manual:", error);
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
      // Logika frontend: jika ada program_id berarti tipe 'program', jika tidak 'quick'/'umum'
      donation_type: donation.program_id ? "program" : "quick",
    };

    const res = await api.post("/donations", payload);

    console.log("✅ Donasi berhasil dibuat (Pending):", res.data);
    return res.data; // Mengembalikan { token, redirect_url, donation_id }
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
    // Jika userId tidak dioper, backend biasanya ambil dari token (context)
    // Tapi di endpoint backend Anda sebelumnya pakai query param ?user_id=...
    const config = userId ? { params: { user_id: userId } } : {};
    
    const res = await api.get("/user-donations", config);
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil riwayat donasi user");
    return [];
  }
}
