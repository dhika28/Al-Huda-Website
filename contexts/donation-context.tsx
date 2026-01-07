"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { Program, Donation } from "@/app/types/donation";
import {
  getPrograms,
  getAllDonations,
  getTotalDonations,
  createDonation,
  createProgram,
  updateProgram,
  deleteProgram,
  updateDonationStatus,
  createManualDonation, // <-- Import API Manual Donation
} from "@/lib/api/donation";

/* =======================
   TYPE DEFINITION
======================= */
type DonationContextType = {
  programs: Program[];
  donations: Donation[];
  totalDonation: number;
  isLoading: boolean;

  refreshPrograms: () => Promise<void>;
  refreshDonations: () => Promise<void>;
  refreshTotalDonation: () => Promise<void>;

  submitDonation: (donation: Donation) => Promise<void>;

  handleAddProgram: (program: Program) => Promise<void>;
  handleUpdateProgram: (id: number, program: Program) => Promise<void>;
  handleDeleteProgram: (id: number) => Promise<void>;

  handleUpdateStatus: (id: number, status: string) => Promise<void>;
  handleManualDonation: (data: any) => Promise<void>; // <-- Type Definition Baru
};

/* =======================
   CONTEXT DEFAULT VALUES
======================= */
const DonationContext = createContext<DonationContextType>({
  programs: [],
  donations: [],
  totalDonation: 0,
  isLoading: false,

  refreshPrograms: async () => {},
  refreshDonations: async () => {},
  refreshTotalDonation: async () => {},

  submitDonation: async () => {},

  handleAddProgram: async () => {},
  handleUpdateProgram: async () => {},
  handleDeleteProgram: async () => {},
  handleUpdateStatus: async () => {},
  handleManualDonation: async () => {}, // <-- Default Value
});

/* =======================
   PROVIDER COMPONENT
======================= */
export const DonationProvider = ({ children }: { children: ReactNode }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDonation, setTotalDonation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  /* =======================
     FETCHERS (GET DATA)
  ======================= */
  const refreshPrograms = async () => {
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch (err) {
      console.error("❌ Failed to fetch programs:", err);
    }
  };

  const refreshDonations = async () => {
    try {
      const data = await getAllDonations();
      setDonations(data);
    } catch (err) {
      console.error("❌ Failed to fetch donations:", err);
    }
  };

  const refreshTotalDonation = async () => {
    try {
      const total = await getTotalDonations();
      setTotalDonation(total ?? 0);
    } catch (err) {
      console.error("❌ Failed to fetch total donations:", err);
    }
  };

  /* =======================
     PUBLIC ACTIONS
  ======================= */
  const submitDonation = async (donation: Donation) => {
    try {
      setIsLoading(true);
      const res = await createDonation(donation);

      if (res?.redirect_url) {
        window.location.href = res.redirect_url;
      } else {
        throw new Error("Gagal memproses pembayaran (No Redirect URL).");
      }
    } catch (err) {
      console.error("❌ Failed to submit donation:", err);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     ADMIN ACTIONS (CRUD PROGRAM)
  ======================= */

  // 1. Create Program
  const handleAddProgram = async (program: Program) => {
    try {
      setIsLoading(true);
      await createProgram(program);
      await refreshPrograms(); 
    } catch (err) {
      console.error("❌ Failed to create program:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Update Program
  const handleUpdateProgram = async (id: number, program: Program) => {
    try {
      setIsLoading(true);
      await updateProgram(id, program);
      await refreshPrograms();
    } catch (err) {
      console.error("❌ Failed to update program:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Delete Program
  const handleDeleteProgram = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteProgram(id);
      await refreshPrograms();
    } catch (err) {
      console.error("❌ Failed to delete program:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     ADMIN ACTIONS (UPDATE STATUS DONATION)
  ======================= */
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      setIsLoading(true);
      await updateDonationStatus(id, status);

      await Promise.all([
        refreshDonations(),
        refreshPrograms(),
        refreshTotalDonation()
      ]);
    } catch (err) {
      console.error("❌ Failed to update status:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     ADMIN ACTIONS (MANUAL DONATION)
  ======================= */
  const handleManualDonation = async (data: any) => {
    try {
      setIsLoading(true);
      await createManualDonation(data);

      // Refresh semua data karena donasi manual otomatis sukses (mempengaruhi saldo & total)
      await Promise.all([
        refreshDonations(),
        refreshPrograms(),
        refreshTotalDonation()
      ]);
    } catch (err) {
      console.error("❌ Failed to create manual donation:", err);
      throw err; // Lempar error agar ditangkap Toast di Page
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     INIT LOAD
  ======================= */
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      refreshPrograms(),
      refreshDonations(),
      refreshTotalDonation(),
    ]).finally(() => setIsLoading(false));
  }, []);

  /* =======================
     RENDER PROVIDER
  ======================= */
  return (
    <DonationContext.Provider
      value={{
        programs,
        donations,
        totalDonation,
        isLoading,
        refreshPrograms,
        refreshDonations,
        refreshTotalDonation,
        submitDonation,
        handleAddProgram,
        handleUpdateProgram,
        handleDeleteProgram,
        handleUpdateStatus,
        handleManualDonation, // <-- Exported
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};

/* =======================
   HOOK
======================= */
export const useDonation = () => {
  return useContext(DonationContext);
};