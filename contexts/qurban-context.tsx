"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Pastikan tipe data ini ada di file types Anda
import {
  QurbanPackage,
  QurbanRegistrationInput,
  QurbanRegistrationResponse,
  // QurbanHistory, // Jika sudah didefinisikan di types, uncomment ini
} from "@/app/types/qurban";

import {
  getQurbanPackages,
  createQurbanRegistration,
  getQurbanHistory, // Import fungsi history dari API
} from "@/lib/api/qurban";

// Definisi Interface History (Jika belum ada di @/app/types/qurban)
export interface QurbanHistory {
  id: number;
  package_name: string;
  price: number;
  participant_count: number;
  status: string;
  created_at: string;
}

// =======================================
// Context Interface
// =======================================
interface QurbanContextProps {
  packages: QurbanPackage[];
  history: QurbanHistory[]; // Tambahan: Data History
  loading: boolean;
  error: string | null;

  user: any | null;
  setUser: (user: any | null) => void;

  registerQurban: (
    data: QurbanRegistrationInput
  ) => Promise<QurbanRegistrationResponse | null>;
  
  refreshHistory: () => Promise<void>; // Tambahan: Fungsi refresh manual
}

// =======================================
// Create Context
// =======================================
const QurbanContext = createContext<QurbanContextProps | undefined>(undefined);

// =======================================
// Provider Component
// =======================================
export function QurbanProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<QurbanPackage[]>([]);
  const [history, setHistory] = useState<QurbanHistory[]>([]); // State History
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User State
  const [user, setUser] = useState<any | null>(null);

  // =======================================
  // 1. Fetch Packages on Mount
  // =======================================
  useEffect(() => {
    async function loadPackages() {
      try {
        setLoading(true);
        const data = await getQurbanPackages();
        setPackages(data);
      } catch (err) {
        console.error("❌ Gagal memuat paket qurban:", err);
        setError("Gagal memuat paket qurban");
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, []);

  // =======================================
  // 2. Fetch History when User Changes
  // =======================================
  const refreshHistory = useCallback(async () => {
    if (!user || !user.id) {
      setHistory([]);
      return;
    }

    try {
      // Tidak men-set global loading agar tidak blocking UI utama
      const data = await getQurbanHistory(user.id);
      // Mapping response API ke tipe QurbanHistory jika perlu (tergantung format API)
      const mappedData = data.map((item: any) => ({
        id: item.id,
        package_name: item.PackageName || item.package_name, // Handle case key difference
        price: item.Price || item.price,
        participant_count: item.ParticipantCount || item.participant_count,
        status: item.Status || item.status,
        created_at: item.CreatedAt || item.created_at
      }));
      setHistory(mappedData);
    } catch (err) {
      console.error("❌ Gagal memuat history:", err);
    }
  }, [user]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // =======================================
  // 3. Register Qurban Function
  // =======================================
  async function registerQurban(
    data: QurbanRegistrationInput
  ): Promise<QurbanRegistrationResponse | null> {
    try {
      setError(null); // Reset error sebelum request
      console.log("📤 Mengirim data pendaftaran qurban:", data);

      const res = await createQurbanRegistration(data);

      console.log("📥 Respons pendaftaran qurban:", res);
      
      // Jika berhasil, refresh history agar data baru muncul
      if (user) {
        await refreshHistory();
      }

      return res;
    } catch (err: any) {
      console.error("❌ Error dari registerQurban:", err);
      // Set error message agar bisa ditampilkan di UI jika perlu
      setError(err.response?.data?.error || "Gagal melakukan pendaftaran.");
      // Throw error agar komponen pemanggil bisa menangkapnya (misal untuk show Toast)
      throw err; 
    }
  }

  return (
    <QurbanContext.Provider
      value={{
        packages,
        history, // Expose history
        loading,
        error,

        user,
        setUser,

        registerQurban,
        refreshHistory, // Expose refresh function
      }}
    >
      {children}
    </QurbanContext.Provider>
  );
}

// =======================================
// Hook: useQurban()
// =======================================
export function useQurban() {
  const context = useContext(QurbanContext);
  if (!context) {
    throw new Error("useQurban harus dipakai di dalam <QurbanProvider>");
  }
  return context;
}