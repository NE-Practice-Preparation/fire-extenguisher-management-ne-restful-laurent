"use client"

import * as React from "react"
import { Check, Eye, EyeOff, Loader2, Save, Shield, User, X } from "lucide-react"

import { useToast } from "@/components/toast"
import { getSession, saveAuth } from "@/lib/auth"
import { changePassword, updateProfile } from "@/lib/profile"

type UserRole = "admin" | "inspector" | "user"

type SharedProfileContainerProps = {
  role: UserRole
  userName?: string
  userEmail?: string
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

const passwordChecks: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "One number", test: (value) => /[0-9]/.test(value) },
  { label: "One special character (!@#$…)", test: (value) => /[^A-Za-z0-9]/.test(value) },
]

export function SharedProfileContainer({ role }: SharedProfileContainerProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = React.useState<"personal" | "security">("personal")

  // Personal info
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [savingProfile, setSavingProfile] = React.useState(false)

  // Security
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [savingPassword, setSavingPassword] = React.useState(false)

  const passwordPassed = passwordChecks.filter((check) => check.test(newPassword)).length
  const passwordStrong = passwordPassed === passwordChecks.length
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword
  const canChangePassword =
    currentPassword.length > 0 && passwordStrong && passwordsMatch && !savingPassword

  React.useEffect(() => {
    const session = getSession()
    if (session) {
      setFirstName(session.user.firstName)
      setLastName(session.user.lastName)
      setEmail(session.user.email)
    }
  }, [])

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    const session = getSession()
    if (!session) return
    setSavingProfile(true)
    try {
      const res = await updateProfile(session.token, { firstName, lastName, email })
      saveAuth(res) // refresh token + stored user (name/email live in the JWT)
      toast({ type: "success", title: "Profile updated", description: "Your changes were saved." })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not save profile"
      toast({ type: "error", title: "Save failed", description: message })
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault()
    const session = getSession()
    if (!session) return

    if (!passwordStrong) {
      toast({
        type: "error",
        title: "Weak password",
        description: "Your new password does not meet all the requirements.",
      })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ type: "error", title: "Passwords do not match", description: "Re-enter the new password." })
      return
    }

    setSavingPassword(true)
    try {
      await changePassword(session.token, { currentPassword, newPassword })
      toast({ type: "success", title: "Password updated", description: "Use your new password next time." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not change password"
      toast({ type: "error", title: "Change failed", description: message })
    } finally {
      setSavingPassword(false)
    }
  }

  const tabs = [
    { id: "personal", label: "Personal Information", icon: User },
    { id: "security", label: "Security & Password", icon: Shield },
  ] as const

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8 md:flex-row">
      <aside className="w-full shrink-0 space-y-1 md:w-64">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const selected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                selected ? "bg-[#F9FAFB] text-[#BE123C]" : "text-[#353E49] hover:bg-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </aside>

      <section className="min-w-0 flex-1">
        {activeTab === "personal" ? (
          <form onSubmit={saveProfile} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ProfileInput label="First Name" value={firstName} onChange={setFirstName} required />
              <ProfileInput label="Last Name" value={lastName} onChange={setLastName} required />
              <ProfileInput label="Email Address" type="email" value={email} onChange={setEmail} required />
              <ProfileInput label="Role" value={roleLabel(role)} readOnly />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 rounded-lg bg-[#BE123C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239] active:bg-[#881337] disabled:opacity-60"
              >
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : null}

        {activeTab === "security" ? (
          <form onSubmit={savePassword} className="space-y-6">
            <h3 className="border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">
              Update Password
            </h3>

            <div className="max-w-md space-y-5">
              <ProfileInput
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                required
              />
              <ProfileInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                required
              />

              {newPassword.length > 0 ? (
                <ul className="space-y-1">
                  {passwordChecks.map((check) => {
                    const passed = check.test(newPassword)
                    return (
                      <li
                        key={check.label}
                        className={cn(
                          "flex items-center gap-1.5 text-[11px]",
                          passed ? "text-green-600" : "text-slate-400"
                        )}
                      >
                        {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {check.label}
                      </li>
                    )
                  })}
                </ul>
              ) : null}

              <ProfileInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />

              {confirmPassword.length > 0 ? (
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-[11px]",
                    passwordsMatch ? "text-green-600" : "text-red-600"
                  )}
                >
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              ) : null}
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="submit"
                disabled={!canChangePassword}
                className="flex items-center gap-2 rounded-lg bg-[#353E49] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update Password
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  )
}

function ProfileInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly = false,
  required = false,
}: {
  label: string
  type?: string
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  required?: boolean
}) {
  const [show, setShow] = React.useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (show ? "text" : "password") : type

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#344054]">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          className={cn(
            "h-10 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm text-[#101828] transition-all focus:border-[#BE123C] focus:outline-none focus:ring-1 focus:ring-[#BE123C]",
            isPassword && "pr-10",
            readOnly ? "bg-slate-50" : "bg-white"
          )}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
          >
            {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function roleLabel(role: UserRole) {
  if (role === "admin") return "Admin"
  if (role === "inspector") return "Inspector"
  return "User"
}
