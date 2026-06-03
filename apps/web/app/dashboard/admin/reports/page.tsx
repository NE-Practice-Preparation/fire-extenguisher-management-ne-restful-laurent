"use client"

import { ReportsDashboard } from "@/components/admin/reports-dashboard"
import { PageContainer } from "@/components/layout/page-container"

export default function AdminReportsPage() {
  return (
    <PageContainer
      role="admin"
      title="Reports"
      description="Realtime stock, inspection, expiry, and maintenance reports."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Reports", href: "/dashboard/admin/reports" },
      ]}
    >
      <ReportsDashboard />
    </PageContainer>
  )
}
