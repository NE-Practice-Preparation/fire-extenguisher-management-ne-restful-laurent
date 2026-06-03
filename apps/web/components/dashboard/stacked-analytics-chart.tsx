"use client"

import * as React from "react"
import { ExternalLink, MoreHorizontal } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { ChartDataItem } from "./dashboard-template-data"

export function StackedAnalyticsChart({ data }: { data: Record<string, ChartDataItem[]> }) {
  const [activeTab, setActiveTab] = React.useState("12 Months")
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  let currentData = data[activeTab] || []

  if (activeTab === "30 Days" || activeTab === "24 Hours") {
    currentData = currentData.filter((_, index) => index % 2 === 0)
  }

  const actualMax =
    currentData.length > 0
      ? Math.max(...currentData.map((item) => item.rejected + item.approved + item.pending), 1)
      : 20
  const maxValue = Math.ceil(actualMax / 4) * 4
  const dynamicYAxis = Array.from({ length: 6 }, (_, index) =>
    Math.round(maxValue * (1 - index / 5))
  )

  return (
    <div className="animate-slide-up overflow-hidden rounded-lg border border-slate-200 bg-white text-[#101828] shadow-none">
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-base font-semibold">Activity Trend</h3>
        <MoreHorizontal className="h-5 w-5 cursor-pointer text-slate-400" />
      </div>

      <div className="flex flex-col gap-4 px-6 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-fit items-center gap-1 rounded-lg p-1">
          {["12 Months", "30 Days", "7 Days", "24 Hours"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab)
                setHoveredIndex(null)
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === tab
                  ? "border border-[#E5E5E7] bg-[#F8F9FB] text-[#323539]"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <LegendDot color="#E0EFFF" label="Pending" />
          <LegendDot color="#59A8FF" label="Approved" />
          <LegendDot color="#0A77FF" label="Rejected" />
        </div>
      </div>

      <div className="no-scrollbar overflow-x-auto px-6 pb-6 pt-2">
        <div className="relative flex h-56 min-w-[600px] flex-col">
          <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between">
            {dynamicYAxis.map((value) => (
              <div key={value} className="flex h-[18%] w-full items-center gap-4">
                <span className="w-4 text-right text-[10px] font-medium text-slate-400">
                  {value}
                </span>
                <div className="flex-1 border-t border-slate-100" />
              </div>
            ))}
          </div>

          <div
            className="relative ml-10 flex h-full flex-1 items-end justify-between pr-4"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {currentData.map((item, index) => {
              const total = item.rejected + item.approved + item.pending
              const rejectedHeightPct = (item.rejected / maxValue) * 100

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="group relative mb-1 flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
                  onMouseEnter={() => setHoveredIndex(index)}
                >
                  {hoveredIndex === index ? (
                    <div
                      className="absolute z-50 min-w-[120px] rounded-lg bg-[#101828] p-3 text-[10px] text-white shadow-xl"
                      style={{
                        bottom: `${rejectedHeightPct}%`,
                        transform: "translateY(-12px)",
                        marginBottom: "8px",
                      }}
                    >
                      <p className="mb-2 flex justify-between border-b border-white/10 pb-1.5 font-bold">
                        <span>{item.label}</span>
                        <span className="font-normal text-slate-500 underline decoration-slate-600">
                          {activeTab}
                        </span>
                      </p>

                      <TooltipRow color="#0A77FF" label="Rejected" value={item.rejected} />
                      <TooltipRow color="#59A8FF" label="Approved" value={item.approved} />
                      <TooltipRow color="#E0EFFF" label="Pending" value={item.pending} />

                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#101828]" />
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "relative h-36 w-8 overflow-hidden rounded-t-[6px] bg-transparent transition-all duration-300",
                      hoveredIndex === index
                        ? "scale-x-105 opacity-100"
                        : hoveredIndex !== null
                          ? "opacity-40"
                          : "opacity-100"
                    )}
                  >
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-[6px] bg-[#E0EFFF] transition-all duration-500"
                      style={{ height: `${(total / maxValue) * 100}%` }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-[6px] bg-[#59A8FF] transition-all duration-500"
                      style={{
                        height: `${((item.rejected + item.approved) / maxValue) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-[6px] bg-[#0A77FF] transition-all duration-500"
                      style={{ height: `${(item.rejected / maxValue) * 100}%` }}
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

      <div className="mt-8 flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4">
        <span className="text-xs font-medium text-slate-400">Data graph</span>
        <button className="flex items-center gap-1.5 text-xs font-medium text-[#0A77FF] hover:underline">
          Open
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
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

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-slate-400">{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}
