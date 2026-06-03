"use client"

import * as React from "react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import {
  AlertTriangle,
  BarChart3,
  Download,
  FileDown,
  FileText,
  Flame,
  Loader2,
  ShieldCheck,
} from "lucide-react"

import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import { statusLabel as extinguisherStatusLabel, typeLabel } from "@/lib/extinguishers"
import { statusLabel as inspectionStatusLabel } from "@/lib/inspections"
import {
  getReportsSummary,
  type MaintenanceHistoryReportItem,
  type ReportsSummary,
} from "@/lib/reports"
import { formatDate } from "@/lib/utils/date"

type ReportType = "FULL" | "INVENTORY" | "INSPECTIONS" | "COMPLIANCE" | "MAINTENANCE"

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "FULL", label: "Full summary" },
  { value: "INVENTORY", label: "Inventory report" },
  { value: "INSPECTIONS", label: "Inspection report" },
  { value: "COMPLIANCE", label: "Compliance report" },
  { value: "MAINTENANCE", label: "Maintenance report" },
]

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
  const [report, setReport] = React.useState<ReportsSummary | null>(null)
  const [generatedType, setGeneratedType] = React.useState<ReportType>("FULL")
  const [generating, setGenerating] = React.useState(false)

  async function generate() {
    const session = getSession()
    if (!session) {
      toast({ type: "error", title: "Session expired", description: "Please sign in again." })
      return
    }
    setGenerating(true)
    try {
      const data = await getReportsSummary(session.token)
      setReport(data)
      setGeneratedType(type)
      toast({ type: "success", title: "Report generated", description: REPORT_TYPES.find((t) => t.value === type)?.label })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to generate report"
      toast({ type: "error", title: "Generation failed", description: message })
    } finally {
      setGenerating(false)
    }
  }

  const show = sections(generatedType)

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
                Choose a report type and generate it, then download it as a PDF.
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

        {report ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#667085]">
              <span className="font-medium text-[#101828]">
                {REPORT_TYPES.find((t) => t.value === generatedType)?.label}
              </span>{" "}
              · generated {formatDate(report.generatedAt)}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => downloadCsv(report, generatedType)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Download className="size-4" />
                Download CSV
              </button>
              <button
                type="button"
                onClick={() => downloadPdf(report, generatedType)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239]"
              >
                <FileDown className="size-4" />
                Download PDF
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Empty state */}
      {!report ? (
        <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-slate-200 bg-white">
          <div className="text-center">
            <FileText className="mx-auto mb-3 size-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No report generated yet</p>
            <p className="text-xs text-slate-400">Pick a type above and click “Generate report”.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {show.stock ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Flame} label="Total stock" value={report.stock.total} detail="All extinguishers" />
              <MetricCard icon={BarChart3} label="Added today" value={report.stock.daily} detail="Last 24 hours" />
              <MetricCard icon={BarChart3} label="Added this month" value={report.stock.monthly} detail="Monthly intake" />
              <MetricCard icon={BarChart3} label="Added this year" value={report.stock.yearly} detail="Yearly intake" />
            </div>
          ) : null}

          {show.compliance ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard icon={ShieldCheck} label="Compliance rate" value={complianceRate(report)} detail="% within expiry" suffix="%" />
              <MetricCard icon={AlertTriangle} label="Expired units" value={report.expiredExtinguishers.length} detail="Out of compliance" tone="danger" />
              <MetricCard icon={Flame} label="Total stock" value={report.stock.total} detail="All extinguishers" />
            </div>
          ) : null}

          {(show.inspectionStatus || show.extinguisherStatus) ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {show.inspectionStatus ? (
                <ReportPanel title="Inspection Status">
                  <StatusBars items={report.inspectionStatus.map((item) => ({ label: inspectionStatusLabel(item.status), count: item.count }))} />
                </ReportPanel>
              ) : null}
              {show.extinguisherStatus ? (
                <ReportPanel title="Extinguisher Status">
                  <StatusBars items={report.extinguisherStatus.map((item) => ({ label: extinguisherStatusLabel(item.status), count: item.count }))} />
                </ReportPanel>
              ) : null}
            </div>
          ) : null}

          {show.compliance ? (
            <ReportPanel title="Expired Extinguishers">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-[#667085]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Serial</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.expiredExtinguishers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                          No expired extinguishers found.
                        </td>
                      </tr>
                    ) : (
                      report.expiredExtinguishers.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium text-[#101828]">{item.serialNumber}</td>
                          <td className="px-4 py-3 text-[#475467]">{item.location}</td>
                          <td className="px-4 py-3 text-[#475467]">{typeLabel(item.type)}</td>
                          <td className="px-4 py-3 text-[#475467]">{item.size}</td>
                          <td className="px-4 py-3 text-red-600">{formatDate(item.expiryDate)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportPanel>
          ) : null}

          {show.maintenance ? (
            <ReportPanel title="Maintenance History">
              <MaintenanceHistoryList items={report.maintenanceHistory} />
            </ReportPanel>
          ) : null}
        </div>
      )}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  suffix = "",
  tone = "brand",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: number
  detail: string
  suffix?: string
  tone?: "brand" | "danger"
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-[#667085]">{label}</span>
        <Icon className={`size-5 ${tone === "danger" ? "text-red-600" : "text-[#BE123C]"}`} strokeWidth={1.5} />
      </div>
      <div className="text-2xl font-semibold text-[#101828]">
        {value}
        {suffix}
      </div>
      <p className="mt-1 text-[13px] text-[#667085]">{detail}</p>
    </div>
  )
}

function ReportPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-[15px] font-medium text-[#101828]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function StatusBars({ items }: { items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((item) => item.count))
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-[#475467]">{item.label}</span>
            <span className="font-medium text-[#101828]">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[#BE123C]" style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MaintenanceHistoryList({ items }: { items: MaintenanceHistoryReportItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-[#667085]">
        No maintenance activity has been logged yet.
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-slate-100 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-[#101828]">{item.inspection.extinguisher.serialNumber}</p>
              <p className="text-xs text-slate-400">{item.inspection.extinguisher.location}</p>
            </div>
            <div className="text-sm text-[#475467]">{formatDate(item.actionDate)}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-slate-400">Actions taken</p>
              <p className="text-sm text-[#475467]">{item.actionsTaken}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-slate-400">Conditions noted</p>
              <p className="text-sm text-[#475467]">{item.conditionsNoted}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Logged by{" "}
            {item.inspector ? `${item.inspector.firstName} ${item.inspector.lastName}` : "Unknown inspector"}
          </p>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------- exports --------------------------------- */

function downloadPdf(report: ReportsSummary, type: ReportType) {
  const show = sections(type)
  const doc = new jsPDF()
  const label = REPORT_TYPES.find((t) => t.value === type)?.label ?? "Report"

  doc.setFontSize(18)
  doc.setTextColor(16, 24, 40)
  doc.text("Fire Extinguisher Management", 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(190, 18, 60)
  doc.text("by TWZ LTD", 14, 24)
  doc.setTextColor(71, 84, 103)
  doc.text(`${label} — generated ${formatDate(report.generatedAt)}`, 14, 31)

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
      styles: { fontSize: 9, cellWidth: "wrap" },
    })
    after()
  }

  doc.save(`fire-extinguisher-${type.toLowerCase()}-report-${new Date().toISOString().slice(0, 10)}.pdf`)
}

function downloadCsv(report: ReportsSummary, type: ReportType) {
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
  link.download = `fire-extinguisher-${type.toLowerCase()}-report-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}
