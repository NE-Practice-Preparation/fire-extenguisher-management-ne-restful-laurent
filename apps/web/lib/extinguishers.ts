import { api } from "./api"
import { Paginated } from "./users"

export type ExtinguisherType = "WATER" | "CO2" | "FOAM" | "DRY_CHEMICAL"
export type ExtinguisherStatus = "ACTIVE" | "EXPIRED" | "MAINTENANCE_REQUIRED" | "OUT_OF_SERVICE"

export const EXTINGUISHER_TYPES: ExtinguisherType[] = ["WATER", "CO2", "FOAM", "DRY_CHEMICAL"]
export const EXTINGUISHER_STATUSES: ExtinguisherStatus[] = [
  "ACTIVE",
  "EXPIRED",
  "MAINTENANCE_REQUIRED",
  "OUT_OF_SERVICE",
]

export const EXTINGUISHER_SIZES = ["2.5lbs", "5lbs", "9lbs", "12lbs"]

export type Extinguisher = {
  id: string
  serialNumber: string
  location: string
  type: ExtinguisherType
  size: string
  installationDate: string
  expiryDate: string
  status: ExtinguisherStatus
  createdAt: string
  updatedAt: string
}

export type ListExtinguishersParams = {
  token: string
  page?: number
  limit?: number
  search?: string
  type?: ExtinguisherType
  status?: ExtinguisherStatus
}

export function listExtinguishers({
  token,
  page = 1,
  limit = 10,
  search,
  type,
  status,
}: ListExtinguishersParams) {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (search) params.set("search", search)
  if (type) params.set("type", type)
  if (status) params.set("status", status)

  return api<Paginated<Extinguisher>>(`/extinguishers?${params.toString()}`, { token })
}

export type ExtinguisherInput = {
  serialNumber: string
  location: string
  type: ExtinguisherType
  size: string
  installationDate: string
  expiryDate: string
  status?: ExtinguisherStatus
}

export function createExtinguisher(token: string, input: ExtinguisherInput) {
  return api<Extinguisher>("/extinguishers", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  })
}

export function updateExtinguisher(token: string, id: string, input: Partial<ExtinguisherInput>) {
  return api<Extinguisher>(`/extinguishers/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  })
}

export function deleteExtinguisher(token: string, id: string) {
  return api<Extinguisher>(`/extinguishers/${id}`, { method: "DELETE", token })
}

export function typeLabel(type: ExtinguisherType) {
  return type === "DRY_CHEMICAL" ? "Dry Chemical" : type === "CO2" ? "CO₂" : type.charAt(0) + type.slice(1).toLowerCase()
}

export function statusLabel(status: ExtinguisherStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
