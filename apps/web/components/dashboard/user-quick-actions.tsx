import Link from "next/link"
import { CalendarPlus, ChevronRight, FlameKindling, History, UserCircle } from "lucide-react"

const quickActions = [
  {
    title: "Schedule Inspection",
    description: "Book an inspection for an extinguisher.",
    href: "/dashboard/user/inspections",
    icon: CalendarPlus,
    color: "#BE123C",
  },
  {
    title: "Fire Extinguishers",
    description: "Browse all extinguishers and their status.",
    href: "/dashboard/user/extinguishers",
    icon: FlameKindling,
    color: "#34C759",
  },
  {
    title: "Inspection History",
    description: "Track your scheduled inspections.",
    href: "/dashboard/user/inspections",
    icon: History,
    color: "#FF8D28",
  },
  {
    title: "My Profile",
    description: "Update your details and password.",
    href: "/dashboard/user/profile",
    icon: UserCircle,
    color: "#64748B",
  },
]

export function UserQuickActions() {
  return (
    <section className="animate-slide-up">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-slate-800">Quick Actions</h2>
        <p className="mt-1 text-[12px] text-slate-500">
          Continue common user tasks without digging through menus.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-[#BE123C]/40 hover:bg-[#FAFDFF]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg border border-[#EAECF0] bg-white p-2.5">
                  <Icon className="h-5 w-5" style={{ color: action.color }} strokeWidth={1.5} />
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#BE123C]" />
              </div>

              <h3 className="text-sm font-semibold text-[#101828]">{action.title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-[#64748B]">
                {action.description}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
