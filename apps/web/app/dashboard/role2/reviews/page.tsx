"use client"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { RecordsPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role2ReviewsPage() {
  return (
    <PageContainer
      role="role2"
      title="Reviews"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Role 2", href: "/dashboard/role2" },
        { label: "Reviews", href: "/dashboard/role2/reviews" },
      ]}
    >
      <div className="space-y-6">
        <DashboardKpiCards />
        <RecordsPanel />
      </div>
    </PageContainer>
  )
}
