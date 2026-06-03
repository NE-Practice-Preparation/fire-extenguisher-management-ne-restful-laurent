"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react"

const userStats = [
  { label: "Entries", value: "0", icon: FileText, iconColor: "#BE123C" },
  { label: "Pending", value: "0", icon: Clock, iconColor: "#FF8D28" },
  { label: "Approved", value: "0", icon: CheckCircle2, iconColor: "#34C759" },
  { label: "Rejected", value: "0", icon: AlertTriangle, iconColor: "#FF383C" },
]

export function UserKpiCards() {
  return (
    <div className="relative z-10 grid gap-4 bg-white shadow-[0_-20px_40px_white,0_20px_40px_white] md:grid-cols-2 xl:grid-cols-4">
      {userStats.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="animate-slide-up overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none"
          >
            <div className="flex flex-col gap-4 p-5">
              <div className="w-fit rounded-lg border border-[#EAECF0] bg-white p-2.5 shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                <Icon className="h-5 w-5" style={{ color: item.iconColor }} strokeWidth={1} />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
