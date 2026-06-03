"use client"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { RecentRecordsTable } from "@/components/dashboard/recent-records-table"
import { RecordsPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role1RecordsPage() {
  return (
    <PageContainer
      role="role1"
      title="Records"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Role 1", href: "/dashboard/role1" },
        { label: "Records", href: "/dashboard/role1/records" },
      ]}
    >
      <div className="space-y-6">
        <DashboardKpiCards />
        <RecordsPanel />
        <RecentRecordsTable />
      </div>
    </PageContainer>
  )
}
