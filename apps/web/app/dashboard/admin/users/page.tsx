"use client"

import { PageContainer } from "@/components/layout/page-container"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  return (
    <PageContainer
      role="admin"
      title="User Management"
      description="Create and manage users and inspectors."
      breadcrumbs={[
        { label: "Admin", href: "/dashboard/admin" },
        { label: "User Management", href: "/dashboard/admin/users" },
      ]}
    >
      <UserManagement />
    </PageContainer>
  )
}
