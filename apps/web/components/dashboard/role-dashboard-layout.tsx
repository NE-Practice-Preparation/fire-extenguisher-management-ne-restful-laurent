"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  FireExtinguisher,
  ScrollText,
  UserCircle,
  Users,
} from "lucide-react"

import { DashboardShell } from "@/components/dashboard-shell"
import { Role } from "@/lib/types"

const adminNavItems = [
  { id: "overview", label: "Overview", href: "/dashboard/admin/overview", icon: ClipboardList },
  { id: "users", label: "User Management", href: "/dashboard/admin/users", icon: Users },
  { id: "extinguishers", label: "Fire Extinguishers", href: "/dashboard/admin/extinguishers", icon: FireExtinguisher },
  { id: "inspections", label: "Inspections", href: "/dashboard/admin/inspections", icon: CalendarCheck },
  { id: "reports", label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
  { id: "profile", label: "Profile", href: "/dashboard/admin/profile", icon: UserCircle },
]

const inspectorNavItems = [
  { id: "overview", label: "Overview", href: "/dashboard/inspector/overview", icon: ClipboardList },
  { id: "inspections", label: "My Inspections", href: "/dashboard/inspector/inspections", icon: CalendarCheck },
  { id: "logs", label: "Maintenance Logs", href: "/dashboard/inspector/logs", icon: ScrollText },
  { id: "profile", label: "Profile", href: "/dashboard/inspector/profile", icon: UserCircle },
]

const userNavItems = [
  { id: "overview", label: "Overview", href: "/dashboard/user/overview", icon: ClipboardList },
  { id: "extinguishers", label: "Fire Extinguishers", href: "/dashboard/user/extinguishers", icon: FireExtinguisher },
  { id: "inspections", label: "Inspections", href: "/dashboard/user/inspections", icon: CalendarCheck },
  { id: "profile", label: "Profile", href: "/dashboard/user/profile", icon: UserCircle },
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
