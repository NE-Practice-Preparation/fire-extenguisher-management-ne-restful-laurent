"use client"

import * as React from "react"
import { ClipboardCheck, Eye, Loader2, PenLine, Wrench, X } from "lucide-react"

import { FormInput } from "@/components/ui/form-field"
import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import {
  completeInspection,
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

export function AssignedInspectionsPanel() {
  const { toast } = useToast()
  const [items, setItems] = React.useState<Inspection[]>([])
  const [meta, setMeta] = React.useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<InspectionStatus | "">("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [completeTarget, setCompleteTarget] = React.useState<Inspection | null>(null)
  const [viewTarget, setViewTarget] = React.useState<Inspection | null>(null)

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
      const message = caught instanceof Error ? caught.message : "Unable to load assigned inspections"
      setError(message)
      toast({ type: "error", title: "Failed to load", description: message })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, toast])

  React.useEffect(() => {
    void load()
  }, [load])

  const pendingCount = items.filter(
    (item) => item.status === "SCHEDULED" || item.status === "OVERDUE"
  ).length

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="rounded-lg border border-[#FFE4E6] bg-[#FFF1F2] p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#BE123C]">
              <ClipboardCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#101828]">Assigned inspection notifications</h2>
              <p className="mt-1 text-sm text-[#667085]">
                New assignments from the admin appear here. Log maintenance after completing the work.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-[13px] text-[#667085]">Pending assignments</p>
          <p className="mt-2 text-2xl font-semibold text-[#101828]">{pendingCount}</p>
        </div>
      </div>

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
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-[#667085]">
              <tr>
                <th className="px-4 py-3 font-medium">Extinguisher</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Requested by</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Maintenance logs</th>
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
                    <Wrench className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No assigned inspections</p>
                    <p className="text-xs text-slate-400">
                      Admin-assigned work will appear here.
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
                    <td className="px-4 py-3 text-[#475467]">
                      <p>{formatDate(item.scheduledDate)}</p>
                      <p className="text-xs text-slate-400">{item.scheduledTime}</p>
                    </td>
                    <td className="px-4 py-3 text-[#475467]">
                      {item.createdBy.firstName} {item.createdBy.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-[#475467]">
                      {item.maintenanceActivities.length}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewTarget(item)}
                          aria-label="View details"
                          title="View details"
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#BE123C]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {item.status === "SCHEDULED" || item.status === "OVERDUE" ? (
                          <button
                            type="button"
                            onClick={() => setCompleteTarget(item)}
                            aria-label="Log maintenance"
                            title="Log maintenance"
                            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#FFF1F2] hover:text-[#BE123C]"
                          >
                            <PenLine className="h-4 w-4" />
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
            {meta.total} assigned inspection{meta.total === 1 ? "" : "s"} · Page {meta.page} of{" "}
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

      {completeTarget ? (
        <MaintenanceLogModal
          inspection={completeTarget}
          onClose={() => setCompleteTarget(null)}
          onSaved={() => {
            setCompleteTarget(null)
            void load()
          }}
        />
      ) : null}

      {viewTarget ? (
        <AssignedInspectionDetailsModal inspection={viewTarget} onClose={() => setViewTarget(null)} />
      ) : null}
    </div>
  )
}

function MaintenanceLogModal({
  inspection,
  onClose,
  onSaved,
}: {
  inspection: Inspection
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [actionsTaken, setActionsTaken] = React.useState("")
  const [actionDate, setActionDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [conditionsNoted, setConditionsNoted] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const session = getSession()
    if (!session) return

    setSaving(true)
    setError("")
    try {
      await completeInspection(session.token, inspection.id, {
        actionsTaken,
        actionDate,
        conditionsNoted,
      })
      toast({
        type: "success",
        title: "Maintenance logged",
        description: `${inspection.extinguisher.serialNumber} was marked complete.`,
      })
      onSaved()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to log maintenance"
      setError(message)
      toast({ type: "error", title: "Save failed", description: message })
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
              <Wrench className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#101828]">Log maintenance activity</h3>
              <p className="mt-1 text-sm text-[#667085]">
                {inspection.extinguisher.serialNumber} at {inspection.extinguisher.location}
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
          <FormInput
            label="Action date"
            type="date"
            value={actionDate}
            onChange={setActionDate}
            required
          />

          <TextAreaField
            label="Actions taken"
            value={actionsTaken}
            onChange={setActionsTaken}
            placeholder="Describe the maintenance actions performed"
          />

          <TextAreaField
            label="Conditions noted"
            value={conditionsNoted}
            onChange={setConditionsNoted}
            placeholder="Describe pressure, damage, expiry, accessibility, or other conditions"
          />

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
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Wrench className="size-4" />}
              Save log
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AssignedInspectionDetailsModal({
  inspection,
  onClose,
}: {
  inspection: Inspection
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
              <ClipboardCheck className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#101828]">Assigned inspection</h3>
              <p className="mt-0.5 text-sm text-[#667085]">{inspection.extinguisher.serialNumber}</p>
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
            <Detail label="Extinguisher" value={inspection.extinguisher.serialNumber} />
            <Detail label="Location" value={inspection.extinguisher.location} />
            <Detail label="Scheduled date" value={formatDate(inspection.scheduledDate)} />
            <Detail label="Time" value={inspection.scheduledTime} />
            <Detail label="Requested by" value={`${inspection.createdBy.firstName} ${inspection.createdBy.lastName}`} />
            <Detail label="Notes" value={inspection.notes || "-"} />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-[#101828]">Maintenance history</h4>
            {inspection.maintenanceActivities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-[#667085]">
                No maintenance activity has been logged yet.
              </div>
            ) : (
              <div className="space-y-2">
                {inspection.maintenanceActivities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-100 p-4">
                    <p className="text-sm font-medium text-[#101828]">
                      {formatDate(activity.actionDate)}
                    </p>
                    <p className="mt-2 text-sm text-[#475467]">{activity.actionsTaken}</p>
                    <p className="mt-2 text-xs text-slate-500">{activity.conditionsNoted}</p>
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

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-[#101828]">{value}</div>
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="block text-xs font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        required
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#BE123C] focus:ring-2 focus:ring-[#BE123C]/20"
      />
    </label>
  )
}

function StatusBadge({ status }: { status: InspectionStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}
    >
      {statusLabel(status)}
    </span>
  )
}
