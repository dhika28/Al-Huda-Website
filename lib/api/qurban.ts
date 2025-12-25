import axios from "axios";
import {
  QurbanPackage,
  QurbanRegistrationInput,
  QurbanRegistrationResponse,
} from "@/app/types/qurban";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api/v1";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "⚠️ NEXT_PUBLIC_API_URL tidak ditemukan. Default ke http://localhost:8080/api/v1"
  );
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================================================
   GET — Daftar Paket Qurban
   ============================================================ */
export async function getQurbanPackages(): Promise<QurbanPackage[]> {
  try {
    const res = await api.get("/qurban/packages");
    return res.data;
  } catch (error) {
    console.error("❌ Gagal mengambil paket qurban:", error);
    throw error;
  }
}

/* ============================================================
   POST — Daftar Qurban
   ============================================================ */
export async function createQurbanRegistration(
  data: QurbanRegistrationInput
): Promise<QurbanRegistrationResponse> {
  try {
    // Debugging — pastikan extra_names ikut terkirim
    console.log("📤 Mengirim pendaftaran qurban:", data);

    const res = await api.post("/qurban/register", data);

    console.log("✅ Pendaftaran qurban berhasil:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Gagal mendaftar qurban:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }

    throw error;
  }
}
export async function getQurbanHistory(userId: number) {
  if (!userId) throw new Error("User ID required");
  const res = await api.get(`/qurban/history?user_id=${userId}`);
  return res.data;
}
