// ==========================================
// TIPE DATA LAPORAN KEUANGAN (EXISTING)
// ==========================================

export interface FinancialSummary {
  // Pemasukan
  total_income_donation: number;
  total_income_zakat: number;
  total_income_qurban: number;

  // Pengeluaran
  total_expense_donation: number;
  total_expense_qurban: number;

  // Total Akhir
  total_income: number;
  total_expense: number;
  net_balance: number;
}

export interface CashFlowItem {
  id: string;
  date: string;
  type: 'masuk' | 'keluar';
  category: string;
  description: string;
  amount: number;
  source: string;
}

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  year?: string; // Tambahan untuk filter budget
}
