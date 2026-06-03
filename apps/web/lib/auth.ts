"use client"

import { AuthResponse, AuthUser, Role } from "./types"

const tokenKey = "restful-template-token"
const userKey = "restful-template-user"

type JwtPayload = {
  sub?: string
  exp?: number
  role?: unknown
}

export function normalizeRole(role: unknown): Role | null {
  const normalized = String(role ?? "").toUpperCase()

  if (normalized === "ADMIN" || normalized === "INSPECTOR" || normalized === "USER") {
    return normalized
  }

  return null
}

export function saveAuth(auth: AuthResponse) {
  const role = normalizeRole(auth.user.role)

  if (!auth.accessToken || !role) {
    clearAuth()
    throw new Error("Invalid authentication response")
  }

  const user = { ...auth.user, role }
  window.localStorage.setItem(tokenKey, auth.accessToken)
  window.localStorage.setItem(userKey, JSON.stringify(user))

  return user
}

export function clearAuth() {
  window.localStorage.removeItem(tokenKey)
  window.localStorage.removeItem(userKey)
}

export function getToken() {
  return window.localStorage.getItem(tokenKey)
}

export function getUser() {
  const value = window.localStorage.getItem(userKey)

  if (!value) {
    return null
  }

  try {
    const user = JSON.parse(value) as AuthUser
    const role = normalizeRole(user.role)

    if (!role) {
      clearAuth()
      return null
    }

    return { ...user, role }
  } catch {
    clearAuth()
    return null
  }
}

export function getSession() {
  const token = getToken()
  const user = getUser()

  if (!token || !user) {
    clearAuth()
    return null
  }

  const payload = decodeJwtPayload(token)
  const tokenRole = normalizeRole(payload?.role)

  if (!payload || !tokenRole || payload.sub !== user.id || isExpired(payload.exp)) {
    clearAuth()
    return null
  }

  if (tokenRole !== user.role) {
    const syncedUser = { ...user, role: tokenRole }
    window.localStorage.setItem(userKey, JSON.stringify(syncedUser))

    return { token, user: syncedUser }
  }

  return { token, user }
}

export function roleLabel(role: Role) {
  switch (role) {
    case "ADMIN":
      return "Admin"
    case "INSPECTOR":
      return "Inspector"
    default:
      return "User"
  }
}

export function dashboardPathForRole(role: Role) {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin"
    case "INSPECTOR":
      return "/dashboard/inspector"
    default:
      return "/dashboard/user"
  }
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".")

  if (!payload) {
    return null
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))

    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function isExpired(exp: number | undefined) {
  return typeof exp === "number" && exp * 1000 <= Date.now()
}
