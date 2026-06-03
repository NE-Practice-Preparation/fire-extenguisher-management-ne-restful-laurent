"use client"

import { UserDashboardContainer } from "@/components/dashboard/user-dashboard-container"
import { PrimaryDashboardButton } from "@/components/dashboard/primary-dashboard-button"
import { PageContainer } from "@/components/layout/page-container"


export default function Role2OverviewPage() {
  return (
    <PageContainer
      role="user"
      title="Overview"
      description="View fire extinguishers and schedule inspections."
      action={
        <PrimaryDashboardButton label="Schedule Inspection" href="/dashboard/user/inspections" />
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
