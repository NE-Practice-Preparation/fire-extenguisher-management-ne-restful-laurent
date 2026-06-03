import { ExtinguisherStatus, ExtinguisherType } from "./extinguishers"
import { InspectionStatus } from "./inspections"
import { api } from "./api"

export type ReportCount<T extends string> = {
  status: T
  count: number
}

export type ExpiredExtinguisherReportItem = {
  id: string
  serialNumber: string
  location: string
  type: ExtinguisherType
  size: string
  expiryDate: string
  status: ExtinguisherStatus
}

export type MaintenanceHistoryReportItem = {
  id: string
  actionsTaken: string
  actionDate: string
  conditionsNoted: string
  createdAt: string
  inspector: { id: string; firstName: string; lastName: string; email: string } | null
  inspection: {
    id: string
    scheduledDate: string
    scheduledTime: string
    extinguisher: {
      id: string
      serialNumber: string
      location: string
      type: ExtinguisherType
    }
  }
}

export type ReportsSummary = {
  generatedAt: string
  stock: {
    total: number
    daily: number
    monthly: number
    yearly: number
  }
  extinguisherStatus: ReportCount<ExtinguisherStatus>[]
  inspectionStatus: ReportCount<InspectionStatus>[]
  expiredExtinguishers: ExpiredExtinguisherReportItem[]
  maintenanceHistory: MaintenanceHistoryReportItem[]
}

export function getReportsSummary(token: string) {
  return api<ReportsSummary>("/reports/summary", { token })
}
