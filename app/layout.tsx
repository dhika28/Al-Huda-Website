import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DonationProvider } from "@/contexts/donation-context"
import { ZakatProvider } from "@/contexts/zakat-context"
import { QurbanProvider } from "@/contexts/qurban-context"


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
