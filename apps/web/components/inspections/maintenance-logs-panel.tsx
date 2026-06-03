"use client"

import * as React from "react"
import { ClipboardCheck, Loader2, Wrench } from "lucide-react"

import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import { listInspections, type Inspection } from "@/lib/inspections"
import { formatDate } from "@/lib/utils/date"

const LIMIT = 10

export function MaintenanceLogsPanel() {
  const { toast } = useToast()
  const [items, setItems] = React.useState<Inspection[]>([])
  const [meta, setMeta] = React.useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  const load = React.useCallback(async () => {
    const session = getSession()
    if (!session) {
      setError("Please sign in again.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    try {
      const result = await listInspections({
        token: session.token,
        page,
        limit: LIMIT,
        status: "COMPLETED",
      })
      setItems(result.data)
      setMeta(result.meta)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load maintenance logs"
      setError(message)
      toast({ type: "error", title: "Failed to load logs", description: message })
    } finally {
      setLoading(false)
    }
  }, [page, toast])

  React.useEffect(() => {
    void load()
  }, [load])

  const logCount = items.reduce((total, item) => total + item.maintenanceActivities.length, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <LogMetric label="Completed inspections" value={meta.total} detail="Assigned work marked complete" />
        <LogMetric label="Maintenance logs" value={logCount} detail="Action records on this page" />
        <LogMetric label="Current page" value={meta.page} detail={`of ${meta.totalPages} page${meta.totalPages === 1 ? "" : "s"}`} />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-[15px] font-medium text-[#101828]">Completed Inspection Logs</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-slate-400">
            <Loader2 className="size-5 animate-spin" />
            Loading logs
          </div>
        ) : error ? (
          <div className="px-4 py-12 text-center text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <ClipboardCheck className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No completed inspections yet</p>
            <p className="text-xs text-slate-400">
              After you log maintenance, completed inspections will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((inspection) => (
              <article key={inspection.id} className="p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-[#101828]">
                      {inspection.extinguisher.serialNumber}
                    </p>
                    <p className="text-sm text-[#667085]">{inspection.extinguisher.location}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Scheduled {formatDate(inspection.scheduledDate)} at {inspection.scheduledTime}
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                    Completed
                  </span>
                </div>

                {inspection.maintenanceActivities.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-[#667085]">
                    This inspection is completed but has no maintenance activity attached.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {inspection.maintenanceActivities.map((activity) => (
                      <div key={activity.id} className="rounded-lg border border-slate-100 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#101828]">
                          <Wrench className="size-4 text-[#BE123C]" />
                          Maintenance on {formatDate(activity.actionDate)}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="mb-1 text-xs font-medium uppercase text-slate-400">
                              Actions taken
                            </p>
                            <p className="text-sm text-[#475467]">{activity.actionsTaken}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium uppercase text-slate-400">
                              Conditions noted
                            </p>
                            <p className="text-sm text-[#475467]">{activity.conditionsNoted}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-500">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages || loading}
              onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LogMetric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[13px] text-[#667085]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#101828]">{value}</p>
      <p className="mt-1 text-[13px] text-[#667085]">{detail}</p>
    </div>
  )
}
