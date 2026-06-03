"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Bell, LogOut, Menu, User } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { PageHeaderProvider, usePageHeader } from "@/lib/context/page-header-context"
import { clearAuth, dashboardPathForRole, getSession } from "@/lib/auth"
import { AuthUser, Role } from "@/lib/types"
import { AppLoader } from "@/components/ui/app-loader"

type NavItem = {
  id: string
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
}

export function DashboardShell({
  role,
  navItems,
  active,
  onActiveChange,
  children,
}: {
  role: Role
  navItems: NavItem[]
  active: string
  onActiveChange: (id: string) => void
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [ready, setReady] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const session = getSession()

    if (!session) {
      router.replace("/auth/login")
      return
    }

    if (session.user.role !== role) {
      router.replace(dashboardPathForRole(session.user.role))
      return
    }

    setUser(session.user)
    setReady(true)
  }, [role, router])

  const logout = React.useCallback(() => {
    clearAuth()
    router.replace("/auth/login")
  }, [router])

  if (!ready || !user) {
    return <AppLoader label="Loading dashboard" />
  }

  return (
    <PageHeaderProvider>
      <main className="h-svh overflow-hidden bg-white text-[#101828]">
        <div className="grid h-full overflow-hidden md:grid-cols-[272px_minmax(0,1fr)]">
          <aside className="hidden h-full overflow-y-auto border-r border-[#EAECF0] bg-white p-4 md:block">
            <SidebarNav
              active={active}
              navItems={navItems}
              onActiveChange={onActiveChange}
              role={role}
              user={user}
              onLogout={logout}
            />
          </aside>

          {mobileOpen ? (
            <div className="fixed inset-0 z-50 md:hidden">
              <button
                aria-label="Close sidebar"
                className="absolute inset-0 bg-slate-950/30"
                onClick={() => setMobileOpen(false)}
                type="button"
              />
              <aside className="relative h-full w-[280px] overflow-y-auto border-r border-[#EAECF0] bg-white p-4 shadow-xl">
                <SidebarNav
                  active={active}
                  navItems={navItems}
                  onActiveChange={(id) => {
                    onActiveChange(id)
                    setMobileOpen(false)
                  }}
                  role={role}
                  user={user}
                  onLogout={logout}
                />
              </aside>
            </div>
          ) : null}

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            <Topbar
              activeLabel={navItems.find((item) => item.id === active)?.label ?? "Dashboard"}
              onOpenMobile={() => setMobileOpen(true)}
              role={role}
              user={user}
              onLogout={logout}
            />
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">{children}</div>
          </section>
        </div>
      </main>
    </PageHeaderProvider>
  )
}

function SidebarNav({
  role,
  user,
  navItems,
  active,
  onActiveChange,
  onLogout,
}: {
  role: Role
  user: AuthUser
  navItems: NavItem[]
  active: string
  onActiveChange: (id: string) => void
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center gap-3 px-2">
        <Image
          src="/car_logo.png"
          alt="Restful Template logo"
          width={36}
          height={36}
          className="rounded-xl object-contain"
        />
        <div>
          <p className="text-sm font-bold text-[#101828]">Restful Template</p>
          <p className="text-xs text-[#BE123C]">
            {role === "ROLE1" ? "Role 1" : "Role 2"} Portal
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.id === active

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onActiveChange(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors",
                isActive
                  ? "bg-[#F9FAFB] text-[#BE123C]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon
                className={isActive ? "text-[#BE123C]" : "text-[#84888C]"}
                size={20}
                strokeWidth={1.5}
              />
              <span className={isActive ? "text-[#BE123C]" : "text-[#353E49]"}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-1 pt-4">
        <div className="sticky bottom-0 mt-4 flex items-center gap-3 border-t border-[#EAECF0] bg-white px-1 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <span className="text-xs font-semibold text-slate-600">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-[#475467]">{user.email}</p>
          </div>
          <button
            type="button"
            className="text-[#475467] transition-colors hover:text-slate-900"
            aria-label="Log out"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

function Topbar({
  role,
  user,
  activeLabel,
  onOpenMobile,
  onLogout,
}: {
  role: Role
  user: AuthUser
  activeLabel: string
  onOpenMobile: () => void
  onLogout: () => void
}) {
  const { title, description, action, breadcrumbs } = usePageHeader()
  const [open, setOpen] = React.useState(false)

  return (
    <header className="bg-white">
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="-ml-1 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <PortalBreadcrumbs
            breadcrumbs={
              breadcrumbs?.length
                ? breadcrumbs
                : [
                    { label: role === "ROLE1" ? "Role 1" : "Role 2", href: "#" },
                    { label: activeLabel, href: "#" },
                  ]
            }
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 text-[#667085] transition-colors hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>

          <div className="relative ml-1">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={() => setOpen((value) => !value)}
              aria-label="User menu"
            >
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </button>

            {open ? (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg bg-white p-1 shadow-lg ring-1 ring-slate-200">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                <div className="my-1 h-px bg-slate-100" />
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={onLogout}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6">
        <div className="flex w-full border-b border-[#EAECF0] pb-2">
          <div className="flex w-full items-center justify-between gap-10">
            <div>
              <h1 className="text-[18px] leading-tight text-[#101828]">{title}</h1>
              {description ? (
                <p className="mt-1 text-[13px] text-[#64748B]">{description}</p>
              ) : null}
            </div>
            {action}
          </div>
        </div>
      </div>
    </header>
  )
}

function PortalBreadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: { label: string; href: string }[]
}) {
  return (
    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span className="text-[#D0D5DD]">/</span> : null}
              <span className={isLast ? "text-[#BE123C]" : "text-[#667085]"}>
                {crumb.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconColor = "#BE123C",
}: {
  label: string
  value: React.ReactNode
  detail: string
  icon: React.ComponentType<{
    className?: string
    strokeWidth?: number
    style?: React.CSSProperties
  }>
  iconColor?: string
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-[#667085]">{label}</span>
        <Icon className="size-5" strokeWidth={1.5} style={{ color: iconColor }} />
      </div>
      <div className="text-2xl font-semibold text-[#101828]">{value}</div>
      <p className="mt-1 text-[13px] text-[#667085]">{detail}</p>
    </div>
  )
}

export function StatsGrid({
  items,
}: {
  items: {
    label: string
    value: React.ReactNode
    detail: string
    icon: React.ComponentType<{
      className?: string
      strokeWidth?: number
      style?: React.CSSProperties
    }>
    iconColor?: string
  }[]
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </div>
  )
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4">
        <h2 className="text-[15px] font-medium text-[#101828]">{title}</h2>
        {description ? <p className="mt-1 text-[13px] text-[#667085]">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string
  name: string
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium text-slate-700">{label}</span>
      <input
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#BE123C] focus:ring-2 focus:ring-[#BE123C]/20"
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  )
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-[#667085]">
      {text}
    </div>
  )
}
