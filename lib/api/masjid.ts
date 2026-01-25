// lib/api/mosque.ts

import { MosqueProfile } from "@/app/types/masjid";

// Ganti sesuai URL Backend Golang kamu
const API_BASE_URL = "http://localhost:8080/api/v1"; 
const ENDPOINT = `${API_BASE_URL}/profile/masjid`;

// --- GET PROFILE ---
export async function getMosqueProfile(): Promise<MosqueProfile | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Gagal mengambil data profil masjid");
    }

    const json = await res.json();
    return json.data as MosqueProfile;
  } catch (error) {
    console.error("[API] Error fetching mosque profile:", error);
    throw error;
  }
}

// --- UPDATE PROFILE (FormData) ---
export async function updateMosqueProfile(formData: FormData): Promise<MosqueProfile> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Gagal update profil");
    }

    const json = await res.json();
    return json.data as MosqueProfile;
  } catch (error) {
    console.error("[API] Error updating mosque profile:", error);
    throw error;
  }
}

// --- CREATE PROFILE (Initial) ---
export async function createMosqueProfile(formData: FormData): Promise<MosqueProfile> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Gagal membuat profil");
    }

    const json = await res.json();
    return json.data as MosqueProfile;
  } catch (error) {
    console.error("[API] Error creating mosque profile:", error);
    throw error;
  }
}

// --- DELETE PROFILE (Reset Data) ---
// Tambahkan fungsi ini
export async function deleteMosqueProfile(): Promise<void> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Gagal menghapus profil");
    }
    
    // Sukses hapus (Backend biasanya return message json, tapi kita cuma butuh status OK)
  } catch (error) {
    console.error("[API] Error deleting mosque profile:", error);
    throw error;
  }
}