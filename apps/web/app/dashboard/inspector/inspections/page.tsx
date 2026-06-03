"use client"

import { AssignedInspectionsPanel } from "@/components/inspections/assigned-inspections-panel"
import { PageContainer } from "@/components/layout/page-container"

export default function InspectorInspectionsPage() {
  return (
    <PageContainer
      role="inspector"
      title="My Inspections"
      description="View assigned inspections and log maintenance activities."
      breadcrumbs={[
        { label: "Inspector", href: "/dashboard/inspector" },
        { label: "My Inspections", href: "/dashboard/inspector/inspections" },
      ]}
    >
      <AssignedInspectionsPanel />
    </PageContainer>
  )
}
