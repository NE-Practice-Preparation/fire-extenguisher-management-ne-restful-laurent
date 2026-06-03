"use client"

import { PageContainer } from "@/components/layout/page-container"
import { ExtinguishersTable } from "@/components/admin/extinguishers-table"

export default function UserExtinguishersPage() {
  return (
    <PageContainer
      role="user"
      title="Fire Extinguishers"
      description="Browse all registered fire extinguishers and their status."
      breadcrumbs={[
        { label: "User", href: "/dashboard/user" },
        { label: "Fire Extinguishers", href: "/dashboard/user/extinguishers" },
      ]}
    >
      <ExtinguishersTable readOnly />
    </PageContainer>
  )
}
