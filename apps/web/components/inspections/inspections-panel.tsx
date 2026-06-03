"use client"

import * as React from "react"
import { CalendarPlus, Loader2, Search, X, XCircle } from "lucide-react"

import { FormInput, FormSelect } from "@/components/ui/form-field"
import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import { listExtinguishers, type Extinguisher } from "@/lib/extinguishers"
import {
  cancelInspection,
  listInspections,
  scheduleInspection,
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

export function InspectionsPanel() {
  const { toast } = useToast()
  const [items, setItems] = React.useState<Inspection[]>([])
  const [meta, setMeta] = React.useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<InspectionStatus | "">("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [cancelling, setCancelling] = React.useState<string | null>(null)

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

  async function cancel(id: string) {
    const session = getSession()
    if (!session) return
    setCancelling(id)
    try {
      await cancelInspection(session.token, id)
      toast({ type: "success", title: "Inspection cancelled" })
      await load()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Cancel failed"
      toast({ type: "error", title: "Cancel failed", description: message })
    } finally {
      setCancelling(null)
    }
  }

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

        <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239]"
        >
          <CalendarPlus className="h-4 w-4" />
          Schedule Inspection
        </button>
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
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
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
                    <p className="text-sm font-medium text-slate-600">No inspections yet</p>
                    <p className="text-xs text-slate-400">
                      Schedule one with the button above.
                    </p>
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
                      <div className="flex items-center justify-end">
                        {item.status === "SCHEDULED" || item.status === "OVERDUE" ? (
                          <button
                            type="button"
                            onClick={() => cancel(item.id)}
                            disabled={cancelling === item.id}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {cancelling === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
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
        <ScheduleModal
          onClose={() => setScheduleOpen(false)}
          onScheduled={() => {
            setScheduleOpen(false)
            void load()
          }}
        />
      ) : null}
    </div>
  )
}

function ScheduleModal({ onClose, onScheduled }: { onClose: () => void; onScheduled: () => void }) {
  const { toast } = useToast()
  const [extinguishers, setExtinguishers] = React.useState<Extinguisher[]>([])
  const [loadingList, setLoadingList] = React.useState(true)
  const [extinguisherId, setExtinguisherId] = React.useState("")
  const [scheduledDate, setScheduledDate] = React.useState("")
  const [scheduledTime, setScheduledTime] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const session = getSession()
    if (!session) return
    listExtinguishers({ token: session.token, page: 1, limit: 100 })
      .then((result) => setExtinguishers(result.data))
      .catch(() => setExtinguishers([]))
      .finally(() => setLoadingList(false))
  }, [])

  const filtered = extinguishers.filter((item) => {
    const query = search.toLowerCase()
    return (
      item.serialNumber.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    )
  })

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const session = getSession()
    if (!session) return
    if (!extinguisherId) {
      setError("Select an extinguisher.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await scheduleInspection(session.token, { extinguisherId, scheduledDate, scheduledTime, notes: notes || undefined })
      toast({ type: "success", title: "Inspection scheduled", description: "We'll keep you posted." })
      onScheduled()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not schedule"
      setError(message)
      toast({ type: "error", title: "Schedule failed", description: message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
              <CalendarPlus className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#101828]">Schedule inspection</h3>
              <p className="mt-1 text-sm text-[#667085]">
                Pick an extinguisher and a date for its inspection.
              </p>
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

        <form onSubmit={submit} className="space-y-5 p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Extinguisher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search serial or location"
                className="mb-2 w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
              />
            </div>
            {loadingList ? (
              <div className="flex items-center gap-2 py-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading extinguishers…
              </div>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-100 p-1">
                {filtered.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-slate-400">No extinguishers found.</p>
                ) : (
                  filtered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExtinguisherId(item.id)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        extinguisherId === item.id
                          ? "bg-[#FFF1F2] text-[#BE123C]"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-medium">{item.serialNumber}</span>
                      <span className="text-xs text-slate-400">{item.location}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Date" type="date" value={scheduledDate} onChange={setScheduledDate} required />
            <FormInput label="Time" type="time" value={scheduledTime} onChange={setScheduledTime} required />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-slate-700">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Anything the inspector should know"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#BE123C] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239] disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
