"use client"

import { ReportsPanel } from "@/components/dashboard/template-route-panels"
import { PageContainer } from "@/components/layout/page-container"

export default function Role1ReportsPage() {
  return (
    <PageContainer
      role="role1"
      title="Users"
      description="Manage registered users and portal access."
      breadcrumbs={[
        { label: "Role 1", href: "/dashboard/role1" },
        { label: "Users", href: "/dashboard/role1/reports" },
      ]}
    >
      <div className="space-y-6">
        <ReportsPanel />
      </div>
    </PageContainer>
  )
}
