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
} from "lucide-react"

import { DashboardShell } from "@/components/dashboard-shell"
import { Role } from "@/lib/types"

const role1NavItems = [
  { id: "overview", label: "Overview", href: "/dashboard/role1/overview", icon: ClipboardList },
  { id: "create", label: "Create item", href: "/dashboard/role1/create", icon: PlusCircle },
  { id: "records", label: "Records", href: "/dashboard/role1/records", icon: Database },
  { id: "reports", label: "Users", href: "/dashboard/role1/reports", icon: BarChart3 },
  { id: "profile", label: "Profile", href: "/dashboard/role1/profile", icon: UserCircle },
]

const role2NavItems = [
  { id: "overview", label: "Overview", href: "/dashboard/role2/overview", icon: ClipboardList },
  { id: "entries", label: "Entries", href: "/dashboard/role2/entries", icon: PlusCircle },
  { id: "reviews", label: "Reviews", href: "/dashboard/role2/reviews", icon: Database },
  { id: "profile", label: "Profile", href: "/dashboard/role2/profile", icon: UserCircle },
  { id: "notifications", label: "Notifications", href: "/dashboard/role2/notifications", icon: Bell },
]

const navByRole = {
  ROLE1: role1NavItems,
  ROLE2: role2NavItems,
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
