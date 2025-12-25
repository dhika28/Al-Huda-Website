import axios from "axios";
import { Donation, Program } from "@/app/types/donation";

// Ambil URL API dari environment variable
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api/v1";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_URL tidak ditemukan. Default ke http://localhost:8080/api/v1"
  );
}

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // penting untuk mengirim cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// Ambil daftar program donasi
// ===============================
export async function getPrograms(): Promise<Program[]> {
  try {
    const res = await api.get("/programs");
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil data program:", error);
    throw error;
  }
}
export async function getTotalDonations() {
  try {
    const res = await api.get("/donations/total");
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil total donasi:", error);
    throw error;
  }
}
// ===============================
// Ambil donasi terbaru
// ===============================
export async function getRecentDonations(): Promise<Donation[]> {
  try {
    const res = await api.get("/donations/recent");
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil donasi terbaru:", error);
    throw error;
  }
}

// ===============================
// Kirim donasi baru
// ===============================
export async function createDonation(donation: Donation) {
  try {
    const payload = {
      ...donation,
      donation_type: donation.program_id ? "program" : "quick",
    };

    const res = await api.post("/donations", payload);

    console.log("✅ Donasi berhasil dikirim:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal mengirim donasi:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
}


// ===============================
// Ambil riwayat donasi user (harus login)
// ===============================
export async function getUserDonations(): Promise<Donation[]> {
  try {
    // cukup pakai cookie, jangan ambil token dari localStorage
    const res = await api.get("/user-donations");
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal mengambil riwayat donasi user:");
    return [];
  }
}
