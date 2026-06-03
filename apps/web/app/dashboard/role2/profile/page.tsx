"use client"

import * as React from "react"

import { PageContainer } from "@/components/layout/page-container"
import { SharedProfileContainer } from "@/components/profile/shared-profile-container"
import { getSession } from "@/lib/auth"
import { AuthUser } from "@/lib/types"

export default function Role2ProfilePage() {
  const [user, setUser] = React.useState<AuthUser | null>(null)

  React.useEffect(() => {
    setUser(getSession()?.user ?? null)
  }, [])

  return (
    <PageContainer
      role="role2"
      title="Profile Settings"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "Role 2", href: "/dashboard/role2" },
        { label: "Profile", href: "/dashboard/role2/profile" },
      ]}
    >
      <div className="space-y-6">
        <SharedProfileContainer
          role="role2"
          userName={user ? `${user.firstName} ${user.lastName}` : undefined}
          userEmail={user?.email}
        />
      </div>
    </PageContainer>
  )
}
