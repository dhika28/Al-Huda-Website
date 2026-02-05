"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { CreateZakatPaymentPayload, ZakatPayment } from "@/app/types/zakat";
import { createZakatPayment, getAllZakatPayments } from "@/lib/api/zakat";

// Definisi Window Snap agar tidak error TypeScript
declare global {
  interface Window {
    snap: any;
  }
}

// Helper ambil ID (opsional)
function getUserIdFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/user_id=(\d+)/);
  return match ? Number(match[1]) : null;
}

type ZakatContextType = {
  zakatList: ZakatPayment[];
  form: CreateZakatPaymentPayload;
  setForm: (data: Partial<CreateZakatPaymentPayload>) => void;
  refreshZakat: () => Promise<void>;
  submitZakat: () => Promise<void>;
  isLoading: boolean;
};

const ZakatContext = createContext<ZakatContextType>({
  zakatList: [],
  form: {
    name: "", email: "", phone: "", address: "", zakat_type: "fitrah",
    total_people: 1, amount: 50000, extra_names: [], message: "",
  },
  setForm: () => {},
  refreshZakat: async () => {},
  submitZakat: async () => {},
  isLoading: false,
});

export const ZakatProvider = ({ children }: { children: ReactNode }) => {
  const userId = getUserIdFromCookie();

  const [zakatList, setZakatList] = useState<ZakatPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setFormState] = useState<CreateZakatPaymentPayload>({
    name: "", email: "", phone: "", address: "", zakat_type: "fitrah",
    total_people: 1, amount: 50000, extra_names: [], message: "",
  });

  const setForm = (data: Partial<CreateZakatPaymentPayload>) => {
    setFormState((prev) => ({ ...prev, ...data }));
  };

  const refreshZakat = async () => {
    if (!userId) return;
    try {
      const data = await getAllZakatPayments(userId);
      setZakatList(data);
    } catch (err) {
      console.error("❌ Failed to fetch zakat list:", err);
    }
  };

  // 🔥 FUNGSI UTAMA (LOGIKA PERSIS DONASI)
  const submitZakat = async () => {
    if (!userId) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        ...form,
        user_id: userId,
      };

      // 1. Kirim ke Backend -> Dapat Token
      const res = await createZakatPayment(payload);

      // 2. Cek Token
      if (!res?.token) {
        throw new Error("Gagal mendapatkan token pembayaran dari server.");
      }

      // 3. Munculkan Popup Midtrans (POPUP DULUAN)
      if (window.snap) {
        window.snap.pay(res.token, {
          // --- SUKSES BAYAR (BARU REDIRECT) ---
          onSuccess: function(result: any) {
            console.log("✅ Payment Success:", result);
            window.location.href = `/payment/status?order_id=${result.order_id}&transaction_status=${result.transaction_status}&status_code=${result.status_code}`;
            
            // Reset form
            setFormState({
                name: "", email: "", phone: "", address: "",
                zakat_type: "fitrah", total_people: 1, amount: 50000,
                extra_names: [], message: "",
            });
            refreshZakat();
          },
          // --- PENDING (ATM/Indomaret) ---
          onPending: function(result: any) {
            console.log("⏳ Payment Pending:", result);
            window.location.href = `/payment/status?order_id=${result.order_id}&transaction_status=pending&status_code=${result.status_code}`;
          },
          // --- GAGAL ---
          onError: function(result: any) {
            console.log("❌ Payment Error:", result);
            window.location.href = `/payment/status?order_id=${result.order_id}&transaction_status=error&status_code=${result.status_code}`;
          },
          // --- DITUTUP TANPA BAYAR ---
          onClose: function() {
            alert('Anda menutup popup tanpa menyelesaikan pembayaran zakat.');
          }
        });
      } else {
        alert("Sistem pembayaran belum siap. Silakan refresh halaman.");
      }

    } catch (err: any) {
      console.error("❌ Failed to submit zakat:", err);
      alert(err.message || "Terjadi kesalahan dalam memproses zakat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshZakat();
  }, []);

  return (
    <ZakatContext.Provider
      value={{
        zakatList, form, setForm, refreshZakat, submitZakat, isLoading,
      }}
    >
      {children}
    </ZakatContext.Provider>
  );
};

export const useZakat = () => useContext(ZakatContext);