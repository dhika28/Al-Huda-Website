import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DonationProvider } from "@/contexts/donation-context"
import { ZakatProvider } from "@/contexts/zakat-context"
import { QurbanProvider } from "@/contexts/qurban-context"
import Script from "next/script"; // Pastikan ini diimport

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Masjid Al Huda - Sistem Informasi Masjid",
  description: "Sistem informasi terintegrasi untuk Masjid Al Huda",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* --- TAMBAHAN SCRIPT MIDTRANS DI SINI --- */}
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          // GANTI string di bawah dengan Client Key dari Dashboard Midtrans Anda
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-q9820617xKA6VICW"} 
          strategy="lazyOnload" 
        />
        {/* ---------------------------------------- */}

        <AuthProvider>
          <DonationProvider>
            <ZakatProvider>
              <QurbanProvider>
                {children}
              </QurbanProvider>
            </ZakatProvider>
          </DonationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}