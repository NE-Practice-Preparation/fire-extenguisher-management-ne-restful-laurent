"use client"

import * as React from "react"
import {
  CheckCheck,
  FileText,
  Loader2,
  Mail,
  PlusCircle,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { EmptyState, Field, Panel, StatsGrid } from "@/components/dashboard-shell"
import { useToast } from "@/components/toast"
import { AppLoader } from "@/components/ui/app-loader"
import { api } from "@/lib/api"
import { getSession } from "@/lib/auth"
import { AdminUser } from "@/lib/types"

export function CreateItemPanel() {
  return (
    <Panel title="Create item" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit.">
      <form className="grid gap-4 lg:grid-cols-2">
        <Field name="name" label="Name" placeholder="Lorem ipsum" />
        <Field name="code" label="Code" placeholder="TMP-001" />
        <Field name="category" label="Category" placeholder="Dolor sit amet" />
        <Field name="amount" label="Amount" placeholder="0" type="number" />
        <div className="flex items-end">
          <Button className="h-10 w-full rounded-lg bg-[#BE123C] text-white hover:bg-[#9F1239]">
            <PlusCircle className="size-4" />
            Save item
          </Button>
        </div>
      </form>
    </Panel>
  )
}

export function RecordsPanel({ compact = false }: { compact?: boolean }) {
  return (
    <Panel
      title={compact ? "Recent records" : "Records"}
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    >
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-[#667085]">
            <tr>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Code</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody />
        </table>
        <div className="p-3">
          <EmptyState text="Lorem ipsum dolor sit amet." />
        </div>
      </div>
    </Panel>
  )
}

export function ReportsPanel() {
  const { toast } = useToast()
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deleting, setDeleting] = React.useState(false)
  const [emailingUserId, setEmailingUserId] = React.useState<string | null>(null)
  const [error, setError] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null)
  const [selectedEmailUser, setSelectedEmailUser] = React.useState<AdminUser | null>(null)

  const loadUsers = React.useCallback(async () => {
    const session = getSession()

    if (!session) {
      setError("Please sign in again to view users.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")

    try {
      const data = await api<AdminUser[]>("/users", { token: session.token })
      setUsers(data)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load users"
      setError(message)
      toast({ type: "error", title: "Users failed to load", description: message })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function confirmDelete() {
    if (!selectedUser) {
      return
    }

    const session = getSession()

    if (!session) {
      setError("Please sign in again to delete users.")
      setSelectedUser(null)
      return
    }

    setDeleting(true)

    try {
      await api<AdminUser>(`/users/${selectedUser.id}`, {
        method: "DELETE",
        token: session.token,
      })
      setUsers((current) => current.filter((user) => user.id !== selectedUser.id))
      toast({
        type: "success",
        title: "User deleted",
        description: `${selectedUser.firstName} ${selectedUser.lastName} was removed.`,
      })
      setSelectedUser(null)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to delete user"
      toast({ type: "error", title: "Delete failed", description: message })
    } finally {
      setDeleting(false)
    }
  }

  async function confirmSendEmail() {
    if (!selectedEmailUser) {
      return
    }

    const session = getSession()

    if (!session) {
      setError("Please sign in again to send email.")
      setSelectedEmailUser(null)
      return
    }

    const userToEmail = selectedEmailUser
    setEmailingUserId(userToEmail.id)

    try {
      const response = await api<{ sent: boolean; reference: string }>(
        `/users/${userToEmail.id}/email`,
        {
          method: "POST",
          token: session.token,
        }
      )
      toast({
        type: "success",
        title: "Email sent",
        description: `Sent to ${userToEmail.email}. Reference ${response.reference}.`,
      })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to send email"
      toast({ type: "error", title: "Email failed", description: message })
    } finally {
      setEmailingUserId(null)
      setSelectedEmailUser(null)
    }
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Users report"
        description="View registered users and remove accounts from the admin portal."
      >
        <StatsGrid
          items={[
            {
              label: "Total users",
              value: users.length,
              detail: "Registered accounts",
              icon: Users,
              iconColor: "#BE123C",
            },
            {
              label: "Role 1 users",
              value: users.filter((user) => user.role === "ROLE1").length,
              detail: "Admin portal access",
              icon: CheckCheck,
              iconColor: "#34C759",
            },
            {
              label: "Role 2 users",
              value: users.filter((user) => user.role === "ROLE2").length,
              detail: "User portal access",
              icon: FileText,
              iconColor: "#FF8D28",
            },
          ]}
        />

        <div className="my-4 flex justify-end">
          <Button
            type="button"
            onClick={() => void loadUsers()}
            disabled={loading}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-[#667085]">
                <tr>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Created</th>
                  <th className="px-3 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[#101828]">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#475467]">{user.email}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {user.role === "ROLE1" ? "Role 1" : "Role 2"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#475467]">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedEmailUser(user)}
                        disabled={emailingUserId === user.id}
                        className="mr-1 inline-flex size-9 items-center justify-center rounded-lg text-[#BE123C] transition-colors hover:bg-[#FFF1F2] disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Send email to ${user.firstName} ${user.lastName}`}
                      >
                        {emailingUserId === user.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Mail className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex size-9 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50"
                        aria-label={`Delete ${user.firstName} ${user.lastName}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading ? (
            <AppLoader label="Loading users" compact />
          ) : null}

          {!loading && error ? (
            <div className="p-3">
              <EmptyState text={error} />
            </div>
          ) : null}
          {!loading && !error && users.length === 0 ? (
            <div className="p-3">
              <EmptyState text="No users found." />
            </div>
          ) : null}
        </div>
      </Panel>

     

      <ConfirmDeleteModal
        deleting={deleting}
        user={selectedUser}
        onCancel={() => setSelectedUser(null)}
        onConfirm={() => void confirmDelete()}
      />
      <ConfirmEmailModal
        sending={!!emailingUserId}
        user={selectedEmailUser}
        onCancel={() => setSelectedEmailUser(null)}
        onConfirm={() => void confirmSendEmail()}
      />
    </div>
  )
}

function ConfirmEmailModal({
  sending,
  user,
  onCancel,
  onConfirm,
}: {
  sending: boolean
  user: AdminUser | null
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!user) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-100 p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
            <Mail className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#101828]">Send email</h3>
            <p className="mt-1 text-sm text-[#667085]">
              Send a generic template email to {user.firstName} {user.lastName} at {user.email}?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9F1239] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Send email
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({
  deleting,
  user,
  onCancel,
  onConfirm,
}: {
  deleting: boolean
  user: AdminUser | null
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!user) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-100 p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Trash2 className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#101828]">Delete user</h3>
            <p className="mt-1 text-sm text-[#667085]">
              This will permanently delete {user.firstName} {user.lastName}. This action cannot
              be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}
