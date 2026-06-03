"use client"

import * as React from "react"
import { ClipboardCheck, Loader2, X } from "lucide-react"

import { getSession } from "@/lib/auth"
import { getInspection, statusLabel, type Inspection, type InspectionStatus } from "@/lib/inspections"
import { typeLabel } from "@/lib/extinguishers"
import { formatDate } from "@/lib/utils/date"

const STATUS_STYLES: Record<InspectionStatus, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  OVERDUE: "bg-red-50 text-red-700",
}

export function InspectionDetailsModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [inspection, setInspection] = React.useState<Inspection | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const session = getSession()
    if (!session) {
      setError("Please sign in again.")
      setLoading(false)
      return
    }
    getInspection(session.token, id)
      .then(setInspection)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [id])

  const rows: { label: string; value: React.ReactNode }[] = inspection
    ? [
        { label: "Extinguisher", value: inspection.extinguisher.serialNumber },
        { label: "Location", value: inspection.extinguisher.location },
        { label: "Type", value: typeLabel(inspection.extinguisher.type) },
        { label: "Scheduled date", value: formatDate(inspection.scheduledDate) },
        { label: "Time", value: inspection.scheduledTime },
        {
          label: "Status",
          value: (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[inspection.status]}`}
            >
              {statusLabel(inspection.status)}
            </span>
          ),
        },
        {
          label: "Inspector",
          value: inspection.assignedInspector
            ? `${inspection.assignedInspector.firstName} ${inspection.assignedInspector.lastName}`
            : "Unassigned",
        },
        {
          label: "Requested by",
          value: `${inspection.createdBy.firstName} ${inspection.createdBy.lastName}`,
        },
        { label: "Notes", value: inspection.notes || "—" },
        { label: "Created", value: formatDate(inspection.createdAt) },
      ]
    : []

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
              <p className="mt-0.5 text-sm text-[#667085]">
                {inspection ? inspection.extinguisher.serialNumber : "Loading…"}
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

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-red-600">{error}</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
