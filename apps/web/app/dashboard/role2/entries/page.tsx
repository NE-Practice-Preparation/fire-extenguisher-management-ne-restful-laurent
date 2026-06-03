"use client"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { CreateItemPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role2EntriesPage() {
  return (
    <PageContainer
      role="role2"
      title="Entries"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Role 2", href: "/dashboard/role2" },
        { label: "Entries", href: "/dashboard/role2/entries" },
      ]}
    >
      <div className="space-y-6">
        <DashboardKpiCards />
        <CreateItemPanel />
      </div>
    </PageContainer>
  )
}
