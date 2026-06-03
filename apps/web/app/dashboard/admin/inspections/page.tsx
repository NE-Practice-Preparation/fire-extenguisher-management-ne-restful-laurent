"use client"

import { PageContainer } from "@/components/layout/page-container"
import { InspectionsPanel } from "@/components/inspections/inspections-panel"

export default function AdminInspectionsPage() {
  return (
    <PageContainer
      role="admin"
      title="Inspections"
      description="All submitted inspections across the system."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Inspections", href: "/dashboard/admin/inspections" },
      ]}
    >
      <InspectionsPanel showSchedule={false} allowCancel={false} />
    </PageContainer>
  )
}
