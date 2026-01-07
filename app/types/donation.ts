// app/types/donation.ts

export interface Program {
  id?: number; // Optional saat create, tapi ada saat fetch
  title: string;
  description: string;
  target: number;
  collected: number;
  donors: number;
  created_at?: string;
}

export interface Donation {
  id?: number;
  user_id?: number; 
  name: string;
  phone: string;
  email: string;
  amount: number;
  message: string;
  payment_method: string;
  
  program_id?: number | null;
  program_name?: string; // Tambahan: Nama program (berguna untuk tabel history user)
  
  donation_type?: string; // 'program' | 'quick' | 'umum'
  
  // Field Baru (Sinkronisasi dengan Backend & Midtrans)
  status?: string;       // 'pending' | 'success' | 'failed' | 'challenge'
  order_id?: string;     // ID Unik Transaksi (ex: DONASI-170xxxx)
  
  created_at?: string;
}