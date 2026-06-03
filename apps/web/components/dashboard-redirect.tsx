"use client"

import { useRouter } from "next/navigation"
import * as React from "react"

import { dashboardPathForRole, getSession } from "@/lib/auth"

export function DashboardRedirect() {
  const router = useRouter()

  React.useEffect(() => {
    const session = getSession()

    if (!session) {
      router.replace("/auth/login")
      return
    }

    router.replace(dashboardPathForRole(session.user.role))
  }, [router])

  return (
    <div className="grid min-h-svh place-items-center bg-white text-sm text-slate-500">
      Opening dashboard...
    </div>
  )
}
