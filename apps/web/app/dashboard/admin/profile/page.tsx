"use client"

import * as React from "react"

import { PageContainer } from "@/components/layout/page-container"
import { SharedProfileContainer } from "@/components/profile/shared-profile-container"
import { getSession } from "@/lib/auth"
import { AuthUser } from "@/lib/types"

export default function Role1ProfilePage() {
  const [user, setUser] = React.useState<AuthUser | null>(null)

  React.useEffect(() => {
    setUser(getSession()?.user ?? null)
  }, [])

  return (
    <PageContainer
      role="admin"
      title="Profile Settings"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "Profile", href: "/dashboard/admin/profile" },
      ]}
    >
      <div className="space-y-6">
        <SharedProfileContainer
          role="admin"
          userName={user ? `${user.firstName} ${user.lastName}` : undefined}
          userEmail={user?.email}
        />
      </div>
    </PageContainer>
  )
}
