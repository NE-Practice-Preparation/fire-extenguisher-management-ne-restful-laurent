"use client"

import * as React from "react"
import { ShieldCheck, Users } from "lucide-react"

import { UsersTable } from "@/components/admin/users-table"

type Tab = "USER" | "INSPECTOR"

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "USER", label: "Users", icon: Users },
  { id: "INSPECTOR", label: "Inspectors", icon: ShieldCheck },
]

export function UserManagement() {
  const [active, setActive] = React.useState<Tab>("USER")

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const selected = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                selected
                  ? "border-[#BE123C] text-[#BE123C]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Remount per tab so each table loads its own role data */}
      {active === "USER" ? <UsersTable key="USER" role="USER" /> : <UsersTable key="INSPECTOR" role="INSPECTOR" />}
    </div>
  )
}
