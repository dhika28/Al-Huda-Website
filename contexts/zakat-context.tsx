"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { CreateZakatPaymentPayload, ZakatPayment } from "@/app/types/zakat";
import { createZakatPayment, getAllZakatPayments } from "@/lib/api/zakat";

// ambil user_id dari cookie backend
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
    name: "",
    email: "",
    phone: "",
    address: "",
    zakat_type: "fitrah",
    total_people: 1,
    amount: 50000,
    extra_names: [],
    message: "",
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
    name: "",
    email: "",
    phone: "",
    address: "",
    zakat_type: "fitrah",
    total_people: 1,
    amount: 50000,
    extra_names: [],
    message: "",
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
      console.error("Failed to fetch zakat list:", err);
    }
  };

  const submitZakat = async () => {
    if (!userId) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    try {
      setIsLoading(true);

      // gabungkan payload form + user_id
      const payload = {
        ...form,
        user_id: userId, // ← backend butuh ini
      };

      await createZakatPayment(payload);

      await refreshZakat();

      // reset form
      setFormState({
        name: "",
        email: "",
        phone: "",
        address: "",
        zakat_type: "fitrah",
        total_people: 1,
        amount: 50000,
        extra_names: [],
        message: "",
      });
    } catch (err) {
      console.error("Failed to submit zakat:", err);
      alert("Terjadi kesalahan dalam mengirim zakat.");
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
        zakatList,
        form,
        setForm,
        refreshZakat,
        submitZakat,
        isLoading,
      }}
    >
      {children}
    </ZakatContext.Provider>
  );
};

export const useZakat = () => useContext(ZakatContext);
