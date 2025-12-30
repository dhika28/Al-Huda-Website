export type ActivityStatus = "terbuka" | "selesai" | "dibatalkan"

export interface Activity {
  id: number
  judul: string
  kategori?: string
  tanggal?: string // ISO string dari backend
  waktu?: string
  lokasi?: string
  pemateri?: string
  tema?: string
  deskripsi?: string
  status: ActivityStatus
  biaya?: string
  kontak?: string
  fasilitas?: string[] // hasil parsing JSON
  created_at: string
  updated_at: string
}

export interface ActivityListResponse {
  data: Activity[]
}
