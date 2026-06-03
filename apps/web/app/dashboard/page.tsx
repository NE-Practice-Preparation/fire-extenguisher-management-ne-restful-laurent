import type { Metadata } from "next"

import { DashboardRedirect } from "@/components/dashboard-redirect"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Opening the correct Restful Template dashboard for your role.",
}

export default function DashboardPage() {
  return <DashboardRedirect />
}
