import type { Metadata } from "next"

import { RoleDashboardLayout } from "@/components/dashboard/role-dashboard-layout"

export const metadata: Metadata = {
  title: "Role 2 Portal",
  description: "Reusable role 2 dashboard.",
}

export default function Role2DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RoleDashboardLayout role="ROLE2">{children}</RoleDashboardLayout>
}
