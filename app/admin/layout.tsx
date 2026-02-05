"use client"

import type React from "react"
import { useEffect } from "react"
// 1. Tambahkan usePathname
import { useRouter, usePathname } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"
// 2. Import NAV_ITEMS yang sudah di-export dari sidebar
import { AppSidebar, NAV_ITEMS } from "@/app/admin/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // 3. Ambil URL saat ini
  const pathname = usePathname()

  // 4. Logika Judul Dinamis
  // Kita cari item menu yang URL-nya cocok dengan pathname saat ini.
  // array di-sort berdasarkan panjang URL (descending) agar "/admin/users" 
  // dicek lebih dulu daripada "/admin" (root dashboard)
  const activeItem = NAV_ITEMS
    .slice() // copy array agar tidak memutasi original
    .sort((a, b) => b.url.length - a.url.length)
    .find((item) => pathname === item.url || pathname.startsWith(`${item.url}/`))

  const pageTitle = activeItem ? activeItem.title : "Dashboard"

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "admin") {
    return null
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b font-sans">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            
            <Separator orientation="vertical" className="mr-2 h-4" />
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {/* 5. Tampilkan Judul Dinamis */}
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
             {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}