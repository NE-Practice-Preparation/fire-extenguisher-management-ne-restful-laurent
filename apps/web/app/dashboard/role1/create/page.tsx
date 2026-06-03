"use client"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { CreateItemPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role1CreatePage() {
  return (
    <PageContainer
      role="role1"
      title="Create Item"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Role 1", href: "/dashboard/role1" },
        { label: "Create item", href: "/dashboard/role1/create" },
      ]}
    >
      <div className="space-y-6">
        <DashboardKpiCards />
        <CreateItemPanel />
      </div>
    </PageContainer>
  )
}
