"use client"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { CreateItemPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role2EntriesPage() {
  return (
    <PageContainer
      role="user"
      title="Entries"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "User", href: "/dashboard/user" },
        { label: "Entries", href: "/dashboard/user/entries" },
      ]}
    >
      <div className="space-y-6">
        <DashboardKpiCards />
        <CreateItemPanel />
      </div>
    </PageContainer>
  )
}
