import type { Metadata } from "next"

import { RoleDashboardLayout } from "@/components/dashboard/role-dashboard-layout"

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Reusable role 1 dashboard.",
}

export default function Role1DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RoleDashboardLayout role="ADMIN">{children}</RoleDashboardLayout>
}
