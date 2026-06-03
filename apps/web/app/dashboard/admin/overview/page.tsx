"use client"

import { PageContainer } from "@/components/layout/page-container"
import { SharedDashboardContainer } from "@/components/dashboard/shared-dashboard-container"

export default function Role1OverviewPage() {
  return (
    <PageContainer
      role="admin"
      title="Lorem Ipsum Dashboard"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Overview", href: "/dashboard/admin/overview" },
      ]}
    >
      <SharedDashboardContainer />
    </PageContainer>
  )
}
