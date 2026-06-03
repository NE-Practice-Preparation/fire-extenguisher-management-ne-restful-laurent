"use client"

import { UserDashboardContainer } from "@/components/dashboard/user-dashboard-container"
import { PrimaryDashboardButton } from "@/components/dashboard/primary-dashboard-button"
import { PageContainer } from "@/components/layout/page-container"


export default function Role2OverviewPage() {
  return (
    <PageContainer
      role="role2"
      title="Welcome, John"
      description="View & manage active elders and requests"
      action={
        <PrimaryDashboardButton label="New Application" href="/dashboard/role2/entries" />
      }
      breadcrumbs={[
        { label: "Role 2", href: "/dashboard/role2" },
        { label: "Overview", href: "/dashboard/role2/overview" },
      ]}
    >
      <UserDashboardContainer />
    </PageContainer>
  )
}
