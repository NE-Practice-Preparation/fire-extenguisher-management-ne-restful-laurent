"use client"

import * as React from "react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { BarChart3, Download, Eye, FileDown, FileText, Loader2, Trash2, X } from "lucide-react"

import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import { statusLabel as extinguisherStatusLabel, typeLabel } from "@/lib/extinguishers"
import { statusLabel as inspectionStatusLabel } from "@/lib/inspections"
import { getReportsSummary, type ReportsSummary } from "@/lib/reports"
import { formatDate } from "@/lib/utils/date"

type ReportType = "FULL" | "INVENTORY" | "INSPECTIONS" | "COMPLIANCE" | "MAINTENANCE"

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "FULL", label: "Full summary" },
  { value: "INVENTORY", label: "Inventory report" },
  { value: "INSPECTIONS", label: "Inspection report" },
  { value: "COMPLIANCE", label: "Compliance report" },
  { value: "MAINTENANCE", label: "Maintenance report" },
]

const STORAGE_KEY = "twz-reports-history"

type GeneratedReport = {
  id: string
  type: ReportType
  generatedAt: string
  report: ReportsSummary
}

function typeLabelOf(type: ReportType) {
  return REPORT_TYPES.find((t) => t.value === type)?.label ?? "Report"
}

function sections(type: ReportType) {
  return {
    stock: type === "FULL" || type === "INVENTORY",
    extinguisherStatus: type === "FULL" || type === "INVENTORY",
    inspectionStatus: type === "FULL" || type === "INSPECTIONS",
    compliance: type === "FULL" || type === "COMPLIANCE",
    maintenance: type === "FULL" || type === "MAINTENANCE",
  }
}

function complianceRate(report: ReportsSummary) {
  if (report.stock.total === 0) return 100
  const compliant = report.stock.total - report.expiredExtinguishers.length
  return Math.max(0, Math.round((compliant / report.stock.total) * 100))
}

