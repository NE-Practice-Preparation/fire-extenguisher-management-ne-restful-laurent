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
      role="user"
      title="Profile Settings"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      breadcrumbs={[
        { label: "User", href: "/dashboard/user" },
        { label: "Profile", href: "/dashboard/user/profile" },
      ]}
    >
      <div className="space-y-6">
        <SharedProfileContainer
          role="user"
          userName={user ? `${user.firstName} ${user.lastName}` : undefined}
          userEmail={user?.email}
        />
      </div>
    </PageContainer>
  )
}
