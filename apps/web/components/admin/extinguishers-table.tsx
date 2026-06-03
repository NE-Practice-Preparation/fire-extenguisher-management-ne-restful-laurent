"use client"

import * as React from "react"
import Image from "next/image"
import { CalendarPlus, Eye, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react"

import { FormInput, FormSelect } from "@/components/ui/form-field"
import { ScheduleInspectionModal } from "@/components/inspections/schedule-inspection-modal"
import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import {
  createExtinguisher,
  deleteExtinguisher,
  listExtinguishers,
  statusLabel,
  typeLabel,
  updateExtinguisher,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUSES,
  EXTINGUISHER_TYPES,
  type Extinguisher,
  type ExtinguisherStatus,
  type ExtinguisherType,
} from "@/lib/extinguishers"
import { formatDate } from "@/lib/utils/date"

const LIMIT = 8

const STATUS_STYLES: Record<ExtinguisherStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  EXPIRED: "bg-red-50 text-red-700",
  MAINTENANCE_REQUIRED: "bg-amber-50 text-amber-700",
  OUT_OF_SERVICE: "bg-slate-100 text-slate-500",
}

export function ExtinguishersTable({ readOnly = false }: { readOnly?: boolean }) {
  const { toast } = useToast()

  const [items, setItems] = React.useState<Extinguisher[]>([])
  const [meta, setMeta] = React.useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<ExtinguisherType | "">("")
  const [statusFilter, setStatusFilter] = React.useState<ExtinguisherStatus | "">("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  const [formOpen, setFormOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<Extinguisher | null>(null)
  const [viewItem, setViewItem] = React.useState<Extinguisher | null>(null)
  const [requestFor, setRequestFor] = React.useState<Extinguisher | null>(null)
  const [toDelete, setToDelete] = React.useState<Extinguisher | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  React.useEffect(() => {
    setPage(1)
  }, [typeFilter, statusFilter])

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
      const result = await listExtinguishers({
        token: session.token,
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
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
  }, [page, debouncedSearch, typeFilter, statusFilter, toast])

  React.useEffect(() => {
    void load()
  }, [load])

  async function confirmDelete() {
    if (!toDelete) return
    const session = getSession()
    if (!session) return
    setDeleting(true)
    try {
      await deleteExtinguisher(session.token, toDelete.id)
      toast({ type: "success", title: "Extinguisher removed", description: toDelete.serialNumber })
      setToDelete(null)
      await load()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Delete failed"
      toast({ type: "error", title: "Delete failed", description: message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search serial or location"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as ExtinguisherType | "")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
          >
            <option value="">All types</option>
            {EXTINGUISHER_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabel(type)}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ExtinguisherStatus | "")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
          >
            <option value="">All statuses</option>
            {EXTINGUISHER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        {!readOnly ? (
          <button
            type="button"
            onClick={() => {
              setEditItem(null)
              setFormOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239]"
          >
            <Plus className="h-4 w-4" />
            New Extinguisher
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-[#667085]">
              <tr>
                <th className="w-14 px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">Serial</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Expiry</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <p className="text-sm font-medium text-slate-600">No extinguishers found</p>
                    <p className="text-xs text-slate-400">Register one with the button above.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="bg-white transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <ExtinguisherThumb />
                    </td>
                    <td className="px-4 py-3 font-medium text-[#101828]">{item.serialNumber}</td>
                    <td className="px-4 py-3 text-[#475467]">{item.location}</td>
                    <td className="px-4 py-3 text-[#475467]">{typeLabel(item.type)}</td>
                    <td className="px-4 py-3 text-[#475467]">{item.size}</td>
                    <td className="px-4 py-3 text-[#475467]">{formatDate(item.expiryDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[item.status]}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {readOnly ? (
                          <button
                            type="button"
                            onClick={() => setRequestFor(item)}
                            aria-label="Request inspection"
                            title="Request inspection"
                            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#FFF1F2] hover:text-[#BE123C]"
                          >
                            <CalendarPlus className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setViewItem(item)}
                          aria-label="View"
                          title="View details"
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#BE123C]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!readOnly ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditItem(item)
                                setFormOpen(true)
                              }}
                              aria-label="Edit"
                              title="Edit"
                              className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#BE123C]"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setToDelete(item)}
                              aria-label="Delete"
                              title="Delete"
                              className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
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
            {meta.total} extinguisher{meta.total === 1 ? "" : "s"} · Page {meta.page} of{" "}
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

      {viewItem ? (
        <ExtinguisherDetailsModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={
            readOnly
              ? undefined
              : () => {
                  setEditItem(viewItem)
                  setViewItem(null)
                  setFormOpen(true)
                }
          }
          onDelete={
            readOnly
              ? undefined
              : () => {
                  setToDelete(viewItem)
                  setViewItem(null)
                }
          }
          onRequestInspection={
            readOnly
              ? () => {
                  setRequestFor(viewItem)
                  setViewItem(null)
                }
              : undefined
          }
        />
      ) : null}

      {requestFor ? (
        <ScheduleInspectionModal
          presetExtinguisher={{
            id: requestFor.id,
            serialNumber: requestFor.serialNumber,
            location: requestFor.location,
          }}
          onClose={() => setRequestFor(null)}
          onScheduled={() => setRequestFor(null)}
        />
      ) : null}

      {formOpen ? (
        <ExtinguisherFormModal
          item={editItem}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            void load()
          }}
        />
      ) : null}

      {toDelete ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl animate-in zoom-in duration-200">
            <div className="flex items-start gap-3 border-b border-slate-100 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#101828]">Remove extinguisher</h3>
                <p className="mt-1 text-sm text-[#667085]">
                  This permanently deletes {toDelete.serialNumber}. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ExtinguisherThumb({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg border border-[#FFE4E6] bg-[#FFF1F2]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/fire-ext-logo.png"
        alt="Fire extinguisher"
        width={size - 10}
        height={size - 10}
        className="object-contain"
      />
    </div>
  )
}

function ExtinguisherDetailsModal({
  item,
  onClose,
  onEdit,
  onDelete,
  onRequestInspection,
}: {
  item: Extinguisher
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  onRequestInspection?: () => void
}) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Serial number", value: item.serialNumber },
    { label: "Location", value: item.location },
    { label: "Type", value: typeLabel(item.type) },
    { label: "Size", value: item.size },
    { label: "Installation date", value: formatDate(item.installationDate) },
    { label: "Expiry date", value: formatDate(item.expiryDate) },
    {
      label: "Status",
      value: (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[item.status]}`}
        >
          {statusLabel(item.status)}
        </span>
      ),
    },
    { label: "Registered", value: formatDate(item.createdAt) },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <ExtinguisherThumb size={64} />
            <div>
              <h3 className="text-lg font-semibold text-[#101828]">{item.serialNumber}</h3>
              <p className="mt-0.5 text-sm text-[#667085]">{item.location}</p>
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

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-100 bg-slate-100 sm:grid-cols-2 m-6">
          {rows.map((row) => (
            <div key={row.label} className="bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {row.label}
              </p>
              <div className="mt-1 text-sm text-[#101828]">{row.value}</div>
            </div>
          ))}
        </div>

        {onEdit || onDelete || onRequestInspection ? (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-6">
            {onRequestInspection ? (
              <button
                type="button"
                onClick={onRequestInspection}
                className="inline-flex items-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9F1239]"
              >
                <CalendarPlus className="size-4" />
                Request inspection
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            ) : null}
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9F1239]"
              >
                <Pencil className="size-4" />
                Edit
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ExtinguisherFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: Extinguisher | null
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const isEdit = Boolean(item)
  const [serialNumber, setSerialNumber] = React.useState(item?.serialNumber ?? "")
  const [location, setLocation] = React.useState(item?.location ?? "")
  const [type, setType] = React.useState<ExtinguisherType>(item?.type ?? "WATER")
  const [size, setSize] = React.useState(item?.size ?? "")
  const [installationDate, setInstallationDate] = React.useState(
    item?.installationDate ? item.installationDate.slice(0, 10) : ""
  )
  const [expiryDate, setExpiryDate] = React.useState(
    item?.expiryDate ? item.expiryDate.slice(0, 10) : ""
  )
  const [status, setStatus] = React.useState<ExtinguisherStatus>(item?.status ?? "ACTIVE")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const today = new Date().toLocaleDateString("en-CA")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const session = getSession()
    if (!session) return

    // Client-side validation (the API enforces these too).
    if (!isEdit && installationDate < today) {
      setError("Installation date cannot be in the past.")
      return
    }
    if (!isEdit && expiryDate < today) {
      setError("Expiry date cannot be in the past.")
      return
    }
    if (expiryDate < installationDate) {
      setError("Expiry date must be on or after the installation date.")
      return
    }

    setSaving(true)
    setError("")
    const payload = { serialNumber, location, type, size, installationDate, expiryDate, status }
    try {
      if (isEdit && item) {
        await updateExtinguisher(session.token, item.id, payload)
        toast({ type: "success", title: "Extinguisher updated", description: serialNumber })
      } else {
        await createExtinguisher(session.token, payload)
        toast({ type: "success", title: "Extinguisher registered", description: serialNumber })
      }
      onSaved()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Save failed"
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
          <div>
            <h3 className="text-base font-semibold text-[#101828]">
              {isEdit ? "Edit extinguisher" : "Register extinguisher"}
            </h3>
            <p className="mt-1 text-sm text-[#667085]">
              {isEdit ? "Update the extinguisher record." : "Add a new fire extinguisher to the registry."}
            </p>
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
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Serial number" value={serialNumber} onChange={setSerialNumber} placeholder="FE-2026-0001" required />
            <FormSelect
              label="Size"
              value={size}
              onChange={setSize}
              options={EXTINGUISHER_SIZES.map((option) => ({ label: option, value: option }))}
              placeholder="Select size"
              required
            />
          </div>
          <FormInput label="Location" value={location} onChange={setLocation} placeholder="Building A - Floor 2" required />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Type"
              value={type}
              onChange={(value) => setType(value as ExtinguisherType)}
              options={EXTINGUISHER_TYPES.map((option) => ({ label: typeLabel(option), value: option }))}
            />
            <FormSelect
              label="Status"
              value={status}
              onChange={(value) => setStatus(value as ExtinguisherStatus)}
              options={EXTINGUISHER_STATUSES.map((option) => ({ label: statusLabel(option), value: option }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Installation date"
              type="date"
              value={installationDate}
              onChange={setInstallationDate}
              min={isEdit ? undefined : today}
              required
            />
            <FormInput
              label="Expiry date"
              type="date"
              value={expiryDate}
              onChange={setExpiryDate}
              min={isEdit ? undefined : today}
              required
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
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Save changes" : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
