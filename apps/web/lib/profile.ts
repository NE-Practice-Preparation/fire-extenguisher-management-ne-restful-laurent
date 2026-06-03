import { api } from "./api"
import { AuthResponse } from "./types"

export type UpdateProfileInput = {
  firstName?: string
  lastName?: string
  email?: string
}

/** Updates the current user's profile. Returns a fresh token + user. */
export function updateProfile(token: string, input: UpdateProfileInput) {
  return api<AuthResponse>("/auth/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  })
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

export function changePassword(token: string, input: ChangePasswordInput) {
  return api<{ success: boolean; message: string }>("/auth/change-password", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  })
}
