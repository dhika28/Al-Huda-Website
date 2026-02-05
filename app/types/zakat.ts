export interface CreateZakatPaymentPayload {
  user_id?: number | null // <-- TAMBAHAN: Opsional (bisa number atau undefined)
  name: string
  email: string
  phone: string
  address: string
  zakat_type: string
  total_people: number
  amount: number
  extra_names: string[]
  message: string
}

export interface ZakatPayload extends CreateZakatPaymentPayload {
  id: number
  user_id: number | null // Di sini override jadi nullable
  created_at: string
}

export interface ZakatPayment {
  id: number;
  user_id: number;
  name: string;
  extra_names: string[];
  zakat_type: string;
  total_people: number;
  amount: number;
  phone: string;
  email: string;
  message: string | null;
  created_at: string;
  status?: string; // Tambahkan status juga biar lengkap (pending/success)
}