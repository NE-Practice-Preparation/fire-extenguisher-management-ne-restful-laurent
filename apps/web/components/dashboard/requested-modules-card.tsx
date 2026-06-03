"use client"

import { MoreVertical } from "lucide-react"

import { requestedModules } from "./dashboard-template-data"

export function RequestedModulesCard() {
  return (
    <div className="animate-slide-up h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
      <div className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between">
          <div className="w-full space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Most Requested Modules</h3>
            <p className="min-w-[240px] text-[11px] font-medium leading-snug text-slate-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <MoreVertical className="h-4 w-4 cursor-pointer text-slate-400" />
        </div>

        <div className="mt-4 flex items-baseline gap-2 border-t pt-2">
          <span className="text-2xl font-bold text-slate-900">230</span>
          <span className="text-[11px] font-medium text-slate-400">Modules</span>
        </div>

        <div className="mt-4 space-y-4">
          {requestedModules.map((module) => (
            <div key={module.id} className="flex items-center gap-4">
              <span className="w-4 text-xs text-slate-400">{module.id}</span>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-[11px] text-slate-700">{module.name}</span>
                  <span className="text-[11px] font-bold text-slate-900">
                    {module.percentage.toFixed(2)}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full border border-slate-100 bg-slate-50">
                  <div
                    className="h-full rounded-full bg-[#BE123C] transition-all duration-1000"
                    style={{ width: `${(module.percentage / 12) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex justify-end border-t border-slate-100 pt-6">
          <button className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            View full report
          </button>
        </div>
      </div>
    </div>
  )
}
