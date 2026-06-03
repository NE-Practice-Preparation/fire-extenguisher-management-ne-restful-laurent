"use client"

import * as React from "react"
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Flame,
  Loader2,
  Wrench,
} from "lucide-react"

import { getSession } from "@/lib/auth"
import { listExtinguishers, statusLabel as extinguisherStatusLabel } from "@/lib/extinguishers"
import { listInspections, statusLabel, type Inspection } from "@/lib/inspections"
import { getReportsSummary, type ReportsSummary } from "@/lib/reports"
import { Role } from "@/lib/types"
import { formatDate } from "@/lib/utils/date"

import { InspectionsTrendChart, type TrendDatum } from "./inspections-trend-chart"

export function SystemOverviewDashboard({ role }: { role: Role }) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [adminReport, setAdminReport] = React.useState<ReportsSummary | null>(null)
  const [inspections, setInspections] = React.useState<Inspection[]>([])
  const [extinguisherTotal, setExtinguisherTotal] = React.useState(0)

  React.useEffect(() => {
    const session = getSession()
    if (!session) {
      setError("Please sign in again.")
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError("")
      try {
        if (role === "ADMIN") {
          const [report, inspectionResult] = await Promise.all([
            getReportsSummary(session!.token),
            listInspections({ token: session!.token, page: 1, limit: 100 }),
          ])
          setAdminReport(report)
          setInspections(inspectionResult.data)
          return
        }

        const [inspectionResult, extinguisherResult] = await Promise.all([
          listInspections({ token: session!.token, page: 1, limit: 100 }),
          listExtinguishers({ token: session!.token, page: 1, limit: 1 }),
        ])
        setInspections(inspectionResult.data)
        setExtinguisherTotal(extinguisherResult.meta.total)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [role])

  if (loading) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-slate-200 bg-white text-slate-400">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="size-5 animate-spin" />
          Loading dashboard data
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
    )
  }

  if (role === "ADMIN" && adminReport) {
    return <AdminOverview report={adminReport} inspections={inspections} />
  }

  return <RoleOverview role={role} inspections={inspections} extinguisherTotal={extinguisherTotal} />
}

/* --------------------------------- admin ---------------------------------- */

function AdminOverview({ report, inspections }: { report: ReportsSummary; inspections: Inspection[] }) {
  const trend = buildMonthlyTrend(inspections)
  const expired = report.expiredExtinguishers.slice(0, 6)
  const maintenance = report.maintenanceHistory.slice(0, 6)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Flame} label="Total extinguishers" value={report.stock.total} detail="Registered in stock" />
        <MetricCard icon={CalendarCheck} label="Added this month" value={report.stock.monthly} detail="New registrations" />
        <MetricCard icon={AlertTriangle} label="Expired units" value={report.expiredExtinguishers.length} detail="Need attention" tone="danger" />
        <MetricCard icon={Wrench} label="Maintenance logs" value={report.maintenanceHistory.length} detail="Service history" />
      </div>

      <div className="grid gap-4">
        <InspectionsTrendChart title="Monthly Inspections" data={trend} />
        <DonutSummary
          title="Extinguisher Status"
          items={report.extinguisherStatus.map((item, index) => ({
            label: extinguisherStatusLabel(item.status),
            value: item.count,
            color: ["#16A34A", "#E11D48", "#F59E0B", "#94A3B8"][index] ?? "#BE123C",
          }))}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TablePanel title="Expired & expiring units" empty="No expired extinguishers.">
          {expired.length ? (
            <DataTable
              head={["Serial", "Location", "Expiry", "Status"]}
              rows={expired.map((item) => [
                <span key="s" className="font-medium text-[#101828]">{item.serialNumber}</span>,
                item.location,
                formatDate(item.expiryDate),
                <StatusPill key="st" label={extinguisherStatusLabel(item.status)} tone="danger" />,
              ])}
            />
          ) : null}
        </TablePanel>

        <TablePanel title="Recent maintenance" empty="No maintenance logs yet.">
          {maintenance.length ? (
            <DataTable
              head={["Extinguisher", "Action", "Inspector", "Date"]}
              rows={maintenance.map((item) => [
                <span key="s" className="font-medium text-[#101828]">{item.inspection.extinguisher.serialNumber}</span>,
                <span key="a" className="line-clamp-1 block max-w-[180px]">{item.actionsTaken}</span>,
                item.inspector ? `${item.inspector.firstName} ${item.inspector.lastName}` : "—",
                formatDate(item.actionDate),
              ])}
            />
          ) : null}
        </TablePanel>
      </div>
    </div>
  )
}

/* ----------------------------- inspector / user --------------------------- */

