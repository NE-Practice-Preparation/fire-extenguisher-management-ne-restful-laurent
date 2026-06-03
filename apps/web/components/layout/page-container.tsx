"use client"

import * as React from "react"

import { usePageHeader } from "@/lib/context/page-header-context"
import { cn } from "@workspace/ui/lib/utils"

export function PageContainer({
  title,
  description,
  action,
  breadcrumbs,
  hideSidebar,
  noPadding,
  noScroll,
  children,
}: {
  role: string
  title: string
  description: string
  action?: React.ReactNode
  breadcrumbs?: { label: string; href: string }[]
  hideSidebar?: boolean
  noPadding?: boolean
  noScroll?: boolean
  children: React.ReactNode
}) {
  const { setHeader } = usePageHeader()

  React.useEffect(() => {
    setHeader({
      title,
      description,
      action: action ?? null,
      breadcrumbs,
      hideSidebar,
      noPadding,
      noScroll,
    })
  }, [title, description, action, breadcrumbs, hideSidebar, noPadding, noScroll, setHeader])

  return (
    <div className={cn("space-y-6", noScroll && "flex h-full flex-col space-y-0")}>
      <div
        className={cn(
          noPadding ? "p-0" : "pb-6 pt-2 text-left",
          noScroll && "flex flex-1 flex-col overflow-hidden"
        )}
      >
        {children}
      </div>
    </div>
  )
}
