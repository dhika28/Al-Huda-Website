"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Program, Donation } from "@/app/types/donation";
import { getPrograms, getRecentDonations, createDonation } from "@/lib/api/donation";

type DonationContextType = {
  programs: Program[];
  donations: Donation[];
  refreshPrograms: () => Promise<void>;
  refreshDonations: () => Promise<void>;
  submitDonation: (donation: Donation) => Promise<void>;
  isLoading: boolean;
};

// Default value aman untuk mencegah null
const DonationContext = createContext<DonationContextType>({
  programs: [],
  donations: [],
  refreshPrograms: async () => {},
  refreshDonations: async () => {},
  submitDonation: async () => {},
  isLoading: false,
});

export const DonationProvider = ({ children }: { children: ReactNode }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPrograms = async () => {
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  const refreshDonations = async () => {
    try {
      const data = await getRecentDonations();
      setDonations(data);
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    }
  };

  const submitDonation = async (donation: Donation) => {
    try {
      setIsLoading(true);
      const res = await createDonation(donation);

      // Redirect ke Midtrans payment page
      if (res?.redirect_url) {
        window.location.href = res.redirect_url;
      } else {
        alert("Gagal memproses pembayaran.");
      }

      // Refresh data
      await refreshDonations();
      await refreshPrograms();
    } catch (err) {
      console.error("Failed to submit donation:", err);
      alert("Terjadi kesalahan saat mengirim donasi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPrograms();
    refreshDonations();
  }, []);

  return (
    <DonationContext.Provider
      value={{
        programs,
        donations,
        refreshPrograms,
        refreshDonations,
        submitDonation,
        isLoading,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};

export const useDonation = () => {
  return useContext(DonationContext);
};
