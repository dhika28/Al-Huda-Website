"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Home, 
  FileText,
  Loader2,
  Download 
} from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-600"/></div>}>
      <StatusContent />
    </Suspense>
  )
}

function StatusContent() {
  const searchParams = useSearchParams()
  
  // Ambil data dari URL
  const order_id = searchParams.get("order_id")
  const url_status = searchParams.get("transaction_status") // Bisa null jika redirect tidak sempurna

  const [isDownloading, setIsDownloading] = useState(false)
  const [loadingCheck, setLoadingCheck] = useState(false) // State loading saat cek ke server
  
  // State Status Final (Prioritas: URL -> Server Check -> Error)
  const [finalStatus, setFinalStatus] = useState<string | null>(url_status)

  const [uiState, setUiState] = useState({
    title: "Memuat Status...",
    desc: "Sedang memverifikasi pembayaran Anda.",
    icon: <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />,
    color: "bg-gray-50",
    textColor: "text-gray-800",
    borderColor: "border-gray-200"
  })

  // =====================================================================
  // 1. LOGIKA CEK STATUS KE SERVER (JIKA URL KOSONG)
  // =====================================================================
  useEffect(() => {
    const checkStatusFromServer = async () => {
      if (!order_id) return;
      
      // Jika status sudah ada dari URL, tidak perlu cek server
      if (url_status) {
          setFinalStatus(url_status);
          return;
      }

      setLoadingCheck(true);
      try {
        // Panggil endpoint check yang baru Anda buat di backend
        const res = await fetch(`http://localhost:8080/api/v1/payment/check/${order_id}`);
        
        if (res.ok) {
            const data = await res.json();
            // Mapping status DB ke istilah Midtrans agar UI konsisten
            if (data.status === 'paid' || data.status === 'success') {
                setFinalStatus('settlement');
            } else if (data.status === 'pending') {
                setFinalStatus('pending');
            } else if (data.status === 'expired' || data.status === 'canceled') {
                setFinalStatus('expire');
            } else {
                setFinalStatus('deny');
            }
        } else {
            // Jika backend jawab 404 atau error
            setFinalStatus('not_found'); 
        }
      } catch (e) {
        console.error("Gagal cek status:", e);
        setFinalStatus('error_conn');
      } finally {
        setLoadingCheck(false);
      }
    };

    checkStatusFromServer();
  }, [order_id, url_status]);

  // =====================================================================
  // 2. UPDATE TAMPILAN UI BERDASARKAN FINAL STATUS
  // =====================================================================
  useEffect(() => {
    // Jangan update UI jika sedang loading cek server (kecuali status URL ada)
    if (loadingCheck && !url_status) return;

    if (!order_id) {
      setUiState({
        title: "Halaman Tidak Valid",
        desc: "Tidak ada data transaksi yang ditemukan.",
        icon: <XCircle className="h-16 w-16 text-red-500" />,
        color: "bg-red-50",
        textColor: "text-red-800",
        borderColor: "border-red-200"
      })
      return
    }
    
    if (finalStatus === 'capture' || finalStatus === 'settlement' || finalStatus === 'success') {
      setUiState({
        title: "Pembayaran Berhasil!",
        desc: "Alhamdulillah, terima kasih atas pembayaran Anda. Transaksi telah kami terima.",
        icon: <CheckCircle2 className="h-20 w-20 text-emerald-500" />,
        color: "bg-emerald-50",
        textColor: "text-emerald-800",
        borderColor: "border-emerald-200"
      })
    } else if (finalStatus === 'pending') {
      setUiState({
        title: "Menunggu Pembayaran",
        desc: "Silakan selesaikan pembayaran Anda. Jika sudah membayar, mohon tunggu sebentar lalu refresh halaman ini.",
        icon: <Clock className="h-20 w-20 text-orange-500" />,
        color: "bg-orange-50",
        textColor: "text-orange-800",
        borderColor: "border-orange-200"
      })
    } else if (finalStatus === 'not_found') {
        setUiState({
            title: "Data Tidak Ditemukan",
            desc: "Kami tidak dapat menemukan data transaksi dengan Order ID tersebut.",
            icon: <XCircle className="h-20 w-20 text-gray-400" />,
            color: "bg-gray-100",
            textColor: "text-gray-800",
            borderColor: "border-gray-300"
        })
    } else {
      // Gagal / Expire / Deny / Error Conn
      setUiState({
        title: "Pembayaran Gagal",
        desc: "Maaf, transaksi Anda gagal, belum dibayar, atau telah kadaluarsa.",
        icon: <XCircle className="h-20 w-20 text-red-500" />,
        color: "bg-red-50",
        textColor: "text-red-800",
        borderColor: "border-red-200"
      })
    }
  }, [finalStatus, order_id, loadingCheck, url_status])

  // --- Helper Label ---
  const getPaymentTypeLabel = (oid: string | null) => {
    if (!oid) return "Kwitansi";
    if (oid.startsWith("DON")) return "Kwitansi Donasi";
    if (oid.startsWith("ZAK")) return "Kwitansi Zakat";
    if (oid.startsWith("QUR")) return "Kwitansi Qurban";
    return "Kwitansi Pembayaran";
  }

  // --- Handler Download ---
  const handleDownloadReceipt = async () => {
    if (!order_id) {
        toast.error("Order ID tidak ditemukan");
        return;
    }
    
    setIsDownloading(true);
    const toastId = toast.loading("Sedang mengunduh kwitansi...");

    try {
      const API_URL = `http://localhost:8080/api/v1/export/receipt/${order_id}`;
      const response = await fetch(API_URL, { method: "GET" });

      if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || "Gagal mengambil file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kwitansi-${order_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Kwitansi berhasil diunduh!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal: " + error.message, { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <Toaster position="top-center" />
      <Card className={`w-full max-w-md shadow-xl border-t-8 ${uiState.borderColor}`}>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6 mt-4">
            <div className={`p-4 rounded-full ${uiState.color} shadow-inner`}>
                {loadingCheck ? <Loader2 className="h-16 w-16 text-gray-400 animate-spin" /> : uiState.icon}
            </div>
          </div>
          <CardTitle className={`text-2xl font-bold ${uiState.textColor}`}>
            {loadingCheck ? "Mengecek Status..." : uiState.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-slate-600 leading-relaxed">
             {loadingCheck ? "Mohon tunggu, sedang menghubungi server..." : uiState.desc}
          </p>

          {order_id && (
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
              <p className="font-mono font-medium text-slate-700 select-all break-all">{order_id}</p>
            </div>
          )}
          <Separator />
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8">
          {/* Tampilkan Tombol sesuai Status Akhir */}
          {(finalStatus === 'settlement' || finalStatus === 'capture' || finalStatus === 'success') ? (
             <>
                <Button onClick={handleDownloadReceipt} disabled={isDownloading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base shadow transition-all">
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isDownloading ? "Mengunduh..." : getPaymentTypeLabel(order_id)}
                </Button>
                
                <Link href="/profile" className="w-full">
                    <Button variant="outline" className="w-full h-12 text-slate-600 border-slate-300 hover:bg-slate-50">
                        <FileText className="mr-2 h-4 w-4" /> Lihat Riwayat
                    </Button>
                </Link>
             </>
          ) : (
             <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" onClick={() => window.location.reload()}>
                 <Clock className="mr-2 h-4 w-4" /> Cek Status Terbaru (Refresh)
             </Button>
          )}
          
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-100">
              <Home className="mr-2 h-4 w-4" /> Kembali ke Beranda
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}