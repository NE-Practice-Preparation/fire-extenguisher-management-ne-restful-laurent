"use client"

import { InspectionsManagement } from "@/components/admin/inspections-management"
import { PageContainer } from "@/components/layout/page-container"

export default function AdminInspectionsPage() {
  return (
    <PageContainer
      role="admin"
      title="Inspection Requests"
      description="Review requested inspections and assign active inspectors."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Inspections", href: "/dashboard/admin/inspections" },
      ]}
    >
      <InspectionsManagement />
    </PageContainer>
  )
}
