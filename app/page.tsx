"use client"

import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Menu,
  Phone,
  Users,
  Truck,
  Calculator,
  FileText,
  ChurchIcon as Mosque,
  HandHeart,
  ChevronRight,
  Star,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { getTodayDate } from './utils/date';
import CountUp from '@/components/countup'
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getTotalDonations } from "@/lib/api/donation";
import { GiCow } from "react-icons/gi";



export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const [prayerTimes, setPrayerTimes] = useState<{ name: string; time: string }[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [totalDonasi, setTotalDonasi] = useState<number>(0);


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const res = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=20`
      );
      const data = await res.json();

      const times = data.data.timings;
      const formatted = [
        { name: 'Subuh', time: times.Fajr },
        { name: 'Dzuhur', time: times.Dhuhr },
        { name: 'Ashar', time: times.Asr },
        { name: 'Maghrib', time: times.Maghrib },
        { name: 'Isya', time: times.Isha },
      ];
      setPrayerTimes(formatted);
    });
  }, []);

  const images = [
    "/bg-alhuda.jpeg",
    "/bg-alhuda2.jpeg",
    "/bg-alhuda3.jpeg",
    "/bg-alhuda4.jpeg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    async function fetchTotal() {
      try {
        const data = await getTotalDonations();
        // Asumsikan API mengembalikan { total: number }
        setTotalDonasi(data.total ?? 0);
      } catch (error) {
        console.error("❌ Gagal fetch total donasi:", error);
      }
    }
    fetchTotal();
  }, []);

  const mainFeatures = [
    {
      icon: <HandHeart className="h-12 w-12" />,
      title: "Donasi & Infaq",
      description: "Salurkan donasi dan infaq Anda dengan mudah dan transparan",
      color: "bg-emerald-500",
      href: "/donasi",
    },
    {
      icon: <Calculator className="h-12 w-12" />,
      title: "Pembayaran Zakat",
      description: "Hitung dan bayar zakat fitrah, mal, dan profesi secara online",
      color: "bg-blue-500",
      href: "/zakat",
    },
    {
      icon: <GiCow className="h-12 w-12" />,
      title: "Pendaftaran Qurban",
      description: "Daftar qurban untuk Idul Adha dengan pilihan hewan terbaik",
      color: "bg-orange-500",
      href: "/qurban",
    },
    {
      icon: <Truck className="h-12 w-12" />,
      title: "Peminjaman Ambulan",
      description: "Layanan ambulan gratis 24/7 untuk jamaah dan masyarakat",
      color: "bg-red-500",
      href: "/ambulan",
    },
  ]

  const quickStats = [
    { label: "Total Donasi Bulan Ini", value: totalDonasi.toString(), icon: <DollarSign className="h-6 w-6" /> },
    { label: "Jamaah Terdaftar", value: "250", icon: <Users className="h-6 w-6" /> },
    { label: "Program Aktif", value: "12", icon: <Calendar className="h-6 w-6" /> },
    { label: "Layanan Ambulan", value: "69", icon: <Truck className="h-6 w-6" /> },
  ]

  // const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    setTimeout(async () => {
      await logout()
      setLoggingOut(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm font-sans">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg">
              <img
                src="/logo-alhuda.png"
                alt="Logo Masjid"
                className="h-11 w-11 object-contain"
              />
            </div>
            <div className="font-sans">
              <span className="text-xl font-bold text-emerald-800">Masjid Al Huda</span>
              <p className="text-xs text-gray-600">Sistem Informasi Masjid</p>
            </div>
          </Link>
          <AnimatePresence>
          {loggingOut && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-emerald-700 text-2xl font-semibold"
            >
              <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
              Sedang keluar…
            </motion.div>
          </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              Beranda
            </Link>
            <Link href="/profil-masjid" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Profil Masjid
            </Link>
            <Link href="/jadwal-sholat" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Jadwal Sholat
            </Link>
            <Link href="/kegiatan" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Kegiatan
            </Link>
            <Link href="/laporan-keuangan" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Laporan Keuangan
            </Link>
            <Link href="/kontak" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Kontak
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    {user?.name ?? "Profil"}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                >
                  Keluar
                </Button>
              </div>
            
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg">
                  <Users className="mr-2 h-4 w-4" />
                  Masuk
                </Button>
              </Link>
            )}
            {!user && (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg">
                <HandHeart className="mr-2 h-4 w-4" />
                Donasi Sekarang
              </Button>
            </Link>
          )}
          </nav>
          

          {/* Mobile Navigation */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                <Link href="/" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Beranda
                </Link>
                <Link href="/profil-masjid" className="text-lg" onClick={() => setIsMenuOpen(false)}>
                  Profil Masjid
                </Link>
                <Link href="/jadwal-sholat" className="text-lg" onClick={() => setIsMenuOpen(false)}>
                  Jadwal Sholat
                </Link>
                <Link href="/kegiatan" className="text-lg" onClick={() => setIsMenuOpen(false)}>
                  Kegiatan
                </Link>
                <Link href="/laporan-keuangan" className="text-lg" onClick={() => setIsMenuOpen(false)}>
                  Laporan Keuangan
                </Link>
                <Link href="/kontak" className="text-lg" onClick={() => setIsMenuOpen(false)}>
                  Kontak
                </Link>

                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Link href="/admin" className="text-lg text-red-600" onClick={() => setIsMenuOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/profile" className="text-lg" onClick={() => setIsMenuOpen(false)}>
                      Profil ({user.name})
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                    >
                      Keluar
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Masuk
                    </Button>
                  </Link>
                )}
                {!user && (
                  <Link href="/donasi">
                    <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg">
                      <HandHeart className="mr-2 h-4 w-4" />
                      Donasi Sekarang
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url('${images[currentIndex]}')`,
        }}
        >
        <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mt-[125px] font-sans">
              <h1 className="text-[80px] md:text-[100px] font-semibold text-white mb-6 max-w-4xl mx-auto text-center leading-tight">
                Masjid Al-Huda Tabanan
              </h1>
              <p className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
                Pusat ibadah dan pelayanan umat berbasis sistem informasi terintegrasi untuk pengelolaan donasi, zakat, qurban,
                dan layanan masjid secara efektif dan transparan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#layanan-utama">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-sans"
              >
                Jelajahi Layanan
              </Button>
              </Link>
              <Link href="#jadwalsholat">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg font-sans"
              >
                <Clock className="mr-2 h-5 w-5" />
                Lihat Jadwal Sholat
              </Button>
              </Link>
              
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white/80 backdrop-blur font-sans">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-emerald-600 mb-3 flex justify-center">{stat.icon}</div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    <CountUp
                    from={0}
                    to={Number(stat.value)}
                    separator=","
                    direction="up"
                    duration={1.5}
                    className="count-up-text"
                  />
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Main Features - Prominent Section */}
      <section id="layanan-utama" className="py-20 bg-white font-sans">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Layanan Masjid Al Huda</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nikmati kemudahan layanan digital yang membantu Anda dalam beribadah dan berinfaq
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 overflow-hidden"
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div
                      className={`${feature.color} p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                      <Link href={feature.href}>
                        <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg">
                          Akses Sekarang
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section id="jadwalsholat" className="pb-40 pt-40 bg-white font-sans">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Jadwal Sholat Hari Ini</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tetap terhubung dengan waktu sholat. Jadwal diperbarui secara otomatis sesuai lokasi masjid.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="w-full max-w-none md:max-w-4xl lg:max-w-6xl mx-auto border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                <CardTitle className="text-center text-white font-4xl">
                  {getTodayDate()}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {prayerTimes.map((prayer, index) => (
                    <div
                      key={index}
                      className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <h3 className="font-bold mb-2 text-gray-900">{prayer.name}</h3>
                      <p className="text-3xl font-bold mb-2 text-emerald-600">{prayer.time}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link href="/jadwal-sholat">
                    <Button
                      variant="outline"
                      className="bg-white text-emerald-600 border border-emerald-600 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-700 hover:text-white hover:border-white shadow-lg"
                    >
                      Lihat Jadwal Lengkap
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black relative overflow-hidden bg-[url('/bg-alhuda2.jpeg')] 
          bg-cover bg-center font-sans">
        {/* Overlay gelap supaya teks kontras */}
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Mari Bersama Membangun Masjid</h2>
            <p className="text-xl text-white mb-8 leading-relaxed">
              Donasi Anda sangat berarti untuk kemajuan masjid dan kesejahteraan umat. Setiap rupiah yang Anda berikan
              akan dikelola dengan amanah dan transparan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donasi">
                <Button size="lg" className="bg-white text-emerald-600 border border-transparent hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-700 hover:text-white shadow-lg">
                  <HandHeart className="mr-2 h-5 w-5" />
                  Donasi Sekarang
                </Button>
              </Link>
              <Link href="/laporan-keuangan">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-white hover:to-white hover:text-emerald-600 shadow-lg font-sans">
                  <FileText className="mr-2 h-5 w-5" />
                  Lihat Laporan Keuangan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 font-sans">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                <img
                  src="/logo-alhuda.png"
                  alt="Logo Masjid"
                  className="h-12 w-12 object-contain"
                />
                </div>
                <div>
                  <span className="text-xl font-bold">Masjid Al Huda</span>
                  <p className="text-sm text-gray-400">Sistem Informasi Masjid</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Membangun umat yang kuat melalui iman, ilmu, dan pelayanan yang amanah.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-emerald-400">Layanan Utama</h3>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link href="/donasi" className="hover:text-emerald-400 transition-colors">
                    Donasi & Infaq
                  </Link>
                </li>
                <li>
                  <Link href="/zakat" className="hover:text-emerald-400 transition-colors">
                    Pembayaran Zakat
                  </Link>
                </li>
                <li>
                  <Link href="/qurban" className="hover:text-emerald-400 transition-colors">
                    Pendaftaran Qurban
                  </Link>
                </li>
                <li>
                  <Link href="/ambulan" className="hover:text-emerald-400 transition-colors">
                    Peminjaman Ambulan
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-emerald-400">Informasi</h3>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link href="/profil-masjid" className="hover:text-emerald-400 transition-colors">
                    Profil Masjid
                  </Link>
                </li>
                <li>
                  <Link href="/jadwal-sholat" className="hover:text-emerald-400 transition-colors">
                    Jadwal Sholat
                  </Link>
                </li>
                <li>
                  <Link href="/kegiatan" className="hover:text-emerald-400 transition-colors">
                    Kegiatan Masjid
                  </Link>
                </li>
                <li>
                  <Link href="/laporan-keuangan" className="hover:text-emerald-400 transition-colors">
                    Laporan Keuangan
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-emerald-400 transition-colors">
                    Hubungi Kami
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-emerald-400">Kontak</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>Jl. Masjid Raya No. 123, Jakarta</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>(021) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>Buka 24 Jam</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Masjid Al Huda. Semua hak dilindungi undang-undang.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
