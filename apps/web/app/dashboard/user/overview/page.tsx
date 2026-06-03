"use client"

import { UserDashboardContainer } from "@/components/dashboard/user-dashboard-container"
import { PrimaryDashboardButton } from "@/components/dashboard/primary-dashboard-button"
import { PageContainer } from "@/components/layout/page-container"


export default function Role2OverviewPage() {
  return (
    <PageContainer
      role="user"
      title="Welcome, John"
      description="View & manage active elders and requests"
      action={
        <PrimaryDashboardButton label="New Application" href="/dashboard/user/entries" />
      }
      breadcrumbs={[
        { label: "User", href: "/dashboard/user" },
        { label: "Overview", href: "/dashboard/user/overview" },
      ]}
    >
      <UserDashboardContainer />
    </PageContainer>
  )
}
