import type { Metadata } from "next"

import { RoleDashboardLayout } from "@/components/dashboard/role-dashboard-layout"

export const metadata: Metadata = {
  title: "User Portal",
  description: "Reusable role 2 dashboard.",
}

export default function Role2DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RoleDashboardLayout role="USER">{children}</RoleDashboardLayout>
}
