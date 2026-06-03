export type Role = "ROLE1" | "ROLE2"

export type AuthUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}

export type AdminUser = AuthUser & {
  createdAt: string
  updatedAt: string
}
