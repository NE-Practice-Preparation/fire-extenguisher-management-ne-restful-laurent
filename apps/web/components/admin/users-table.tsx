"use client"

import * as React from "react"
import {
  Ban,
  CheckCircle2,
  Loader2,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  UserPlus,
  X,
} from "lucide-react"

import { FormInput } from "@/components/ui/form-field"
import { useToast } from "@/components/toast"
import { getSession } from "@/lib/auth"
import { Role } from "@/lib/types"
import {
  createUser,
  deleteUser,
  listUsers,
  setUserActive,
  type ManagedUser,
  type UserStatus,
} from "@/lib/users"
import { formatDate } from "@/lib/utils/date"

type TableRole = Extract<Role, "USER" | "INSPECTOR">

const LIMIT = 8

export function UsersTable({ role }: { role: TableRole }) {
  const { toast } = useToast()
  const noun = role === "INSPECTOR" ? "Inspector" : "User"

  const [users, setUsers] = React.useState<ManagedUser[]>([])
  const [meta, setMeta] = React.useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

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
      const result = await listUsers({
        token: session.token,
        role,
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
      })
      setUsers(result.data)
      setMeta(result.meta)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load"
      setError(message)
      toast({ type: "error", title: "Failed to load", description: message })
    } finally {
      setLoading(false)
    }
  }, [role, page, debouncedSearch, toast])

  React.useEffect(() => {
    void load()
  }, [load])

  async function handleAction(
    id: string,
    action: () => Promise<unknown>,
    success: { title: string; description: string }
  ) {
    setBusyId(id)
    try {
      await action()
      toast({ type: "success", ...success })
      await load()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Action failed"
      toast({ type: "error", title: "Action failed", description: message })
    } finally {
      setBusyId(null)
      setConfirm(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${noun.toLowerCase()}s`}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[#BE123C] focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10"
          />
        </div>

        {role === "INSPECTOR" ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239]"
          >
            <Plus className="h-4 w-4" />
            New {noun}
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-[#667085]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <UserPlus className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No {noun.toLowerCase()}s yet</p>
                    {role === "INSPECTOR" ? (
                      <p className="text-xs text-slate-400">
                        Create an inspector to send them a set-password invite.
                      </p>
                    ) : null}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="bg-white transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF1F2] text-xs font-semibold text-[#BE123C]">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </div>
                        <span className="font-medium text-[#101828]">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#475467]">{user.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-[#475467]">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user.isActive ? (
                          <IconButton
                            label="Deactivate"
                            onClick={() =>
                              setConfirm({
                                kind: "deactivate",
                                user,
                              })
                            }
                            icon={<Ban className="h-4 w-4" />}
                            tone="amber"
                          />
                        ) : (
                          <IconButton
                            label="Activate"
                            onClick={() =>
                              setConfirm({
                                kind: "activate",
                                user,
                              })
                            }
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            tone="green"
                          />
                        )}
                        <IconButton
                          label="Delete"
                          onClick={() => setConfirm({ kind: "delete", user })}
                          icon={<Trash2 className="h-4 w-4" />}
                          tone="red"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-500">
            {meta.total} {noun.toLowerCase()}
            {meta.total === 1 ? "" : "s"} · Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages || loading}
              onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {createOpen ? (
        <UserFormModal
          role={role}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false)
            void load()
          }}
        />
      ) : null}

      {confirm ? (
        <ConfirmModal
          state={confirm}
          noun={noun}
          busy={busyId === confirm.user.id}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const token = getSession()!.token
            const { user, kind } = confirm
            if (kind === "delete") {
              return handleAction(user.id, () => deleteUser(token, user.id), {
                title: `${noun} deleted`,
                description: `${user.firstName} ${user.lastName} was removed.`,
              })
            }
            const activate = kind === "activate"
            return handleAction(user.id, () => setUserActive(token, user.id, activate), {
              title: activate ? `${noun} activated` : `${noun} deactivated`,
              description: `${user.firstName} ${user.lastName} is now ${activate ? "active" : "disabled"}.`,
            })
          }}
        />
      ) : null}
    </div>
  )
}

/* ------------------------------- subcomponents ------------------------------ */

function StatusBadge({ status }: { status: UserStatus }) {
  const config = {
    ACTIVE: { label: "Active", dot: "bg-green-500", cls: "bg-green-50 text-green-700" },
    DEACTIVATED: { label: "Deactivated", dot: "bg-slate-400", cls: "bg-slate-100 text-slate-500" },
  }[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${config.cls}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function IconButton({
  label,
  icon,
  onClick,
  tone = "slate",
  busy = false,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  tone?: "slate" | "red" | "amber" | "green"
  busy?: boolean
}) {
  const tones = {
    slate: "text-slate-400 hover:bg-slate-100 hover:text-[#BE123C]",
    red: "text-slate-400 hover:bg-red-50 hover:text-red-600",
    amber: "text-slate-400 hover:bg-amber-50 hover:text-amber-600",
    green: "text-slate-400 hover:bg-green-50 hover:text-green-600",
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      title={label}
      className={`inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
    </button>
  )
}

type ConfirmState = {
  kind: "delete" | "activate" | "deactivate"
  user: ManagedUser
}

function ConfirmModal({
  state,
  noun,
  busy,
  onCancel,
  onConfirm,
}: {
  state: ConfirmState
  noun: string
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const { kind, user } = state
  const config = {
    delete: {
      title: `Delete ${noun.toLowerCase()}`,
      body: `This permanently deletes ${user.firstName} ${user.lastName}. This cannot be undone.`,
      cta: "Delete",
      classes: "bg-red-600 hover:bg-red-700",
      iconWrap: "bg-red-50 text-red-600",
    },
    deactivate: {
      title: `Deactivate ${noun.toLowerCase()}`,
      body: `${user.firstName} ${user.lastName} will no longer be able to sign in.`,
      cta: "Deactivate",
      classes: "bg-amber-500 hover:bg-amber-600",
      iconWrap: "bg-amber-50 text-amber-600",
    },
    activate: {
      title: `Activate ${noun.toLowerCase()}`,
      body: `${user.firstName} ${user.lastName} will be able to sign in again.`,
      cta: "Activate",
      classes: "bg-[#BE123C] hover:bg-[#9F1239]",
      iconWrap: "bg-[#FFF1F2] text-[#BE123C]",
    },
  }[kind]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-start gap-3 border-b border-slate-100 p-5">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${config.iconWrap}`}>
            {kind === "delete" ? <Trash2 className="size-5" /> : kind === "deactivate" ? <Ban className="size-5" /> : <CheckCircle2 className="size-5" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#101828]">{config.title}</h3>
            <p className="mt-1 text-sm text-[#667085]">{config.body}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60 ${config.classes}`}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {config.cta}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserFormModal({
  role,
  onClose,
  onSaved,
}: {
  role: TableRole
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const noun = role === "INSPECTOR" ? "Inspector" : "User"
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const session = getSession()
    if (!session) return
    setSaving(true)
    setError("")
    try {
      await createUser(session.token, { firstName, lastName, email, role })
      toast({
        type: "success",
        title: `${noun} created`,
        description: `An invite to set a password was emailed to ${email}.`,
      })
      onSaved()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Save failed"
      setError(message)
      toast({ type: "error", title: "Save failed", description: message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#101828]">New {noun}</h3>
              <p className="mt-1 text-sm text-[#667085]">
                Enter their details. They&apos;ll get an email to set their password and sign in.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="First name" value={firstName} onChange={setFirstName} placeholder="Alice" required />
            <FormInput label="Last name" value={lastName} onChange={setLastName} placeholder="Uwase" required />
          </div>
          <FormInput
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder={`${noun.toLowerCase()}@ne.rw`}
            required
            icon={Mail}
          />

          {error ? (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#BE123C] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239] disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Create &amp; invite
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
