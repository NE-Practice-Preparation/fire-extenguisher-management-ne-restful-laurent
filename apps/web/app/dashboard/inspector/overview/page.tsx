"use client"

import { PageContainer } from "@/components/layout/page-container"
import { SharedDashboardContainer } from "@/components/dashboard/shared-dashboard-container"

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
      <SharedDashboardContainer />
    </PageContainer>
  )
}
