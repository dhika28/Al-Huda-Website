"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Heart,
  Calendar,
  FileText,
  LogOut,
  Home, 
  ChevronsUpDown,
  BadgeCheck,
  Bell,
  Beef,
  Ambulance,
  Building2,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// --- NAV ITEMS CONFIGURATION ---
export const NAV_ITEMS = [
  { 
    title: "Data Jamaah", 
    url: "/admin/users", 
    icon: Users 
  },
  { 
    title: "Donasi Masuk", 
    url: "/admin/donations", 
    icon: DollarSign 
  },
  { 
    title: "Data Zakat", 
    url: "/admin/zakat", 
    icon: Heart 
  },
  { 
    title: "Data Qurban", 
    url: "/admin/qurban", 
    icon: Beef 
  },
  { 
    title: "Layanan Ambulance", 
    url: "/admin/ambulance", 
    icon: Ambulance 
  },
  { 
    title: "Manajemen Kegiatan", 
    url: "/admin/events",      
    icon: Calendar 
  },
  { 
    title: "Laporan Keuangan", 
    url: "/admin/financial-reports", 
    icon: FileText 
  },
  { 
    title: "Profil Masjid", 
    url: "/admin/settings", 
    icon: Building2 
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Inisial untuk Avatar
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "AD"

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* --- HEADER SIDEBAR (LOGO MASJID) --- */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-sidebar-primary-foreground">
                  <Home className="size-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Masjid Al-Huda</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* --- CONTENT MENU --- */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                // Jangan render item dashboard di list menu samping jika sudah ada di header logo (opsional)
                // Tapi dibiarkan agar konsisten dengan layout breadcrumb
                const isActive = item.url === "/admin" 
                  ? pathname === "/admin"
                  : pathname === item.url || pathname.startsWith(item.url + "/")
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* --- FOOTER (USER PROFILE & LOGOUT) --- */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar || ""} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || "Admin"}</span>
                    <span className="truncate text-xs">{user?.email || "admin@masjid.com"}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar || ""} alt={user?.name} />
                      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* --- MENU GROUP AKUN --- */}
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    {/* Link ke halaman Profile */}
                    <Link href="/admin/profile" className="cursor-pointer">
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                {/* --- LOGOUT --- */}
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}