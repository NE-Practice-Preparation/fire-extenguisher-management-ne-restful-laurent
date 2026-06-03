"use client"

import { useState } from "react"
import { Bell, Save, Shield, Upload, User } from "lucide-react"

type UserRole = "applicant" | "super-admin" | "evaluator" | "admin" | "inspector" | "user"

type SharedProfileContainerProps = {
  role: UserRole
  userName?: string
  userEmail?: string
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function SharedProfileContainer({
  role,
  userName = "Template User",
  userEmail = "user@example.com",
}: SharedProfileContainerProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "notifications">(
    "personal"
  )

  const tabs = [
    {
      id: "personal",
      label: "Personal Information",
      icon: User,
    },
    {
      id: "security",
      label: "Security & Password",
      icon: Shield,
    },
    {
      id: "notifications",
      label: "Notification Preferences",
      icon: Bell,
    },
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
                selected
                  ? "bg-[#F9FAFB] text-[#BE123C]"
                  : "text-[#353E49] hover:bg-slate-50"
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
          <div className="space-y-6">
            <div className="flex items-center gap-6 border-b border-slate-100 pb-4">
              <div className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <User className="h-8 w-8 text-slate-400" />

                <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Upload className="mb-1 h-4 w-4 text-white" />
                  <span className="text-[10px] font-medium text-white">Upload</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">Profile Picture</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Upload a high-resolution image to represent your account. Recommended size:
                  256x256px.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ProfileInput label="Full Name" defaultValue={userName} />

              <ProfileInput
                label="Email Address"
                type="email"
                defaultValue={userEmail}
                readOnly
              />

              <ProfileInput label="Job Title / Role" defaultValue={roleLabel(role)} readOnly />

              <ProfileInput label="Phone Number" type="tel" placeholder="+250 123 456 789" />
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#BE123C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9F1239] active:bg-[#881337]"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "security" ? (
          <div className="space-y-6">
            <h3 className="border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">
              Update Password
            </h3>

            <div className="max-w-md space-y-5">
              <ProfileInput label="Current Password" type="password" />
              <ProfileInput label="New Password" type="password" />
              <ProfileInput label="Confirm New Password" type="password" />
            </div>

            <div className="flex justify-start pt-6">
              <button
                type="button"
                className="rounded-lg bg-[#353E49] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Update Security
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "notifications" ? (
          <div className="space-y-6">
            <h3 className="border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">
              Email Preferences
            </h3>

            <div className="max-w-xl space-y-4">
              <NotificationOption
                title="Application Updates"
                description="Receive an email whenever important account or workflow data changes."
                defaultChecked
              />

              <NotificationOption
                title="System Alerts"
                description="Receive immediate notifications regarding maintenance and security events."
                defaultChecked
              />

              <NotificationOption
                title="Weekly Summaries"
                description="Receive a consolidated weekly digest of system activity and pending tasks."
              />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function ProfileInput({
  label,
  type = "text",
  defaultValue,
  placeholder,
  readOnly = false,
}: {
  label: string
  type?: string
  defaultValue?: string
  placeholder?: string
  readOnly?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#344054]">{label}</label>

      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          "h-10 w-full rounded-lg border border-[#D0D5DD] px-3 text-sm text-[#101828] transition-all focus:border-[#BE123C] focus:outline-none focus:ring-1 focus:ring-[#BE123C]",
          readOnly ? "bg-slate-50" : "bg-white"
        )}
      />
    </div>
  )
}

function NotificationOption({
  title,
  description,
  defaultChecked = false,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#BE123C] focus:ring-[#BE123C]"
      />

      <div>
        <h4 className="text-sm font-medium text-slate-900">{title}</h4>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </label>
  )
}

function roleLabel(role: UserRole) {
  if (role === "super-admin") {
    return "Super Administrator"
  }

  if (role === "evaluator") {
    return "Evaluator"
  }

  if (role === "applicant") {
    return "Applicant"
  }

  if (role === "admin") {
    return "Admin"
  }

  if (role === "inspector") {
    return "Inspector"
  }

  return "User"
}
