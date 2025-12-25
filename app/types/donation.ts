export interface Program {
  id: number;
  title: string;
  description: string;
  target: number;
  collected: number;
  donors: number;
  created_at: string;
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
  donation_type?: string;
  created_at?: string;
}
