"use client"

import { MaintenanceLogsPanel } from "@/components/inspections/maintenance-logs-panel"
import { PageContainer } from "@/components/layout/page-container"

export default function InspectorLogsPage() {
  return (
    <PageContainer
      role="inspector"
      title="Maintenance Logs"
      description="Review completed inspections, actions taken, and conditions noted."
      breadcrumbs={[
        { label: "Inspector", href: "/dashboard/inspector" },
        { label: "Maintenance Logs", href: "/dashboard/inspector/logs" },
      ]}
    >
      <MaintenanceLogsPanel />
    </PageContainer>
  )
}
