"use client"

import * as React from "react"
import { ClipboardCheck, Eye, Loader2, Wrench, X } from "lucide-react"

import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import { listInspections, type Inspection } from "@/lib/inspections"
import { typeLabel } from "@/lib/extinguishers"
import { formatDate } from "@/lib/utils/date"

const LIMIT = 10

export function MaintenanceLogsPanel() {
  const { toast } = useToast()
  const [items, setItems] = React.useState<Inspection[]>([])
  const [meta, setMeta] = React.useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [viewItem, setViewItem] = React.useState<Inspection | null>(null)

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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-[#667085]">
              <tr>
                <th className="px-4 py-3 font-medium">Extinguisher</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Inspection date</th>
                <th className="px-4 py-3 font-medium">Logged</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <ClipboardCheck className="mx-auto mb-3 size-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No completed inspections yet</p>
                    <p className="text-xs text-slate-400">
                      After you log maintenance, completed inspections appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const logged = item.maintenanceActivities[0]
                  return (
                    <tr key={item.id} className="bg-white transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-medium text-[#101828]">
                        {item.extinguisher.serialNumber}
                      </td>
                      <td className="px-4 py-3 text-[#475467]">{item.extinguisher.location}</td>
                      <td className="px-4 py-3 text-[#475467]">
                        {formatDate(item.scheduledDate)} · {item.scheduledTime}
                      </td>
                      <td className="px-4 py-3 text-[#475467]">
                        {logged ? formatDate(logged.actionDate) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                          Completed
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setViewItem(item)}
                            aria-label="View work"
                            title="View work"
                            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#BE123C]"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-500">
            {meta.total} log{meta.total === 1 ? "" : "s"} · Page {meta.page} of {meta.totalPages}
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

      {viewItem ? <WorkDetailsModal item={viewItem} onClose={() => setViewItem(null)} /> : null}
    </div>
  )
}

function WorkDetailsModal({ item, onClose }: { item: Inspection; onClose: () => void }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Extinguisher", value: item.extinguisher.serialNumber },
    { label: "Location", value: item.extinguisher.location },
    { label: "Type", value: typeLabel(item.extinguisher.type) },
    { label: "Scheduled", value: `${formatDate(item.scheduledDate)} · ${item.scheduledTime}` },
    {
      label: "Requested by",
      value: `${item.createdBy.firstName} ${item.createdBy.lastName}`,
    },
    {
      label: "Inspector",
      value: item.assignedInspector
        ? `${item.assignedInspector.firstName} ${item.assignedInspector.lastName}`
        : "—",
    },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
              <Wrench className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#101828]">Maintenance work</h3>
              <p className="mt-0.5 text-sm text-[#667085]">{item.extinguisher.serialNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-100 bg-slate-100 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{row.label}</p>
                <div className="mt-1 text-sm text-[#101828]">{row.value}</div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-[#101828]">Work logged</h4>
            {item.maintenanceActivities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-[#667085]">
                No maintenance activity recorded for this inspection.
              </div>
            ) : (
              <div className="space-y-3">
                {item.maintenanceActivities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-100 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#101828]">
                      <Wrench className="size-4 text-[#BE123C]" />
                      Maintenance on {formatDate(activity.actionDate)}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase text-slate-400">Actions taken</p>
                        <p className="text-sm text-[#475467]">{activity.actionsTaken}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase text-slate-400">Conditions noted</p>
                        <p className="text-sm text-[#475467]">{activity.conditionsNoted}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
