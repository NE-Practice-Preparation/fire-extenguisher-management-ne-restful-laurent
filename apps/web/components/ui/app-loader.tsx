import { cn } from "@workspace/ui/lib/utils"

export function AppLoader({
  label = "Loading",
  className,
  compact = false,
}: {
  label?: string
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact ? "gap-3 py-4" : "min-h-svh bg-white",
        className
      )}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
        <div className="relative size-9">
          <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#BE123C]" />
          <div className="absolute inset-[9px] rounded-full bg-[#BE123C]/10" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#101828]">{label}</p>
          {!compact ? <p className="text-xs text-[#667085]">Preparing your workspace</p> : null}
        </div>
      </div>
    </div>
  )
}
