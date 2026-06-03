"use client"

import * as React from "react"
import { CalendarPlus, Loader2, X } from "lucide-react"

import { FormInput, FormSelect } from "@/components/ui/form-field"
import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import { listExtinguishers, type Extinguisher } from "@/lib/extinguishers"
import { scheduleInspection } from "@/lib/inspections"

type PresetExtinguisher = { id: string; serialNumber: string; location: string }

export function ScheduleInspectionModal({
  presetExtinguisher,
  onClose,
  onScheduled,
}: {
  presetExtinguisher?: PresetExtinguisher
  onClose: () => void
  onScheduled: () => void
}) {
  const { toast } = useToast()
  const [extinguishers, setExtinguishers] = React.useState<Extinguisher[]>([])
  const [loadingList, setLoadingList] = React.useState(!presetExtinguisher)
  const [extinguisherId, setExtinguisherId] = React.useState(presetExtinguisher?.id ?? "")
  const [scheduledDate, setScheduledDate] = React.useState("")
  const [scheduledTime, setScheduledTime] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  const today = new Date().toLocaleDateString("en-CA")

  React.useEffect(() => {
    // When the extinguisher is preset (e.g. "Request inspection" from a row),
    // we don't need the full list — the picker is locked to that one.
    if (presetExtinguisher) return
    const session = getSession()
    if (!session) return
    listExtinguishers({ token: session.token, page: 1, limit: 100 })
      .then((result) => setExtinguishers(result.data))
      .catch(() => setExtinguishers([]))
      .finally(() => setLoadingList(false))
  }, [presetExtinguisher])

  const options = presetExtinguisher
    ? [
        {
          label: `${presetExtinguisher.serialNumber} — ${presetExtinguisher.location}`,
          value: presetExtinguisher.id,
        },
      ]
    : extinguishers.map((item) => ({
        label: `${item.serialNumber} — ${item.location}`,
        value: item.id,
      }))

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
      await scheduleInspection(session.token, {
        extinguisherId,
        scheduledDate,
        scheduledTime,
        notes: notes || undefined,
      })
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
          {loadingList ? (
            <div className="flex items-center gap-2 py-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading extinguishers…
            </div>
          ) : (
            <FormSelect
              label="Extinguisher"
              value={extinguisherId}
              onChange={setExtinguisherId}
              options={options}
              placeholder="Select an extinguisher"
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Date"
              type="date"
              value={scheduledDate}
              onChange={setScheduledDate}
              min={today}
              required
            />
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