export function ReportsDashboard() {
  const { toast } = useToast()
  const [type, setType] = React.useState<ReportType>("FULL")
  const [generating, setGenerating] = React.useState(false)
  const [history, setHistory] = React.useState<GeneratedReport[]>([])
  const [viewer, setViewer] = React.useState<{ url: string; entry: GeneratedReport } | null>(null)
  const [toDelete, setToDelete] = React.useState<GeneratedReport | null>(null)

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setHistory(JSON.parse(raw) as GeneratedReport[])
    } catch {
      setHistory([])
    }
  }, [])

  function persist(items: GeneratedReport[]) {
    const trimmed = items.slice(0, 15)
    setHistory(trimmed)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch {
      /* ignore quota errors */
    }
  }

  async function generate() {
    const session = getSession()
    if (!session) {
      toast({ type: "error", title: "Session expired", description: "Please sign in again." })
      return
    }
    setGenerating(true)
    try {
      const report = await getReportsSummary(session.token)
      const entry: GeneratedReport = {
        id: window.crypto.randomUUID(),
        type,
        generatedAt: report.generatedAt,
        report,
      }
      persist([entry, ...history])
      toast({ type: "success", title: "Report generated", description: typeLabelOf(type) })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to generate report"
      toast({ type: "error", title: "Generation failed", description: message })
    } finally {
      setGenerating(false)
    }
  }

  function openViewer(entry: GeneratedReport) {
    const doc = buildPdf(entry.report, entry.type)
    const url = doc.output("bloburl") as unknown as string
    setViewer({ url: String(url), entry })
  }

  function closeViewer() {
    if (viewer) {
      try {
        window.URL.revokeObjectURL(viewer.url)
      } catch {
        /* ignore */
      }
    }
    setViewer(null)
  }

  function confirmRemove() {
    if (!toDelete) return
    persist(history.filter((item) => item.id !== toDelete.id))
    setToDelete(null)
  }

  return (
    <div className="space-y-5">
      {/* Generator card */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#101828]">Generate a report</h2>
              <p className="mt-1 text-sm text-[#667085]">
                Choose a type and generate it. Generated reports are saved below — view or download them anytime.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ReportType)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
            >
              {REPORT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239] disabled:opacity-60"
            >
              {generating ? <Loader2 className="size-4 animate-spin" /> : <BarChart3 className="size-4" />}
              Generate report
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-[#101828]">Generated reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-[#667085]">
              <tr>
                <th className="px-5 py-3 font-medium">Report</th>
                <th className="px-5 py-3 font-medium">Generated</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-14 text-center">
                    <FileText className="mx-auto mb-3 size-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No reports generated yet</p>
                    <p className="text-xs text-slate-400">Pick a type above and click “Generate report”.</p>
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id} className="bg-white transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <span className="font-medium text-[#101828]">{typeLabelOf(entry.type)}</span>
                    </td>
                    <td className="px-5 py-3 text-[#475467]">{formatDate(entry.generatedAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton label="View" onClick={() => openViewer(entry)} icon={<Eye className="size-4" />} />
                        <IconButton
                          label="Download PDF"
                          onClick={() => buildPdf(entry.report, entry.type).save(fileName(entry, "pdf"))}
                          icon={<FileDown className="size-4" />}
                        />
                        <IconButton label="Download CSV" onClick={() => downloadCsv(entry)} icon={<Download className="size-4" />} />
                        <IconButton label="Remove" tone="red" onClick={() => setToDelete(entry)} icon={<Trash2 className="size-4" />} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {viewer ? (
        <PdfViewerModal
          title={`${typeLabelOf(viewer.entry.type)} · ${formatDate(viewer.entry.generatedAt)}`}
          url={viewer.url}
          onDownload={() => buildPdf(viewer.entry.report, viewer.entry.type).save(fileName(viewer.entry, "pdf"))}
          onClose={closeViewer}
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
                <h3 className="text-base font-semibold text-[#101828]">Remove report</h3>
                <p className="mt-1 text-sm text-[#667085]">
                  Remove the {typeLabelOf(toDelete.type).toLowerCase()} generated on{" "}
                  {formatDate(toDelete.generatedAt)} from your history? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="size-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function IconButton({
  label,
  icon,
  onClick,
  tone = "slate",
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  tone?: "slate" | "red"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        tone === "red"
          ? "inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          : "inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#BE123C]"
      }
    >
      {icon}
    </button>
  )
}

function PdfViewerModal({
  title,
  url,
  onDownload,
  onClose,
}: {
  title: string
  url: string
  onDownload: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#101828]">Report preview</h3>
              <p className="text-xs text-[#667085]">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-[#BE123C] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#9F1239]"
            >
              <FileDown className="size-4" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100">
          <iframe title="Report PDF" src={url} className="h-full w-full border-0" />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- builders -------------------------------- */

function fileName(entry: GeneratedReport, ext: string) {
  return `fire-extinguisher-${entry.type.toLowerCase()}-report-${entry.generatedAt.slice(0, 10)}.${ext}`
}

function buildPdf(report: ReportsSummary, type: ReportType) {
  const show = sections(type)
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setTextColor(16, 24, 40)
  doc.text("Fire Extinguisher Management", 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(190, 18, 60)
  doc.text("by TWZ LTD", 14, 24)
  doc.setTextColor(71, 84, 103)
  doc.text(`${typeLabelOf(type)} — generated ${formatDate(report.generatedAt)}`, 14, 31)

  let y = 38
  const headStyles = { fillColor: [190, 18, 60] as [number, number, number], textColor: 255 }
  const after = () => {
    const d = doc as unknown as { lastAutoTable?: { finalY: number } }
    y = (d.lastAutoTable?.finalY ?? y) + 8
  }

  if (show.stock) {
    autoTable(doc, {
      startY: y,
      head: [["Stock", "Count"]],
      body: [
        ["Total extinguishers", String(report.stock.total)],
        ["Added today", String(report.stock.daily)],
        ["Added this month", String(report.stock.monthly)],
        ["Added this year", String(report.stock.yearly)],
      ],
      headStyles,
      styles: { fontSize: 9 },
    })
    after()
  }

  if (show.compliance) {
    autoTable(doc, {
      startY: y,
      head: [["Compliance", "Value"]],
      body: [
        ["Compliance rate", `${complianceRate(report)}%`],
        ["Expired units", String(report.expiredExtinguishers.length)],
        ["Total extinguishers", String(report.stock.total)],
      ],
      headStyles,
      styles: { fontSize: 9 },
    })
    after()
  }

  if (show.inspectionStatus) {
    autoTable(doc, {
      startY: y,
      head: [["Inspection status", "Count"]],
      body: report.inspectionStatus.map((item) => [inspectionStatusLabel(item.status), String(item.count)]),
      headStyles,
      styles: { fontSize: 9 },
    })
    after()
  }

  if (show.extinguisherStatus) {
    autoTable(doc, {
      startY: y,
      head: [["Extinguisher status", "Count"]],
      body: report.extinguisherStatus.map((item) => [extinguisherStatusLabel(item.status), String(item.count)]),
      headStyles,
      styles: { fontSize: 9 },
    })
    after()
  }

  if (show.compliance) {
    autoTable(doc, {
      startY: y,
      head: [["Serial", "Location", "Type", "Expiry"]],
      body: report.expiredExtinguishers.length
        ? report.expiredExtinguishers.map((item) => [
            item.serialNumber,
            item.location,
            typeLabel(item.type),
            formatDate(item.expiryDate),
          ])
        : [["—", "No expired extinguishers", "—", "—"]],
      headStyles,
      styles: { fontSize: 9 },
    })
    after()
  }

  if (show.maintenance) {
    autoTable(doc, {
      startY: y,
      head: [["Extinguisher", "Date", "Actions taken", "Conditions noted"]],
      body: report.maintenanceHistory.length
        ? report.maintenanceHistory.map((item) => [
            item.inspection.extinguisher.serialNumber,
            formatDate(item.actionDate),
            item.actionsTaken,
            item.conditionsNoted,
          ])
        : [["—", "—", "No maintenance logged", "—"]],
      headStyles,
      styles: { fontSize: 9 },
    })
    after()
  }

  return doc
}

function downloadCsv(entry: GeneratedReport) {
  const { report, type } = entry
  const show = sections(type)
  const rows: string[][] = [["Section", "Item", "Value", "Date", "Notes"]]
  if (show.stock) {
    rows.push(
      ["Stock", "Total extinguishers", String(report.stock.total), "", ""],
      ["Stock", "Added today", String(report.stock.daily), "", ""],
      ["Stock", "Added this month", String(report.stock.monthly), "", ""],
      ["Stock", "Added this year", String(report.stock.yearly), "", ""]
    )
  }
  if (show.compliance) {
    rows.push(["Compliance", "Compliance rate", `${complianceRate(report)}%`, "", ""])
  }
  if (show.inspectionStatus) {
    report.inspectionStatus.forEach((item) => rows.push(["Inspection status", item.status, String(item.count), "", ""]))
  }
  if (show.extinguisherStatus) {
    report.extinguisherStatus.forEach((item) => rows.push(["Extinguisher status", item.status, String(item.count), "", ""]))
  }
  if (show.compliance) {
    report.expiredExtinguishers.forEach((item) =>
      rows.push(["Expired extinguisher", item.serialNumber, item.location, item.expiryDate, item.status])
    )
  }
  if (show.maintenance) {
    report.maintenanceHistory.forEach((item) =>
      rows.push(["Maintenance", item.inspection.extinguisher.serialNumber, item.actionsTaken, item.actionDate, item.conditionsNoted])
    )
  }

  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName(entry, "csv")
  link.click()
  window.URL.revokeObjectURL(url)
}
