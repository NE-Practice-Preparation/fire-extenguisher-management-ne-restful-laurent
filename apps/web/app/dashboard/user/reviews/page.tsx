"use client"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { RecordsPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role2ReviewsPage() {
  return (
    <PageContainer
      role="user"
      title="Reviews"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "User", href: "/dashboard/user" },
        { label: "Reviews", href: "/dashboard/user/reviews" },
      ]}
    >
      <div className="space-y-6">
        <DashboardKpiCards />
        <RecordsPanel />
      </div>
    </PageContainer>
  )
}