function RoleOverview({
  role,
  inspections,
  extinguisherTotal,
}: {
  role: Role
  inspections: Inspection[]
  extinguisherTotal: number
}) {
  const isInspector = role === "INSPECTOR"
  const scheduled = inspections.filter((item) => item.status === "SCHEDULED").length
  const completed = inspections.filter((item) => item.status === "COMPLETED").length
  const overdue = inspections.filter((item) => item.status === "OVERDUE").length
  const cancelled = inspections.filter((item) => item.status === "CANCELLED").length
  const maintenanceLogs = inspections.reduce((total, item) => total + item.maintenanceActivities.length, 0)
  const trend = buildMonthlyTrend(inspections)
  const recent = inspections.slice(0, 6)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ClipboardList}
          label={isInspector ? "Assigned inspections" : "My inspections"}
          value={inspections.length}
          detail={isInspector ? "Assigned by admin" : "Requested by you"}
        />
        <MetricCard icon={CalendarCheck} label="Scheduled" value={scheduled} detail="Awaiting service" />
        <MetricCard icon={CheckCircle2} label="Completed" value={completed} detail="Finished" />
        <MetricCard
          icon={isInspector ? Wrench : Flame}
          label={isInspector ? "Maintenance logs" : "Available stock"}
          value={isInspector ? maintenanceLogs : extinguisherTotal}
          detail={isInspector ? "Actions logged" : "Extinguishers"}
        />
      </div>

      <div className="grid gap-4">
        <InspectionsTrendChart
          title={isInspector ? "My Assigned Work (Monthly)" : "My Inspections (Monthly)"}
          data={trend}
        />
        <DonutSummary
          title={isInspector ? "Workload Breakdown" : "Request Breakdown"}
          items={[
            { label: "Completed", value: completed, color: "#16A34A" },
            { label: "Scheduled", value: scheduled, color: "#BE123C" },
            { label: "Overdue", value: overdue, color: "#FB7185" },
            { label: "Cancelled", value: cancelled, color: "#94A3B8" },
          ]}
        />
      </div>

      <TablePanel
        title={isInspector ? "Recent assigned inspections" : "Recent inspection requests"}
        empty={isInspector ? "No assigned inspections yet." : "No inspection requests yet."}
      >
        {recent.length ? (
          <DataTable
            head={["Extinguisher", "Location", "Scheduled", "Status"]}
            rows={recent.map((item) => [
              <span key="s" className="font-medium text-[#101828]">{item.extinguisher.serialNumber}</span>,
              item.extinguisher.location,
              `${formatDate(item.scheduledDate)} · ${item.scheduledTime}`,
              <StatusPill key="st" label={statusLabel(item.status)} tone={inspectionTone(item.status)} />,
            ])}
          />
        ) : null}
      </TablePanel>
    </div>
  )
}

/* -------------------------------- helpers --------------------------------- */

function buildMonthlyTrend(inspections: Inspection[], months = 6): TrendDatum[] {
  const now = new Date()
  const buckets: { key: string; datum: TrendDatum }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      datum: { label: d.toLocaleString("en", { month: "short" }), completed: 0, scheduled: 0, overdue: 0 },
    })
  }
  const map = new Map(buckets.map((bucket) => [bucket.key, bucket.datum]))

  for (const inspection of inspections) {
    const d = new Date(inspection.scheduledDate)
    const datum = map.get(`${d.getFullYear()}-${d.getMonth()}`)
    if (!datum) continue
    if (inspection.status === "COMPLETED") datum.completed += 1
    else if (inspection.status === "OVERDUE") datum.overdue += 1
    else if (inspection.status === "SCHEDULED") datum.scheduled += 1
  }

  return buckets.map((bucket) => bucket.datum)
}

type Tone = "brand" | "success" | "danger" | "muted"

function inspectionTone(status: Inspection["status"]): Tone {
  if (status === "COMPLETED") return "success"
  if (status === "OVERDUE") return "danger"
  if (status === "CANCELLED") return "muted"
  return "brand"
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "brand",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: number
  detail: string
  tone?: "brand" | "danger"
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div
          className={`rounded-lg border p-2 ${tone === "danger" ? "border-red-100 bg-red-50" : "border-[#FFE4E6] bg-[#FFF1F2]"}`}
        >
          <Icon className={`size-5 ${tone === "danger" ? "text-red-600" : "text-[#BE123C]"}`} strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#101828]">{value}</p>
      <p className="mt-1 text-[13px] text-[#667085]">{detail}</p>
    </div>
  )
}

function DonutSummary({
  title,
  items,
}: {
  title: string
  items: { label: string; value: number; color: string }[]
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  let cursor = 0
  const gradient =
    total === 0
      ? "#F1F5F9 0 100%"
      : items
          .map((item) => {
            const start = cursor
            const end = cursor + (item.value / total) * 100
            cursor = end
            return `${item.color} ${start}% ${end}%`
          })
          .join(", ")

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-[#101828]">{title}</h2>
      </div>
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <div
          className="grid size-36 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="grid size-24 place-items-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#101828]">{total}</p>
              <p className="text-[11px] text-[#667085]">Total</p>
            </div>
          </div>
        </div>
        <div className="grid flex-1 gap-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate capitalize text-[#475467]">{item.label}</span>
              </div>
              <span className="font-medium text-[#101828]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TablePanel({
  title,
  empty,
  children,
}: {
  title: string
  empty: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-[#101828]">{title}</h2>
      </div>
      {children ? children : <div className="p-5 text-sm text-[#667085]">{empty}</div>}
    </section>
  )
}

function DataTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-slate-50 text-xs text-[#667085]">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white transition-colors hover:bg-slate-50/70">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-3 text-[#475467]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  const styles: Record<Tone, string> = {
    brand: "bg-[#FFF1F2] text-[#BE123C]",
    success: "bg-green-50 text-green-700",
    danger: "bg-red-50 text-red-700",
    muted: "bg-slate-100 text-slate-500",
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[tone]}`}>
      {label}
    </span>
  )
}
