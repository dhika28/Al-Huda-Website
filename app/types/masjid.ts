// app/types/mosque.ts

export interface StatItem {
  value: string;
  label: string;
}

export interface SejarahItem {
  tahun: string;
  peristiwa: string;
  detail: string;
}

export interface FasilitasItem {
  nama: string;
  kapasitas: string;
  deskripsi: string;
  icon?: string;
  // Icon mapping dilakukan di frontend, tidak disimpan di DB
}

export interface ProgramItem {
  nama: string;
  jadwal: string;
  peserta: string;
  icon?: string; // Opsional
}

export interface ProgramKategori {
  kategori: string;
  programs: ProgramItem[];
}

export interface StrukturItem {
  jabatan: string;
  nama: string;
  pendidikan: string;
  pengalaman: string;
  icon?: string;
}

// Tipe Utama Profile Masjid
export interface MosqueProfile {
  id: number;
  nama_masjid: string;
  tagline: string;
  deskripsi_hero: string;
  bg_image_url: string;

  visi: string;
  misi: string[]; // Array of string

  // Data JSON (Backend mengirim JSON, Frontend terima Array Object)
  stats: StatItem[];
  sejarah: SejarahItem[];
  fasilitas: FasilitasItem[];
  program: ProgramKategori[];
  struktur: StrukturItem[];

  alamat: string;
  telepon: string;
  email: string;
  google_maps_url: string;

  updated_at?: string;
}