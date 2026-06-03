"use client"

import { MoveUpRight } from "lucide-react"

import { categoryBreakdown } from "./dashboard-template-data"

export function CategoryBreakdownChart() {
  return (
    <div className="animate-slide-up h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
      <div className="flex h-full flex-col p-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative mx-auto h-52 w-52 sm:mx-0 sm:h-60 sm:w-60">
            <div
              className="h-full w-full rounded-full"
              style={{
                background: `conic-gradient(
                  #0A77FF 0% 45%,
                  #59A8FF 45% 70%,
                  #84C3FF 70% 85%,
                  #D1E9FF 85% 95%,
                  #EFF8FF 95% 100%
                )`,
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            {categoryBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="max-w-[160px] truncate text-[11px] font-semibold text-slate-500">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
            Items By Category
          </h4>
          <p className="text-[11px] font-medium text-slate-400">Total Placeholder Items</p>
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl font-bold text-slate-900">230</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#34C759]">
              <MoveUpRight className="h-3 w-3" strokeWidth={3} />
              <span>3.4%</span>
            </div>
          </div>
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
