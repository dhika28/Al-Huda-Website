"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"
import { AppSidebar } from "@/app/admin/components/app-sidebar" // Import komponen yang baru dibuat
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
  const { user, isLoading } = useAuth() // Asumsi ada state isLoading
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "admin") {
    return null // Atau return <LoadingSpinner />
  }

  return (
    <SidebarProvider defaultOpen={false}>
      {/* 1. SIDEBAR COMPONENT */}
      <AppSidebar />

      {/* 2. MAIN CONTENT AREA (INSET) */}
      <SidebarInset>
        {/* Header Sticky dengan Trigger Sidebar & Breadcrumbs */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b">
          <div className="flex items-center gap-2 px-4">
            {/* Tombol Toggle Sidebar */}
            <SidebarTrigger className="-ml-1" />
            
            <Separator orientation="vertical" className="mr-2 h-4" />
            
            {/* Breadcrumb (Opsional, untuk navigasi cantik) */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Admin Panel</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex flex-1 flex-col gap-4 pt-0">
          {/* Container utama konten */}
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
             {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}