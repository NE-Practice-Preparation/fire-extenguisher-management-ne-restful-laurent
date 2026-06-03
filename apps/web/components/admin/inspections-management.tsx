"use client"

import * as React from "react"
import { ClipboardCheck, Eye, Loader2, Search, Send, UserCheck, X } from "lucide-react"

import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import {
  assignInspector,
  listInspections,
  statusLabel,
  INSPECTION_STATUSES,
  type Inspection,
  type InspectionStatus,
} from "@/lib/inspections"
import { listUsers, type ManagedUser } from "@/lib/users"
import { formatDate } from "@/lib/utils/date"

const LIMIT = 8

const STATUS_STYLES: Record<InspectionStatus, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  OVERDUE: "bg-red-50 text-red-700",
}

export function InspectionsManagement() {
  const { toast } = useToast()
  const [items, setItems] = React.useState<Inspection[]>([])
  const [meta, setMeta] = React.useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<InspectionStatus | "">("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [assignTarget, setAssignTarget] = React.useState<Inspection | null>(null)
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
      const message = caught instanceof Error ? caught.message : "Unable to load inspections"
      setError(message)
      toast({ type: "error", title: "Failed to load", description: message })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, toast])

  React.useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
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
        <div className="rounded-lg border border-[#FFE4E6] bg-[#FFF1F2] px-3 py-2 text-sm text-[#BE123C]">
          {meta.total} requested inspection{meta.total === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-[#667085]">
              <tr>
                <th className="px-4 py-3 font-medium">Extinguisher</th>
                <th className="px-4 py-3 font-medium">Requested by</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
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
                    <ClipboardCheck className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No requested inspections</p>
                    <p className="text-xs text-slate-400">
                      User requests will appear here for assignment.
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
                      {item.createdBy.firstName} {item.createdBy.lastName}
                    </td>
                    <td className="px-4 py-3 text-[#475467]">
                      <p>{formatDate(item.scheduledDate)}</p>
                      <p className="text-xs text-slate-400">{item.scheduledTime}</p>
                    </td>
                    <td className="px-4 py-3 text-[#475467]">
                      {item.assignedInspector
                        ? `${item.assignedInspector.firstName} ${item.assignedInspector.lastName}`
                        : "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
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
                            onClick={() => setAssignTarget(item)}
                            aria-label="Assign inspector"
                            title="Assign inspector"
                            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#FFF1F2] hover:text-[#BE123C]"
                          >
                            <UserCheck className="h-4 w-4" />
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

      {assignTarget ? (
        <AssignInspectorModal
          inspection={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => {
            setAssignTarget(null)
            void load()
          }}
        />
      ) : null}

      {viewTarget ? (
        <InspectionSummaryModal inspection={viewTarget} onClose={() => setViewTarget(null)} />
      ) : null}
    </div>
  )
}

function AssignInspectorModal({
  inspection,
  onClose,
  onAssigned,
}: {
  inspection: Inspection
  onClose: () => void
  onAssigned: () => void
}) {
  const { toast } = useToast()
  const [inspectors, setInspectors] = React.useState<ManagedUser[]>([])
  const [selectedId, setSelectedId] = React.useState(inspection.assignedInspectorId ?? "")
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const session = getSession()
    if (!session) {
      setError("Please sign in again.")
      setLoading(false)
      return
    }

    listUsers({ token: session.token, role: "INSPECTOR", limit: 100 })
      .then((result) => setInspectors(result.data.filter((user) => user.isActive)))
      .catch((caught) => {
        const message = caught instanceof Error ? caught.message : "Unable to load inspectors"
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = inspectors.filter((inspector) => {
    const query = search.toLowerCase()
    return (
      inspector.firstName.toLowerCase().includes(query) ||
      inspector.lastName.toLowerCase().includes(query) ||
      inspector.email.toLowerCase().includes(query)
    )
  })

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const session = getSession()
    if (!session) return
    if (!selectedId) {
      setError("Choose an inspector.")
      return
    }

    setSaving(true)
    setError("")
    try {
      await assignInspector(session.token, inspection.id, selectedId)
      const inspector = inspectors.find((item) => item.id === selectedId)
      toast({
        type: "success",
        title: "Inspector assigned",
        description: inspector
          ? `${inspector.firstName} ${inspector.lastName} was notified by email.`
          : "The inspector was notified by email.",
      })
      onAssigned()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Assignment failed"
      setError(message)
      toast({ type: "error", title: "Assignment failed", description: message })
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
              <UserCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#101828]">Assign inspector</h3>
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
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-[#475467]">
            Scheduled for {formatDate(inspection.scheduledDate)} at {inspection.scheduledTime}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Inspector</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search inspector"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
              />
            </div>
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-slate-100 p-1">
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading inspectors
                </div>
              ) : filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-400">No active inspectors found.</p>
              ) : (
                filtered.map((inspector) => (
                  <button
                    key={inspector.id}
                    type="button"
                    onClick={() => setSelectedId(inspector.id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      selectedId === inspector.id
                        ? "bg-[#FFF1F2] text-[#BE123C]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-medium">
                      {inspector.firstName} {inspector.lastName}
                    </span>
                    <span className="text-xs text-slate-400">{inspector.email}</span>
                  </button>
                ))
              )}
            </div>
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
              disabled={saving || loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#BE123C] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239] disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Assign & notify
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function InspectionSummaryModal({
  inspection,
  onClose,
}: {
  inspection: Inspection
  onClose: () => void
}) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Extinguisher", value: inspection.extinguisher.serialNumber },
    { label: "Location", value: inspection.extinguisher.location },
    { label: "Requested by", value: `${inspection.createdBy.firstName} ${inspection.createdBy.lastName}` },
    {
      label: "Inspector",
      value: inspection.assignedInspector
        ? `${inspection.assignedInspector.firstName} ${inspection.assignedInspector.lastName}`
        : "Unassigned",
    },
    { label: "Scheduled date", value: formatDate(inspection.scheduledDate) },
    { label: "Time", value: inspection.scheduledTime },
    { label: "Notes", value: inspection.notes || "-" },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
              <ClipboardCheck className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#101828]">Inspection details</h3>
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
            {rows.map((row) => (
              <div key={row.label} className="bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {row.label}
                </p>
                <div className="mt-1 text-sm text-[#101828]">{row.value}</div>
              </div>
            ))}
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
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#101828]">
                        {formatDate(activity.actionDate)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {activity.inspector
                          ? `${activity.inspector.firstName} ${activity.inspector.lastName}`
                          : "Unknown inspector"}
                      </p>
                    </div>
                    <p className="text-sm text-[#475467]">{activity.actionsTaken}</p>
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

function StatusBadge({ status }: { status: InspectionStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}
    >
      {statusLabel(status)}
    </span>
  )
}
