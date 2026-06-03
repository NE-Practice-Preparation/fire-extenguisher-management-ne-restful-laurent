import Link from "next/link"
import { Plus } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export function PrimaryDashboardButton({
  label,
  href,
  className,
}: {
  label: string
  href: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-lg bg-[#0A77FF] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006FE6]",
        className
      )}
    >
      <Plus className="mr-2 h-4 w-4 text-white" />
      <span className="text-white">{label}</span>
    </Link>
  )
}
