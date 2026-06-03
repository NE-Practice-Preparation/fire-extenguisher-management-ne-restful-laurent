"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Bell,
  CalendarCheck,
  ClipboardList,
  Database,
  FileSpreadsheet,
  House,
  PlusCircle,
  UserCircle,
  Users,
} from "lucide-react"

import { DashboardShell } from "@/components/dashboard-shell"
import { Role } from "@/lib/types"

const adminNavItems = [
  { id: "overview", label: "Overview", href: "/dashboard/admin/overview", icon: ClipboardList },
  { id: "users", label: "User Management", href: "/dashboard/admin/users", icon: Users },
  { id: "profile", label: "Profile", href: "/dashboard/admin/profile", icon: UserCircle },
]

const inspectorNavItems = [
  { id: "overview", label: "Overview", href: "/dashboard/inspector/overview", icon: ClipboardList },
  { id: "profile", label: "Profile", href: "/dashboard/inspector/profile", icon: UserCircle },
]

const userNavItems = [
  { id: "overview", label: "Overview", href: "/dashboard/user/overview", icon: ClipboardList },
  { id: "entries", label: "Entries", href: "/dashboard/user/entries", icon: PlusCircle },
  { id: "reviews", label: "Reviews", href: "/dashboard/user/reviews", icon: Database },
  { id: "profile", label: "Profile", href: "/dashboard/user/profile", icon: UserCircle },
  { id: "notifications", label: "Notifications", href: "/dashboard/user/notifications", icon: Bell },
]

const navByRole = {
  ADMIN: adminNavItems,
  INSPECTOR: inspectorNavItems,
  USER: userNavItems,
}

export function RoleDashboardLayout({
  role,
  children,
}: {
  role: Role
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const navItems = navByRole[role]
  const active =
    navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.id ??
    "overview"

  return (
    <DashboardShell
      role={role}
      navItems={navItems}
      active={active}
      onActiveChange={(id) => {
        const item = navItems.find((navItem) => navItem.id === id)

        if (item?.href) {
          router.push(item.href)
        }
      }}
    >
      {children}
    </DashboardShell>
  )
}
