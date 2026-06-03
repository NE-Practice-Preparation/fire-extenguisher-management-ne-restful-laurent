"use client"

import { PageContainer } from "@/components/layout/page-container"
import { SharedDashboardContainer } from "@/components/dashboard/shared-dashboard-container"

export default function Role1OverviewPage() {
  return (
    <PageContainer
      role="role1"
      title="Lorem Ipsum Dashboard"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Role 1", href: "/dashboard/role1" },
        { label: "Overview", href: "/dashboard/role1/overview" },
      ]}
    >
      <SharedDashboardContainer />
    </PageContainer>
  )
}
