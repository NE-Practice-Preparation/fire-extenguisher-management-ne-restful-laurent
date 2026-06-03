"use client"

import { PageContainer } from "@/components/layout/page-container"
import { SystemOverviewDashboard } from "@/components/dashboard/system-overview-dashboard"

export default function InspectorOverviewPage() {
  return (
    <PageContainer
      role="inspector"
      title="Inspector Dashboard"
      description="Your assigned inspections and maintenance tasks."
      breadcrumbs={[
        { label: "Inspector", href: "/dashboard/inspector" },
        { label: "Overview", href: "/dashboard/inspector/overview" },
      ]}
    >
      <SystemOverviewDashboard role="INSPECTOR" />
    </PageContainer>
  )
}
