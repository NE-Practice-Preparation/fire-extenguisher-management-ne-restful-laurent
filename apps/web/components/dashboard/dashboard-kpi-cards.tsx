"use client"

import * as React from "react"
import { AlertTriangle, CheckCheck, ClipboardClock, NotepadText } from "lucide-react"

const kpiItems = [
  { label: "Lorem Items", value: "0", icon: NotepadText, iconColor: "#0A77FF" },
  { label: "Pending Items", value: "0", icon: ClipboardClock, iconColor: "#FF8D28" },
  { label: "Completed Items", value: "0", icon: CheckCheck, iconColor: "#34C759" },
  { label: "Flagged Items", value: "0", icon: AlertTriangle, iconColor: "#FF383C" },
]

export function DashboardKpiCards() {
  return (
    <div className="relative z-10 grid gap-4 bg-white shadow-[0_-20px_40px_white,0_20px_40px_white] md:grid-cols-2 xl:grid-cols-4">
      {kpiItems.map((item) => {
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
