"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import {
  QurbanPackage,
  QurbanRegistrationInput,
  QurbanRegistrationResponse,
} from "@/app/types/qurban";

import {
  getQurbanPackages,
  createQurbanRegistration,
} from "@/lib/api/qurban";

// =======================================
// Context Interface
// =======================================
interface QurbanContextProps {
  packages: QurbanPackage[];
  loading: boolean;
  error: string | null;

  user: any | null;                     // ← TAMBAHAN
  setUser: (user: any | null) => void;  // ← TAMBAHAN

  registerQurban: (
    data: QurbanRegistrationInput
  ) => Promise<QurbanRegistrationResponse | null>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =======================================
  // USER STATE
  // =======================================
  const [user, setUser] = useState<any | null>(null); // ← TAMBAHAN

  // =======================================
  // Fetch packages on mount
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
  // Register Qurban
  // =======================================
  async function registerQurban(
    data: QurbanRegistrationInput
  ): Promise<QurbanRegistrationResponse | null> {
    try {
      console.log("📤 Mengirim data pendaftaran qurban:", data);

      const res = await createQurbanRegistration(data);

      console.log("📥 Respons pendaftaran qurban:", res);
      return res;
    } catch (err) {
      console.error("❌ Error dari registerQurban:", err);
      return null;
    }
  }

  return (
    <QurbanContext.Provider
      value={{
        packages,
        loading,
        error,

        user,     // ← TAMBAHAN
        setUser,  // ← TAMBAHAN

        registerQurban,
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
