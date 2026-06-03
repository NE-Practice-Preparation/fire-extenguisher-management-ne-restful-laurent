import { api } from "./api"
import { Role } from "./types"

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE"

export type ManagedUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  isActive: boolean
  status: UserStatus
  passwordSetAt: string | null
  createdAt: string
  updatedAt: string
}

export type Paginated<T> = {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ListUsersParams = {
  token: string
  role?: Role
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export function listUsers({ token, role, page = 1, limit = 10, search, isActive }: ListUsersParams) {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (role) params.set("role", role)
  if (search) params.set("search", search)
  if (typeof isActive === "boolean") params.set("isActive", String(isActive))

  return api<Paginated<ManagedUser>>(`/users?${params.toString()}`, { token })
}

export type CreateUserInput = {
  firstName: string
  lastName: string
  email: string
  role: Extract<Role, "USER" | "INSPECTOR">
}

export function createUser(token: string, input: CreateUserInput) {
  return api<ManagedUser>("/users", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  })
}

export type UpdateUserInput = {
  firstName?: string
  lastName?: string
  email?: string
}

export function updateUser(token: string, id: string, input: UpdateUserInput) {
  return api<ManagedUser>(`/users/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  })
}

export function setUserActive(token: string, id: string, isActive: boolean) {
  return api<ManagedUser>(`/users/${id}/${isActive ? "activate" : "deactivate"}`, {
    method: "PATCH",
    token,
  })
}

export function deleteUser(token: string, id: string) {
  return api<ManagedUser>(`/users/${id}`, { method: "DELETE", token })
}

export function resendInvite(token: string, id: string) {
  return api<{ success: boolean; message: string }>(`/users/${id}/resend-invite`, {
    method: "POST",
    token,
  })
}
