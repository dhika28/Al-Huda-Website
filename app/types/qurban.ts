export interface QurbanPackage {
  id: number;
  name: string;
  price: number;
  weight: string;
  participants: number;
  description: string;
  features: string[];
}

export interface QurbanRegistrationInput {
  user_id: number;
  package_id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  participant_count: number;
  notes?: string;
  extra_names?: string[];
}

export interface QurbanRegistrationResponse {
  message: string;
  registration_id: number;
  midtrans_token?: string;
  redirect_url?: string;
}
