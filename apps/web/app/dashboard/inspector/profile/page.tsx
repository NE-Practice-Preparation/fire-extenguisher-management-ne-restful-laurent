"use client"

import * as React from "react"

import { PageContainer } from "@/components/layout/page-container"
import { SharedProfileContainer } from "@/components/profile/shared-profile-container"
import { getSession } from "@/lib/auth"
import { AuthUser } from "@/lib/types"

export default function InspectorProfilePage() {
  const [user, setUser] = React.useState<AuthUser | null>(null)

  React.useEffect(() => {
    setUser(getSession()?.user ?? null)
  }, [])

  return (
    <PageContainer
      role="inspector"
      title="Profile Settings"
      description="Manage your account information and password."
      breadcrumbs={[
        { label: "Inspector", href: "/dashboard/inspector" },
        { label: "Profile", href: "/dashboard/inspector/profile" },
      ]}
    >
      <div className="space-y-6">
        <SharedProfileContainer
          role="inspector"
          userName={user ? `${user.firstName} ${user.lastName}` : undefined}
          userEmail={user?.email}
        />
      </div>
    </PageContainer>
  )
}
