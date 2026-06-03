"use client"

import { PageContainer } from "@/components/layout/page-container"
import { InspectionsPanel } from "@/components/inspections/inspections-panel"

export default function UserInspectionsPage() {
  return (
    <PageContainer
      role="user"
      title="Inspections"
      description="Schedule inspections and track their status and history."
      breadcrumbs={[
        { label: "User", href: "/dashboard/user" },
        { label: "Inspections", href: "/dashboard/user/inspections" },
      ]}
    >
      <InspectionsPanel />
    </PageContainer>
  )
}
