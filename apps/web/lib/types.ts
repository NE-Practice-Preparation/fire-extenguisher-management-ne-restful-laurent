export type Role = "ADMIN" | "INSPECTOR" | "USER"

export type AuthUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  isActive?: boolean
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}

export type AdminUser = AuthUser & {
  isActive: boolean
  createdAt: string
  updatedAt: string
}
