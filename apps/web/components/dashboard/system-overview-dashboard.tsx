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
import { listExtinguishers } from "@/lib/extinguishers"
import { listInspections, statusLabel, type Inspection, type InspectionStatus } from "@/lib/inspections"
import { getReportsSummary, type ReportsSummary } from "@/lib/reports"
import { Role } from "@/lib/types"
import { formatDate } from "@/lib/utils/date"

const STATUS_COLORS: Record<InspectionStatus, string> = {
  SCHEDULED: "#BE123C",
  COMPLETED: "#16A34A",
  CANCELLED: "#94A3B8",
  OVERDUE: "#E11D48",
}

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
          setAdminReport(await getReportsSummary(session!.token))
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
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (role === "ADMIN" && adminReport) {
    return <AdminOverview report={adminReport} />
  }

  return (
    <RoleOverview
      role={role}
      inspections={inspections}
      extinguisherTotal={extinguisherTotal}
    />
  )
}

function AdminOverview({ report }: { report: ReportsSummary }) {
  const latestMaintenance = report.maintenanceHistory.slice(0, 5)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Flame} label="Total extinguishers" value={report.stock.total} detail="Registered in stock" />
        <MetricCard icon={CalendarCheck} label="Monthly stock" value={report.stock.monthly} detail="Added this month" />
        <MetricCard icon={AlertTriangle} label="Expired units" value={report.expiredExtinguishers.length} detail="Need compliance attention" />
        <MetricCard icon={Wrench} label="Maintenance logs" value={report.maintenanceHistory.length} detail="Recent service history" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <StatusChart
          title="Inspection Status"
          items={report.inspectionStatus.map((item) => ({
            label: statusLabel(item.status),
            value: item.count,
            color: STATUS_COLORS[item.status],
          }))}
        />
        <DonutSummary
          title="Extinguisher Status"
          items={report.extinguisherStatus.map((item, index) => ({
            label: item.status.toLowerCase().replace(/_/g, " "),
            value: item.count,
            color: ["#BE123C", "#E11D48", "#FB7185", "#FFE4E6"][index] ?? "#BE123C",
          }))}
        />
      </div>

      <RecentPanel title="Recent Maintenance" empty="No maintenance logs yet.">
        {latestMaintenance.map((item) => (
          <RecentRow
            key={item.id}
            title={item.inspection.extinguisher.serialNumber}
            detail={`${item.actionsTaken} · ${item.conditionsNoted}`}
            meta={formatDate(item.actionDate)}
          />
        ))}
      </RecentPanel>
    </div>
  )
}

function RoleOverview({
  role,
  inspections,
  extinguisherTotal,
}: {
  role: Role
  inspections: Inspection[]
  extinguisherTotal: number
}) {
  const scheduled = inspections.filter((item) => item.status === "SCHEDULED").length
  const completed = inspections.filter((item) => item.status === "COMPLETED").length
  const overdue = inspections.filter((item) => item.status === "OVERDUE").length
  const maintenanceLogs = inspections.reduce(
    (total, item) => total + item.maintenanceActivities.length,
    0
  )
  const recent = inspections.slice(0, 5)
  const isInspector = role === "INSPECTOR"

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ClipboardList}
          label={isInspector ? "Assigned inspections" : "My inspections"}
          value={inspections.length}
          detail={isInspector ? "Assigned by admin" : "Requested by you"}
        />
        <MetricCard icon={CalendarCheck} label="Scheduled" value={scheduled} detail="Waiting for service" />
        <MetricCard icon={CheckCircle2} label="Completed" value={completed} detail="Finished inspections" />
        <MetricCard
          icon={isInspector ? Wrench : Flame}
          label={isInspector ? "Maintenance logs" : "Available stock"}
          value={isInspector ? maintenanceLogs : extinguisherTotal}
          detail={isInspector ? "Actions logged" : "Extinguishers to inspect"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <StatusChart
          title={isInspector ? "Assigned Work Status" : "My Inspection Status"}
          items={[
            { label: "Scheduled", value: scheduled, color: "#BE123C" },
            { label: "Completed", value: completed, color: "#16A34A" },
            { label: "Overdue", value: overdue, color: "#E11D48" },
            {
              label: "Cancelled",
              value: inspections.filter((item) => item.status === "CANCELLED").length,
              color: "#94A3B8",
            },
          ]}
        />
        <DonutSummary
          title={isInspector ? "Workload Breakdown" : "Request Breakdown"}
          items={[
            { label: "Scheduled", value: scheduled, color: "#BE123C" },
            { label: "Completed", value: completed, color: "#FB7185" },
            { label: "Overdue", value: overdue, color: "#E11D48" },
          ]}
        />
      </div>

      <RecentPanel
        title={isInspector ? "Recent Assigned Inspections" : "Recent Inspection Requests"}
        empty={isInspector ? "No assigned inspections yet." : "No inspection requests yet."}
      >
        {recent.map((item) => (
          <RecentRow
            key={item.id}
            title={item.extinguisher.serialNumber}
            detail={item.extinguisher.location}
            meta={`${formatDate(item.scheduledDate)} · ${statusLabel(item.status)}`}
          />
        ))}
      </RecentPanel>
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
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="rounded-lg border border-[#FFE4E6] bg-[#FFF1F2] p-2">
          <Icon className="size-5 text-[#BE123C]" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#101828]">{value}</p>
      <p className="mt-1 text-[13px] text-[#667085]">{detail}</p>
    </div>
  )
}

function StatusChart({
  title,
  items,
}: {
  title: string
  items: { label: string; value: number; color: string }[]
}) {
  const max = Math.max(1, ...items.map((item) => item.value))

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-[#101828]">{title}</h2>
      </div>
      <div className="space-y-4 p-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-[#475467]">{item.label}</span>
              <span className="font-semibold text-[#101828]">{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#FFF1F2]">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(5, (item.value / max) * 100)}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
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
      ? "#FFF1F2 0 100%"
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
          className="grid size-40 shrink-0 place-items-center rounded-full"
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

function RecentPanel({
  title,
  empty,
  children,
}: {
  title: string
  empty: string
  children: React.ReactNode[]
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-[#101828]">{title}</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {children.length ? (
          children
        ) : (
          <div className="p-5 text-sm text-[#667085]">{empty}</div>
        )}
      </div>
    </section>
  )
}

function RecentRow({ title, detail, meta }: { title: string; detail: string; meta: string }) {
  return (
    <div className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-[#101828]">{title}</p>
        <p className="text-sm text-[#667085]">{detail}</p>
      </div>
      <p className="text-sm text-[#BE123C]">{meta}</p>
    </div>
  )
}
