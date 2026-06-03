"use client"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { CreateItemPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role1CreatePage() {
  return (
    <PageContainer
      role="admin"
      title="Create Item"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Create item", href: "/dashboard/admin/create" },
      ]}
    >
      <div className="space-y-6">
        <DashboardKpiCards />
        <CreateItemPanel />
      </div>
    </PageContainer>
  )
}
