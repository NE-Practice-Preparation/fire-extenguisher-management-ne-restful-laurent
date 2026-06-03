"use client"

import * as React from "react"

type Breadcrumb = { label: string; href: string }

type PageHeaderContextValue = {
  title: string
  description: string
  action: React.ReactNode | null
  breadcrumbs?: Breadcrumb[]
  hideSidebar?: boolean
  noPadding?: boolean
  noScroll?: boolean
  setHeader: (header: {
    title?: string
    description?: string
    action?: React.ReactNode | null
    breadcrumbs?: Breadcrumb[]
    hideSidebar?: boolean
    noPadding?: boolean
    noScroll?: boolean
  }) => void
}

const PageHeaderContext = React.createContext<PageHeaderContextValue | undefined>(undefined)

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [headerState, setHeaderState] = React.useState({
    title: "",
    description: "",
    action: null as React.ReactNode | null,
    breadcrumbs: [] as Breadcrumb[] | undefined,
    hideSidebar: false,
    noPadding: false,
    noScroll: false,
  })

  const setHeader = React.useCallback<PageHeaderContextValue["setHeader"]>((newHeader) => {
    setHeaderState((previous) => ({
      title: "title" in newHeader ? (newHeader.title ?? "") : previous.title,
      description:
        "description" in newHeader ? (newHeader.description ?? "") : previous.description,
      action: "action" in newHeader ? (newHeader.action ?? null) : previous.action,
      breadcrumbs:
        "breadcrumbs" in newHeader ? newHeader.breadcrumbs : previous.breadcrumbs,
      hideSidebar:
        "hideSidebar" in newHeader ? (newHeader.hideSidebar ?? false) : previous.hideSidebar,
      noPadding:
        "noPadding" in newHeader ? (newHeader.noPadding ?? false) : previous.noPadding,
      noScroll:
        "noScroll" in newHeader ? (newHeader.noScroll ?? false) : previous.noScroll,
    }))
  }, [])

  const value = React.useMemo(
    () => ({
      ...headerState,
      setHeader,
    }),
    [headerState, setHeader]
  )

  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>
}

export function usePageHeader() {
  const context = React.useContext(PageHeaderContext)

  if (!context) {
    throw new Error("usePageHeader must be used within a PageHeaderProvider")
  }

  return context
}
