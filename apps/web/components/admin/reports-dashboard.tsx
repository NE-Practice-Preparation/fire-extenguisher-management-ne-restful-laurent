"use client"

import * as React from "react"
import {
  AlertTriangle,
  BarChart3,
  Download,
  FileDown,
  Flame,
  Loader2,
  RefreshCw,
  Wrench,
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

export function ReportsDashboard() {
  const { toast } = useToast()
  const [report, setReport] = React.useState<ReportsSummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

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
      setReport(await getReportsSummary(session.token))
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load reports"
      setError(message)
      toast({ type: "error", title: "Failed to load reports", description: message })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-slate-100 bg-white text-slate-400">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="size-5 animate-spin" />
          Loading realtime reports
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        {error || "Reports are unavailable."}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="rounded-lg border border-[#FFE4E6] bg-[#FFF1F2] px-4 py-3 text-sm text-[#BE123C]">
          Generated {formatDate(report.generatedAt)}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ActionButton icon={RefreshCw} label="Refresh" onClick={() => void load()} />
          <ActionButton icon={Download} label="Download CSV" onClick={() => downloadCsv(report)} />
          <ActionButton icon={FileDown} label="PDF template" onClick={() => openPdfTemplate(report)} primary />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Flame} label="Total stock" value={report.stock.total} detail="All registered extinguishers" />
        <MetricCard icon={BarChart3} label="Added today" value={report.stock.daily} detail="New records in the last day" />
        <MetricCard icon={BarChart3} label="Added this month" value={report.stock.monthly} detail="Monthly stock intake" />
        <MetricCard icon={AlertTriangle} label="Expired units" value={report.expiredExtinguishers.length} detail="Expired by date or status" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportPanel title="Inspection Status">
          <StatusBars
            items={report.inspectionStatus.map((item) => ({
              label: inspectionStatusLabel(item.status),
              count: item.count,
            }))}
          />
        </ReportPanel>
        <ReportPanel title="Extinguisher Status">
          <StatusBars
            items={report.extinguisherStatus.map((item) => ({
              label: extinguisherStatusLabel(item.status),
              count: item.count,
            }))}
          />
        </ReportPanel>
      </div>

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

      <ReportPanel title="Maintenance History">
        <MaintenanceHistoryList items={report.maintenanceHistory} />
      </ReportPanel>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: number
  detail: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-[#667085]">{label}</span>
        <Icon className="size-5 text-[#BE123C]" strokeWidth={1.5} />
      </div>
      <div className="text-2xl font-semibold text-[#101828]">{value}</div>
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
            <div
              className="h-full rounded-full bg-[#BE123C]"
              style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
            />
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
              <p className="font-medium text-[#101828]">
                {item.inspection.extinguisher.serialNumber}
              </p>
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
            {item.inspector
              ? `${item.inspector.firstName} ${item.inspector.lastName}`
              : "Unknown inspector"}
          </p>
        </div>
      ))}
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239]"
          : "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      }
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

