import { FilePlus } from "lucide-react"

import { PrimaryDashboardButton } from "./primary-dashboard-button"

export function UserEmptyState() {
  return (
    <div className="-mt-2 flex flex-col items-center justify-center px-4 py-20 pt-6">
      <div
        className="relative mb-8 flex h-[240px] w-full max-w-[500px] items-center justify-center"
        style={{
          maskImage: "radial-gradient(circle, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 80%)",
        }}
      >
        <div className="absolute h-[320px] w-[320px] rounded-full border border-slate-100/50" />
        <div className="absolute h-[240px] w-[240px] rounded-full border border-slate-100/60" />
        <div className="absolute h-[160px] w-[160px] rounded-full border border-slate-100/70" />
        <div className="absolute h-[80px] w-[80px] rounded-full border border-[#F2F4F7]" />

        <div className="absolute bottom-0 z-10 flex h-14 w-14 items-center justify-center rounded-lg bg-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] ring-1 ring-slate-200/60 transition-transform hover:scale-105">
          <FilePlus className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-[440px] text-center">
        <h3 className="mb-2 text-[17px] font-semibold text-slate-900">
          No Entries Yet!
        </h3>

        <p className="text-[13px] leading-relaxed text-slate-500">
          You haven&apos;t started any entries. Create your first template entry to track progress here.
        </p>
      </div>

      <PrimaryDashboardButton
        label="Start Entry"
        href="/dashboard/user/entries"
        className="px-8"
      />
    </div>
  )
}
