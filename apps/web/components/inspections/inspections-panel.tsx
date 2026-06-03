"use client"

import * as React from "react"
import { CalendarPlus, Eye, Loader2, XCircle } from "lucide-react"

import { useToast } from "@/components/toast"
import { InspectionDetailsModal } from "@/components/inspections/inspection-details-modal"
import { ScheduleInspectionModal } from "@/components/inspections/schedule-inspection-modal"
import { getSession } from "@/lib/auth"
import {
  cancelInspection,
  listInspections,
  statusLabel,
  INSPECTION_STATUSES,
  type Inspection,
  type InspectionStatus,
} from "@/lib/inspections"
import { formatDate } from "@/lib/utils/date"

const LIMIT = 8

const STATUS_STYLES: Record<InspectionStatus, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  OVERDUE: "bg-red-50 text-red-700",
}

export function InspectionsPanel({
  showSchedule = true,
  allowCancel = true,
}: {
  showSchedule?: boolean
  allowCancel?: boolean
}) {
  const { toast } = useToast()
  const [items, setItems] = React.useState<Inspection[]>([])
  const [meta, setMeta] = React.useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<InspectionStatus | "">("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [viewId, setViewId] = React.useState<string | null>(null)
  const [toCancel, setToCancel] = React.useState<Inspection | null>(null)
  const [cancelling, setCancelling] = React.useState(false)

  React.useEffect(() => {
    setPage(1)
  }, [statusFilter])

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
        status: statusFilter || undefined,
      })
      setItems(result.data)
      setMeta(result.meta)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load"
      setError(message)
      toast({ type: "error", title: "Failed to load", description: message })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, toast])

  React.useEffect(() => {
    void load()
  }, [load])

  async function confirmCancel() {
    if (!toCancel) return
    const session = getSession()
    if (!session) return
    setCancelling(true)
    try {
      await cancelInspection(session.token, toCancel.id)
      toast({ type: "success", title: "Inspection cancelled" })
      setToCancel(null)
      await load()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Cancel failed"
      toast({ type: "error", title: "Cancel failed", description: message })
    } finally {
      setCancelling(false)
    }
  }

  const colCount = 6

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as InspectionStatus | "")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
        >
          <option value="">All statuses</option>
          {INSPECTION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>

        {showSchedule ? (
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239]"
          >
            <CalendarPlus className="h-4 w-4" />
            Schedule Inspection
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-[#667085]">
              <tr>
                <th className="px-4 py-3 font-medium">Extinguisher</th>
                <th className="px-4 py-3 font-medium">Scheduled date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Inspector</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-14 text-center">
                    <p className="text-sm font-medium text-slate-600">No inspections yet</p>
                    {showSchedule ? (
                      <p className="text-xs text-slate-400">Schedule one with the button above.</p>
                    ) : null}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="bg-white transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#101828]">{item.extinguisher.serialNumber}</p>
                      <p className="text-xs text-slate-400">{item.extinguisher.location}</p>
                    </td>
                    <td className="px-4 py-3 text-[#475467]">{formatDate(item.scheduledDate)}</td>
                    <td className="px-4 py-3 text-[#475467]">{item.scheduledTime}</td>
                    <td className="px-4 py-3 text-[#475467]">
                      {item.assignedInspector
                        ? `${item.assignedInspector.firstName} ${item.assignedInspector.lastName}`
                        : "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[item.status]}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewId(item.id)}
                          aria-label="View"
                          title="View details"
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#BE123C]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {allowCancel && (item.status === "SCHEDULED" || item.status === "OVERDUE") ? (
                          <button
                            type="button"
                            onClick={() => setToCancel(item)}
                            aria-label="Cancel"
                            title="Cancel inspection"
                            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-500">
            {meta.total} inspection{meta.total === 1 ? "" : "s"} · Page {meta.page} of{" "}
            {meta.totalPages}
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

      {scheduleOpen ? (
        <ScheduleInspectionModal
          onClose={() => setScheduleOpen(false)}
          onScheduled={() => {
            setScheduleOpen(false)
            void load()
          }}
        />
      ) : null}

      {viewId ? <InspectionDetailsModal id={viewId} onClose={() => setViewId(null)} /> : null}

      {toCancel ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl animate-in zoom-in duration-200">
            <div className="flex items-start gap-3 border-b border-slate-100 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <XCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#101828]">Cancel inspection</h3>
                <p className="mt-1 text-sm text-[#667085]">
                  Cancel the inspection for {toCancel.extinguisher.serialNumber} on{" "}
                  {formatDate(toCancel.scheduledDate)}? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5">
              <button
                type="button"
                onClick={() => setToCancel(null)}
                disabled={cancelling}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? <Loader2 className="size-4 animate-spin" /> : null}
                Cancel inspection
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