function downloadCsv(report: ReportsSummary) {
  const rows = [
    ["Section", "Item", "Value", "Date", "Notes"],
    ["Stock", "Total extinguishers", String(report.stock.total), "", ""],
    ["Stock", "Added today", String(report.stock.daily), "", ""],
    ["Stock", "Added this month", String(report.stock.monthly), "", ""],
    ["Stock", "Added this year", String(report.stock.yearly), "", ""],
    ...report.inspectionStatus.map((item) => [
      "Inspection status",
      item.status,
      String(item.count),
      "",
      "",
    ]),
    ...report.extinguisherStatus.map((item) => [
      "Extinguisher status",
      item.status,
      String(item.count),
      "",
      "",
    ]),
    ...report.expiredExtinguishers.map((item) => [
      "Expired extinguisher",
      item.serialNumber,
      item.location,
      item.expiryDate,
      item.status,
    ]),
    ...report.maintenanceHistory.map((item) => [
      "Maintenance history",
      item.inspection.extinguisher.serialNumber,
      item.actionsTaken,
      item.actionDate,
      item.conditionsNoted,
    ]),
  ]
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `fire-extinguisher-report-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

function openPdfTemplate(report: ReportsSummary) {
  const win = window.open("", "_blank")
  if (!win) return

  win.document.write(renderPdfTemplate(report))
  win.document.close()
}

function renderPdfTemplate(report: ReportsSummary) {
  const inspectionRows = report.inspectionStatus
    .map(
      (item) =>
        `<tr><td>${inspectionStatusLabel(item.status)}</td><td>${item.count}</td></tr>`
    )
    .join("")
  const expiredRows = report.expiredExtinguishers
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.serialNumber)}</td><td>${escapeHtml(item.location)}</td><td>${escapeHtml(typeLabel(item.type))}</td><td>${formatDate(item.expiryDate)}</td></tr>`
    )
    .join("")
  const maintenanceRows = report.maintenanceHistory
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.inspection.extinguisher.serialNumber)}</td><td>${formatDate(item.actionDate)}</td><td>${escapeHtml(item.actionsTaken)}</td><td>${escapeHtml(item.conditionsNoted)}</td></tr>`
    )
    .join("")

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Fire Extinguisher Report</title>
  <style>
    body { margin: 0; background: #f6f8fb; color: #101828; font-family: Arial, Helvetica, sans-serif; }
    .page { max-width: 960px; margin: 0 auto; padding: 32px; }
    .hero { background: #BE123C; color: white; border-radius: 18px; padding: 28px; }
    .hero h1 { margin: 0; font-size: 30px; }
    .hero p { margin: 8px 0 0; color: #ffe4e6; }
    .actions { display: flex; justify-content: flex-end; margin: 18px 0; }
    button { border: 0; border-radius: 10px; background: #101828; color: white; padding: 12px 16px; font-weight: 700; cursor: pointer; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
    .metric, section { background: white; border: 1px solid #eaecf0; border-radius: 14px; }
    .metric { padding: 18px; }
    .metric span { color: #667085; font-size: 12px; }
    .metric strong { display: block; margin-top: 8px; font-size: 28px; }
    section { margin-top: 16px; overflow: hidden; }
    h2 { margin: 0; padding: 16px 18px; border-bottom: 1px solid #eaecf0; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #eef2f6; text-align: left; vertical-align: top; }
    th { background: #f9fafb; color: #667085; font-size: 11px; text-transform: uppercase; }
    @media print {
      body { background: white; }
      .page { padding: 0; }
      .actions { display: none; }
      .hero, .metric, section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero">
      <h1>Fire Extinguisher Management Report</h1>
      <p>Generated ${formatDate(report.generatedAt)} for TZW LTD compliance and maintenance tracking.</p>
    </div>
    <div class="actions"><button onclick="window.print()"><span>Print or Save as PDF</span></button></div>
    <div class="metrics">
      <div class="metric"><span>Total stock</span><strong>${report.stock.total}</strong></div>
      <div class="metric"><span>Daily stock</span><strong>${report.stock.daily}</strong></div>
      <div class="metric"><span>Monthly stock</span><strong>${report.stock.monthly}</strong></div>
      <div class="metric"><span>Expired units</span><strong>${report.expiredExtinguishers.length}</strong></div>
    </div>
    <section>
      <h2>Inspection Status</h2>
      <table><thead><tr><th>Status</th><th>Total</th></tr></thead><tbody>${inspectionRows}</tbody></table>
    </section>
    <section>
      <h2>Expired Extinguishers</h2>
      <table><thead><tr><th>Serial</th><th>Location</th><th>Type</th><th>Expiry</th></tr></thead><tbody>${expiredRows || `<tr><td colspan="4">No expired extinguishers found.</td></tr>`}</tbody></table>
    </section>
    <section>
      <h2>Maintenance History</h2>
      <table><thead><tr><th>Extinguisher</th><th>Date</th><th>Actions Taken</th><th>Conditions Noted</th></tr></thead><tbody>${maintenanceRows || `<tr><td colspan="4">No maintenance activity has been logged yet.</td></tr>`}</tbody></table>
    </section>
  </div>
</body>
</html>`
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
