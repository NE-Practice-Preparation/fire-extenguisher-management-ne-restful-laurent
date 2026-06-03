"use client"

import * as React from "react"
import {
  ArrowDown,
  CheckCheck,
  Clock,
  Eye,
  ListFilter,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { tableRecords } from "./dashboard-template-data"

export function RecentRecordsTable() {
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState(["All time", "US, AU, +4"])

  const filteredData = tableRecords.filter((item) => {
    const query = search.toLowerCase()

    return (
      item.requester.name.toLowerCase().includes(query) ||
      item.requester.email.toLowerCase().includes(query) ||
      item.organization.name.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    )
  })

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <div className="mb-6">
          <h2 className="text-md text-[#101828]">Recent Records</h2>
          <p className="text-xs text-[#64748B]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-100 bg-white py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#BE123C]"
              type="text"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <div
                key={filter}
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-3 text-xs text-[#344054]"
              >
                <span>{filter}</span>
                <X
                  className="h-3 w-3 cursor-pointer text-slate-400 transition-colors hover:text-slate-600"
                  onClick={() =>
                    setActiveFilters((previous) => previous.filter((item) => item !== filter))
                  }
                />
              </div>
            ))}

            <button className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-3 text-xs text-[#344054] transition-colors hover:bg-slate-100">
              <ListFilter className="h-4 w-4 text-slate-500" />
              <span>More filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#EAECF0]">
                <th className="w-10 py-4 pl-6 pr-2 text-right">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded-lg border-[#D0D5DD] text-[#BE123C] focus:ring-[#BE123C]"
                  />
                </th>

                {[
                  "Requester",
                  "Organization",
                  "Category",
                  "Status",
                  "Workflow Stage",
                  "Submitted On",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="py-4 pl-2 pr-6 text-[13px] font-normal text-[#475467]"
                  >
                    <div className="group flex select-none items-start gap-1">
                      <span>{header}</span>
                      {["Requester", "Organization"].includes(header) ? (
                        <ArrowDown className="h-4 w-4 text-[#667085] opacity-0 transition-opacity group-hover:opacity-100" />
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="group transition-all duration-200 odd:bg-[#FAFDFF] hover:bg-slate-50/80"
                >
                  <td className="py-4 pl-6 pr-2 text-right">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded-lg border-[#D0D5DD] text-[#BE123C] focus:ring-[#BE123C]"
                    />
                  </td>

                  <td className="py-4 pl-2 pr-6">
                    <PersonCell
                      avatar={item.requester.avatar}
                      name={item.requester.name}
                      detail={item.requester.email}
                    />
                  </td>

                  <td className="py-4 pl-2 pr-6">
                    <PersonCell
                      avatar={item.organization.logo}
                      name={item.organization.name}
                      detail={item.organization.website}
                      orange
                    />
                  </td>

                  <td className="py-4 pl-2 pr-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-slate-600">
                        {item.category.name}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-[#475467]">
                        {item.category.group}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 pl-2 pr-6">
                    <StatusBadge status={item.status as "Pending" | "Approved" | "Rejected"} />
                  </td>

                  <td className="py-4 pl-2 pr-6">
                    <span className="text-[13px] font-medium text-slate-500">{item.stage}</span>
                  </td>

                  <td className="py-4 pl-2 pr-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-slate-600">
                        {item.submittedOn.split(" ")[0]}
                      </span>
                      <span className="text-[11px] text-[#475467]">
                        {item.submittedOn.split(" ").slice(1).join(" ")}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 pl-2 pr-6">
                    <div className="flex items-start gap-4">
                      <Eye className="h-4 w-4 cursor-pointer text-slate-400 transition-colors hover:text-[#BE123C]" />
                      <Trash2 className="h-4 w-4 cursor-pointer text-slate-400 transition-colors hover:text-red-500" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-white p-6">
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-[#D0D5DD] bg-slate-50 px-4 py-3 text-xs text-[#344054] transition-all hover:bg-slate-100">
              Previous
            </button>
            <button className="rounded-lg border border-[#D0D5DD] bg-slate-50 px-4 py-3 text-xs text-[#344054] transition-all hover:bg-slate-100">
              Next
            </button>
          </div>

          <span className="text-xs text-slate-500">Page 1 of 10</span>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: "Pending" | "Approved" | "Rejected" }) {
  const configs = {
    Pending: {
      text: "text-[#3538CD]",
      border: "border-[#C7D7FE]",
      icon: Clock,
    },
    Approved: {
      text: "text-[#027A48]",
      border: "border-[#ABEFC6]",
      icon: CheckCheck,
    },
    Rejected: {
      text: "text-[#B42318]",
      border: "border-[#FECDCA]",
      icon: TriangleAlert,
    },
  }
  const config = configs[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-medium shadow-none",
        config.border,
        config.text
      )}
    >
      {status}
      <Icon className="ml-1 h-3 w-3 opacity-80" />
    </div>
  )
}

function PersonCell({
  avatar,
  name,
  detail,
  orange = false,
}: {
  avatar: string
  name: string
  detail: string
  orange?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold",
          orange ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"
        )}
      >
        {avatar}
      </div>

      <div className="flex flex-col">
        <span className="text-[13px] text-[#101828]">{name}</span>
        <span className="text-[11px] text-[#475467]">{detail}</span>
      </div>
    </div>
  )
}
