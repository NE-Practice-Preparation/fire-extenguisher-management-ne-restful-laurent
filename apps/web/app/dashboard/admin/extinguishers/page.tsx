"use client"

import { PageContainer } from "@/components/layout/page-container"
import { ExtinguishersTable } from "@/components/admin/extinguishers-table"

export default function AdminExtinguishersPage() {
  return (
    <PageContainer
      role="admin"
      title="Fire Extinguishers"
      description="Register and manage fire extinguishers across all locations."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Fire Extinguishers", href: "/dashboard/admin/extinguishers" },
      ]}
    >
      <ExtinguishersTable />
    </PageContainer>
  )
}
