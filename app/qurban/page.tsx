"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- 1. GANTI IMPORT TOAST ---
import { toast, Toaster } from "react-hot-toast";

import { useQurban } from "@/contexts/qurban-context";
import { QurbanPackage, QurbanRegistrationInput } from "@/app/types/qurban";
import { createQurbanRegistration } from "@/lib/api/qurban"; 
import { GiCow, GiGoat } from "react-icons/gi";

// Definisi Window Snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function QurbanPage() {
  const { packages, loading: loadingPackages } = useQurban();
  
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State User ID
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [extraNames, setExtraNames] = useState<string[]>(Array(6).fill(""));

  // FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const userObj = data.user || data; 
          
          if (userObj && userObj.id) {
            console.log("✅ User terdeteksi:", userObj.id);
            setCurrentUserId(userObj.id);
          }
        }
      } catch (err) {
        console.warn("User belum login (Guest Mode)");
      }
    };
    
    fetchUser();
  }, []);

  // Helper Reset Form
  const resetForm = () => {
    setForm({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
    });
    setExtraNames(Array(6).fill(""));
    setSelectedPackage(null);
  };

  const getQurbanIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("sapi")) return <GiCow size={22} />;
    if (lower.includes("kambing")) return <GiGoat size={22} />;
    return null;
  };

  const handleForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pkg: QurbanPackage | undefined = packages.find(
    (p) => p.id === selectedPackage
  );

  const participantTotal = pkg?.participants ?? 1;
  const isSapi = participantTotal === 7;

  // --- 2. LOGIC SUBMIT DENGAN TOAST ---
  const submitForm = async () => {
    // Validasi Paket
    if (!pkg) {
        toast.error("Silakan pilih paket qurban terlebih dahulu");
        return;
    }

    // Validasi Data Diri
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
        toast.error("Mohon lengkapi data diri (Nama, Email, No. HP)");
        return;
    }

    if (!form.address.trim()) {
        toast.error("Mohon lengkapi alamat pengirim");
        return;
    }

    // Cek Snap
    if (typeof window.snap === "undefined") {
        toast.error("Sistem pembayaran belum siap. Silakan refresh halaman.");
        return;
    }

    const payload: QurbanRegistrationInput = {
        user_id: currentUserId || 0, // 0 jika guest
        package_id: pkg.id,
        name: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        notes: form.notes,
        participant_count: participantTotal,
        extra_names: isSapi ? extraNames.filter(Boolean) : [], // Filter nama kosong
    };

    setLoading(true);
    const loadingToast = toast.loading("Memproses pendaftaran qurban...");

    try {
        const res = await createQurbanRegistration(payload);

        if (!res?.token) {
            throw new Error("Gagal mendapatkan token pembayaran.");
        }

        toast.dismiss(loadingToast);

        // Buka Snap
        window.snap.pay(res.token, {
            onSuccess: function(result: any) {
                resetForm(); 
                window.location.assign(`/payment/status?order_id=${result.order_id}&transaction_status=${result.transaction_status}&status_code=${result.status_code}`);
            },
            onPending: function(result: any) {
                resetForm(); 
                window.location.assign(`/payment/status?order_id=${result.order_id}&transaction_status=${result.transaction_status}&status_code=${result.status_code}`);
            },
            onError: function(result: any) {
                window.location.assign(`/payment/status?order_id=${result.order_id}&transaction_status=error&status_code=${result.status_code}`);
            },
            onClose: function() {
                toast.error("Pembayaran dibatalkan/belum selesai");
            }
        });

    } catch (err: any) {
        console.error("❌ Error submit:", err);
        toast.dismiss(loadingToast);
        toast.error(err.message || "Terjadi kesalahan server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* --- 3. TOASTER COMPONENT --- */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur border-b shadow-sm sticky top-0 z-20 w-full">
        <div className="px-4 py-4 w-full">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-emerald-100 hover:text-emerald-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pendaftaran Qurban
              </h1>
              <p className="text-gray-600 text-sm">
                Qurban Idul Adha 1445 H – Masjid Al-Huda Tabanan
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="packages" className="w-full space-y-8 px-0">
          <TabsList className="w-full grid grid-cols-2 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="packages">Pilih Paket</TabsTrigger>
            <TabsTrigger value="form">Form Pendaftaran</TabsTrigger>
          </TabsList>

          {/* TAB PAKET */}
          <TabsContent value="packages">
            {loadingPackages ? (
              <p className="text-center py-10 text-gray-600">Memuat paket...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-3">
                {packages.map((item) => (
                  <Card
                    key={item.id}
                    className={`min-h-[250px] flex flex-col cursor-pointer transition-all rounded-xl shadow-sm hover:shadow-lg border-2 ${
                      selectedPackage === item.id
                        ? "border-emerald-600 ring-2 ring-emerald-400"
                        : "border-gray-200"
                    }`}
                    onClick={() => {
                      setSelectedPackage(item.id);
                      setExtraNames(Array(6).fill(""));
                      toast.success(`Paket ${item.name} dipilih! Silakan isi form.`, { duration: 2000 });
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-semibold">
                            {item.name}
                          </CardTitle>
                          <CardDescription className="mt-1 text-gray-600">
                            {item.description}
                          </CardDescription>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-600 text-white">
                          {getQurbanIcon(item.name)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 flex flex-col justify-between flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-emerald-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(item.price)}
                        </span>
                        <Badge variant="outline" className="px-3 py-1">
                          {item.participants === 1
                            ? "1 peserta"
                            : `${item.participants} peserta`}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Berat:</strong> {item.weight}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB FORM */}
          <TabsContent value="form" className="w-full px-2 md:px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* FORM */}
              <div className="md:col-span-2">
                <Card className="shadow-lg rounded-xl w-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Form Pendaftaran Qurban
                    </CardTitle>
                    <CardDescription>
                      Isi data berikut untuk melakukan pendaftaran qurban.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Nama - Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
                        <Input
                          autoComplete="off" 
                          value={form.fullName}
                          onChange={(e) => handleForm("fullName", e.target.value)}
                          placeholder="Nama Shohibul Qurban"
                        />
                      </div>
                      <div>
                        <Label>Email <span className="text-red-500">*</span></Label>
                        <Input
                          autoComplete="off"
                          value={form.email}
                          onChange={(e) => handleForm("email", e.target.value)}
                          placeholder="email@contoh.com"
                        />
                      </div>
                    </div>

                    {/* No HP - Jumlah peserta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>No. Telepon <span className="text-red-500">*</span></Label>
                        <Input
                          autoComplete="off"
                          value={form.phone}
                          onChange={(e) => handleForm("phone", e.target.value)}
                          placeholder="08..."
                        />
                      </div>

                      <div>
                        <Label>Jumlah Peserta</Label>
                        <Input disabled value={participantTotal} />
                      </div>
                    </div>

                    {/* Paket */}
                    <div>
                      <Label>Paket Qurban <span className="text-red-500">*</span></Label>
                      <select
                        className="border rounded-md p-2 w-full bg-white"
                        value={selectedPackage ?? ""}
                        onChange={(e) => setSelectedPackage(Number(e.target.value))}
                      >
                        <option value="">Pilih paket</option>
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} - {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits:0 }).format(pkg.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Alamat */}
                    <div>
                      <Label>Alamat Lengkap <span className="text-red-500">*</span></Label>
                      <Textarea
                        autoComplete="off"
                        value={form.address}
                        onChange={(e) => handleForm("address", e.target.value)}
                        rows={3}
                        placeholder="Alamat domisili..."
                      />
                    </div>

                    {/* Catatan */}
                    <div>
                      <Label>Catatan (Opsional)</Label>
                      <Textarea
                        value={form.notes}
                        onChange={(e) => handleForm("notes", e.target.value)}
                        rows={2}
                        placeholder="Permintaan khusus pembagian daging, dll."
                      />
                    </div>

                    {/* Nama peserta tambahan */}
                    {isSapi && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <Label className="mb-2 block font-semibold text-slate-700">Nama Peserta Tambahan (Patungan)</Label>
                        <p className="text-xs text-slate-500 mb-3">Masukkan nama 6 orang lainnya yang ikut dalam qurban sapi ini.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {extraNames.map((name, idx) => (
                            <Input
                              key={idx}
                              placeholder={`Peserta ${idx + 2}`}
                              value={name}
                              onChange={(e) =>
                                setExtraNames((prev) => {
                                  const arr = [...prev];
                                  arr[idx] = e.target.value;
                                  return arr;
                                })
                              }
                              className="bg-white"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <Button
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg shadow-green-100 mt-4"
                      onClick={submitForm}
                      disabled={loading}
                    >
                      {loading ? "Memproses..." : "Daftar Qurban Sekarang"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* SIDEBAR */}
              <aside className="md:col-span-1 space-y-4 h-fit">
                <Card className="rounded-xl shadow-md border">
                  <CardHeader>
                    <CardTitle>Apa itu Qurban?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    Qurban adalah ibadah menyembelih hewan ternak pada Hari Raya Idul
                    Adha dan hari Tasyrik.  
                    <ul className="list-disc ml-5 mt-2">
                      <li>Kambing: 1 orang</li>
                      <li>Sapi: maksimal 7 orang</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-md border">
                  <CardHeader>
                    <CardTitle>Siapa yang Disunnahkan?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    <ul className="list-disc ml-5">
                      <li>Muslim yang mampu</li>
                      <li>Kepala keluarga</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-md border">
                  <CardHeader>
                    <CardTitle>Kapan Disembelih?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    <ul className="list-disc ml-5">
                      <li>10 Dzulhijjah setelah salat Id</li>
                      <li>11–13 Dzulhijjah (Hari Tasyrik)</li>
                    </ul>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}