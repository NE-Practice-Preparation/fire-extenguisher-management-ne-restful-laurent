"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

export type TrendDatum = {
  label: string
  completed: number
  scheduled: number
  overdue: number
}

const COLORS = {
  completed: "#16A34A",
  scheduled: "#BE123C",
  overdue: "#FB7185",
}

/**
 * Monthly inspections trend — a stacked bar chart styled after the template's
 * analytics graph, fed with real data. Bottom→top: Completed, Scheduled, Overdue.
 */
export function InspectionsTrendChart({
  title = "Monthly Inspections",
  data,
}: {
  title?: string
  data: TrendDatum[]
}) {
  const [hovered, setHovered] = React.useState<number | null>(null)

  const actualMax = Math.max(
    1,
    ...data.map((item) => item.completed + item.scheduled + item.overdue)
  )
  const maxValue = Math.max(4, Math.ceil(actualMax / 4) * 4)
  const yAxis = Array.from({ length: 6 }, (_, index) => Math.round(maxValue * (1 - index / 5)))

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white text-[#101828]">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <LegendDot color={COLORS.completed} label="Completed" />
          <LegendDot color={COLORS.scheduled} label="Scheduled" />
          <LegendDot color={COLORS.overdue} label="Overdue" />
        </div>
      </div>

      <div className="no-scrollbar overflow-x-auto px-6 pb-6 pt-5">
        <div className="relative flex h-56 min-w-[480px] flex-col">
          <div className="absolute inset-0 flex flex-col justify-between">
            {yAxis.map((value, tickIndex) => (
              <div key={tickIndex} className="flex h-[18%] w-full items-center gap-4">
                <span className="w-5 text-right text-[10px] font-medium text-slate-400">
                  {value}
                </span>
                <div className="flex-1 border-t border-slate-100" />
              </div>
            ))}
          </div>

          <div
            className="relative ml-10 flex h-full flex-1 items-end justify-between pr-2"
            onMouseLeave={() => setHovered(null)}
          >
            {data.map((item, index) => {
              const total = item.completed + item.scheduled + item.overdue
              const completedH = (item.completed / maxValue) * 100
              return (
                <div
                  key={`${item.label}-${index}`}
                  className="group relative mb-1 flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
                  onMouseEnter={() => setHovered(index)}
                >
                  {hovered === index ? (
                    <div
                      className="absolute z-50 min-w-[140px] rounded-lg bg-[#101828] p-3 text-[10px] text-white shadow-xl"
                      style={{ bottom: `${completedH}%`, transform: "translateY(-12px)", marginBottom: 8 }}
                    >
                      <p className="mb-2 flex justify-between border-b border-white/10 pb-1.5 font-bold">
                        <span>{item.label}</span>
                        <span className="font-normal text-slate-400">Total {total}</span>
                      </p>
                      <TooltipRow color={COLORS.completed} label="Completed" value={item.completed} />
                      <TooltipRow color={COLORS.scheduled} label="Scheduled" value={item.scheduled} />
                      <TooltipRow color={COLORS.overdue} label="Overdue" value={item.overdue} />
                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#101828]" />
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "relative h-full w-8 overflow-hidden rounded-t-[6px] transition-all duration-300",
                      hovered === index ? "scale-x-110" : hovered !== null ? "opacity-50" : ""
                    )}
                  >
                    {/* back → top of bar (overdue) */}
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-[6px] transition-all duration-500"
                      style={{ height: `${(total / maxValue) * 100}%`, backgroundColor: COLORS.overdue }}
                    />
                    {/* mid → scheduled */}
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-[6px] transition-all duration-500"
                      style={{
                        height: `${((item.completed + item.scheduled) / maxValue) * 100}%`,
                        backgroundColor: COLORS.scheduled,
                      }}
                    />
                    {/* front → completed (bottom) */}
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-[6px] transition-all duration-500"
                      style={{ height: `${completedH}%`, backgroundColor: COLORS.completed }}
                    />
                  </div>

                  <div className="flex h-4 items-center justify-center">
                    <span className="text-[10px] font-medium text-slate-400">{item.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  )
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-slate-400">{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}
