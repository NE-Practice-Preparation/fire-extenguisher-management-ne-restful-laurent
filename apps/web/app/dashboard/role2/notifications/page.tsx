"use client"

import { Bell } from "lucide-react"

import { PageContainer } from "@/components/layout/page-container"

export default function Role2NotificationsPage() {
  return (
    <PageContainer
      role="role2"
      title="Notifications"
      description="Review recent updates and alerts."
      breadcrumbs={[
        { label: "Role 2", href: "/dashboard/role2" },
        { label: "Notifications", href: "/dashboard/role2/notifications" },
      ]}
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-none">
          <div className="flex items-start gap-4">
            <div className="rounded-lg border border-[#EAECF0] bg-white p-2.5">
              <Bell className="h-5 w-5 text-[#BE123C]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#101828]">No Notifications Yet</h2>
              <p className="mt-1 text-[13px] text-[#64748B]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
