"use client"

import { ReportsPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role1ReportsPage() {
  return (
    <PageContainer
      role="admin"
      title="Users"
      description="Manage registered users and portal access."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Users", href: "/dashboard/admin/reports" },
      ]}
    >
      <div className="space-y-6">
        <ReportsPanel />
      </div>
    </PageContainer>
  )
}
