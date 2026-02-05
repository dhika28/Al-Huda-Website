"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Pastikan tipe DonationAllocation sudah ditambahkan di file types
import { Program, Donation, DonationAllocation } from "@/app/types/donation";
import {
  getPrograms,
  getAllDonations,
  getTotalDonations,
  getAllocations, // <-- Import API Baru
  createDonation,
  createProgram,
  updateProgram,
  deleteProgram,
  updateDonationStatus,
  createManualDonation,
  createAllocation, // <-- Import API Baru
  updateAllocation, // <-- Import API Baru
  deleteAllocation, // <-- Import API Baru
} from "@/lib/api/donation";

// Tambahkan ini agar TypeScript tidak error saat akses window.snap
declare global {
  interface Window {
    snap: any;
  }
}

/* =======================
   TYPE DEFINITION
======================= */
type DonationContextType = {
  programs: Program[];
  donations: Donation[];
  allocations: DonationAllocation[]; // <-- State Baru: Data Alokasi
  totalDonation: number;
  isLoading: boolean;

  refreshPrograms: () => Promise<void>;
  refreshDonations: () => Promise<void>;
  refreshAllocations: () => Promise<void>; // <-- Fetcher Baru
  refreshTotalDonation: () => Promise<void>;

  submitDonation: (donation: Donation) => Promise<void>;

  // Program Actions
  handleAddProgram: (program: Program) => Promise<void>;
  handleUpdateProgram: (id: number, program: Program) => Promise<void>;
  handleDeleteProgram: (id: number) => Promise<void>;

  // Donation Actions
  handleUpdateStatus: (id: number, status: string) => Promise<void>;
  handleManualDonation: (data: any) => Promise<void>;

  // Allocation Actions (BARU)
  handleAddAllocation: (data: DonationAllocation) => Promise<void>;
  handleUpdateAllocation: (id: number, data: DonationAllocation) => Promise<void>;
  handleDeleteAllocation: (id: number) => Promise<void>;
};

/* =======================
   CONTEXT DEFAULT VALUES
======================= */
const DonationContext = createContext<DonationContextType>({
  programs: [],
  donations: [],
  allocations: [], // <-- Default Kosong
  totalDonation: 0,
  isLoading: false,

  refreshPrograms: async () => {},
  refreshDonations: async () => {},
  refreshAllocations: async () => {}, // <-- Default
  refreshTotalDonation: async () => {},

  submitDonation: async () => {},

  handleAddProgram: async () => {},
  handleUpdateProgram: async () => {},
  handleDeleteProgram: async () => {},

  handleUpdateStatus: async () => {},
  handleManualDonation: async () => {},

  handleAddAllocation: async () => {},    // <-- Default
  handleUpdateAllocation: async () => {}, // <-- Default
  handleDeleteAllocation: async () => {}, // <-- Default
});

/* =======================
   PROVIDER COMPONENT
======================= */
export const DonationProvider = ({ children }: { children: ReactNode }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [allocations, setAllocations] = useState<DonationAllocation[]>([]); // <-- State Alokasi
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

  // [BARU] Fetch data alokasi dari database
  const refreshAllocations = async () => {
    try {
      const data = await getAllocations();
      setAllocations(data);
    } catch (err) {
      console.error("❌ Failed to fetch allocations:", err);
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
  /* =======================
   PUBLIC ACTIONS
======================= */
const submitDonation = async (donation: Donation) => {
  try {
    setIsLoading(true);
    
    // 1. Kirim Data Donasi ke Backend untuk dapatkan SNAP TOKEN
    const res = await createDonation(donation);

    // 2. Cek apakah Token ada
    if (!res?.token) {
      throw new Error("Gagal mendapatkan token pembayaran dari server.");
    }

    // 3. Munculkan Popup Midtrans
    if (window.snap) {
      window.snap.pay(res.token, {
        // SUKSES BAYAR -> REDIRECT KE HALAMAN STATUS
        onSuccess: function(result: any) {
          window.location.href = `/payment/status?order_id=${result.order_id}&transaction_status=${result.transaction_status}&status_code=${result.status_code}`;
        },
        // PENDING (ATM/INDOMARET) -> REDIRECT KE HALAMAN STATUS
        onPending: function(result: any) {
          window.location.href = `/payment/status?order_id=${result.order_id}&transaction_status=pending&status_code=${result.status_code}`;
        },
        // GAGAL -> REDIRECT KE HALAMAN STATUS
        onError: function(result: any) {
          window.location.href = `/payment/status?order_id=${result.order_id}&transaction_status=error&status_code=${result.status_code}`;
        },
        // TUTUP POPUP -> ALERT SAJA
        onClose: function() {
          alert('Anda menutup popup tanpa menyelesaikan pembayaran');
        }
      });
    } else {
      alert("Sistem pembayaran belum siap. Silakan refresh halaman.");
    }

  } catch (err: any) {
    console.error("❌ Failed to submit donation:", err);
    alert(err.message || "Terjadi kesalahan saat memproses donasi.");
  } finally {
    setIsLoading(false);
  }
};

  /* =======================
     ADMIN ACTIONS (CRUD PROGRAM)
  ======================= */
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
     ADMIN ACTIONS (CRUD ALLOCATION) - [BARU]
  ======================= */
  const handleAddAllocation = async (data: DonationAllocation) => {
    try {
      setIsLoading(true);
      await createAllocation(data); // Kirim ke API
      await refreshAllocations();   // Refresh state lokal
    } catch (err) {
      console.error("❌ Failed to create allocation:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAllocation = async (id: number, data: DonationAllocation) => {
    try {
      setIsLoading(true);
      await updateAllocation(id, data); // Kirim ke API
      await refreshAllocations();       // Refresh state lokal
    } catch (err) {
      console.error("❌ Failed to update allocation:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllocation = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteAllocation(id); // Kirim ke API
      await refreshAllocations(); // Refresh state lokal
    } catch (err) {
      console.error("❌ Failed to delete allocation:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     ADMIN ACTIONS (UPDATE STATUS & MANUAL DONATION)
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

  const handleManualDonation = async (data: any) => {
    try {
      setIsLoading(true);
      await createManualDonation(data);

      await Promise.all([
        refreshDonations(),
        refreshPrograms(),
        refreshTotalDonation()
      ]);
    } catch (err) {
      console.error("❌ Failed to create manual donation:", err);
      throw err;
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
      refreshAllocations(), // <-- Load data alokasi saat awal
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
        allocations, // <-- Provide ke children
        totalDonation,
        isLoading,
        
        refreshPrograms,
        refreshDonations,
        refreshAllocations, // <-- Provide ke children
        refreshTotalDonation,
        
        submitDonation,
        
        // Program
        handleAddProgram,
        handleUpdateProgram,
        handleDeleteProgram,
        
        // Donation
        handleUpdateStatus,
        handleManualDonation,

        // Allocation (BARU)
        handleAddAllocation,
        handleUpdateAllocation,
        handleDeleteAllocation
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