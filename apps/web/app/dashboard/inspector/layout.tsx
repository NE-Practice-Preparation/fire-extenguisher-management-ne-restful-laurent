import type { Metadata } from "next"

import { RoleDashboardLayout } from "@/components/dashboard/role-dashboard-layout"

export const metadata: Metadata = {
  title: "Inspector Portal",
  description: "Inspector dashboard for the Fire Extinguisher Management System.",
}

export default function InspectorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RoleDashboardLayout role="INSPECTOR">{children}</RoleDashboardLayout>
}
