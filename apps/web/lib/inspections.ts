import { api } from "./api"
import { ExtinguisherType } from "./extinguishers"
import { Paginated } from "./users"

export type InspectionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "OVERDUE"

export const INSPECTION_STATUSES: InspectionStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "OVERDUE",
]

export type Inspection = {
  id: string
  extinguisherId: string
  scheduledDate: string
  scheduledTime: string
  status: InspectionStatus
  notes: string | null
  assignedInspectorId: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  extinguisher: {
    id: string
    serialNumber: string
    location: string
    type: ExtinguisherType
  }
  assignedInspector: { id: string; firstName: string; lastName: string } | null
  createdBy: { id: string; firstName: string; lastName: string }
  maintenanceActivities: MaintenanceActivity[]
}

export type MaintenanceActivity = {
  id: string
  actionsTaken: string
  actionDate: string
  conditionsNoted: string
  createdAt: string
  inspector: { id: string; firstName: string; lastName: string } | null
}

export type ListInspectionsParams = {
  token: string
  page?: number
  limit?: number
  status?: InspectionStatus
}

export function listInspections({ token, page = 1, limit = 10, status }: ListInspectionsParams) {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (status) params.set("status", status)

  return api<Paginated<Inspection>>(`/inspections?${params.toString()}`, { token })
}

export type ScheduleInspectionInput = {
  extinguisherId: string
  scheduledDate: string
  scheduledTime: string
  notes?: string
}

export function scheduleInspection(token: string, input: ScheduleInspectionInput) {
  return api<Inspection>("/inspections", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  })
}

export function cancelInspection(token: string, id: string) {
  return api<Inspection>(`/inspections/${id}/cancel`, { method: "PATCH", token })
}

export function getInspection(token: string, id: string) {
  return api<Inspection>(`/inspections/${id}`, { token })
}

export function assignInspector(token: string, id: string, assignedInspectorId: string) {
  return api<Inspection>(`/inspections/${id}/assign`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ assignedInspectorId }),
  })
}

export type CompleteInspectionInput = {
  actionsTaken: string
  actionDate: string
  conditionsNoted: string
}

export function completeInspection(token: string, id: string, input: CompleteInspectionInput) {
  return api<Inspection>(`/inspections/${id}/complete`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  })
}

export function statusLabel(status: InspectionStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}
