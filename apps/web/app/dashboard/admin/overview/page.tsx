"use client"

import { PageContainer } from "@/components/layout/page-container"
import { SystemOverviewDashboard } from "@/components/dashboard/system-overview-dashboard"

export default function Role1OverviewPage() {
  return (
    <PageContainer
      role="admin"
      title="Admin Overview"
      description="Realtime extinguisher stock, inspections, expiry, and maintenance activity."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Overview", href: "/dashboard/admin/overview" },
      ]}
    >
      <SystemOverviewDashboard role="ADMIN" />
    </PageContainer>
  )
}
