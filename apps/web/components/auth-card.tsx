"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Eye, EyeClosed, Info, Mail, ShieldCheck, User, UserPlus } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { DotPatternBackground } from "@/components/layout/dot-pattern-background"
import { useToast } from "@/components/toast"
import { api } from "@/lib/api"
import { dashboardPathForRole, saveAuth } from "@/lib/auth"
import { AuthResponse } from "@/lib/types"

type AuthMode = "login" | "signup"

const controlRadius = { borderRadius: "8px" }

export function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(event.currentTarget)
    const payload =
      mode === "signup"
        ? {
            firstName: String(form.get("firstName")),
            lastName: String(form.get("lastName")),
            email: String(form.get("email")),
            password: String(form.get("password")),
          }
        : {
            email: String(form.get("email")),
            password: String(form.get("password")),
          }

    try {
      const auth = await api<AuthResponse>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      })
      if (mode === "signup") {
        toast({
          type: "success",
          title: "Account created",
          description: "Your account is ready. Please login to open your dashboard.",
        })
        router.push("/auth/login")
      } else {
        const user = saveAuth(auth)
        toast({
          type: "success",
          title: "Login successful",
          description: `Opening ${user.role.toLowerCase()} dashboard for ${user.firstName}.`,
        })
        router.replace(dashboardPathForRole(user.role))
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Authentication failed"
      setError(message)
      toast({
        type: "error",
        title: "Authentication failed",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  const isSignup = mode === "signup"

  return (
    <main className="grid h-screen overflow-hidden text-slate-900 lg:grid-cols-[1fr_480px]">
      <DotPatternBackground>
        <div className="relative z-0 flex h-screen flex-col items-center overflow-y-auto px-6 py-8 lg:px-12 lg:py-10">
          <div className="flex min-h-full w-full items-center justify-center py-6">
          <div className="w-full max-w-sm space-y-7" data-auth-card-radius="8px">
            <div className="mb-10 flex justify-center">
              <Image
                src="/fire-ext-logo.png"
                alt="Fire Extinguisher Management logo"
                width={180}
                height={120}
                priority
                className="h-auto w-[180px] object-contain"
              />
            </div>

            <div className="space-y-2.5 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Fire Extinguisher Management</h1>
              <p className="text-sm font-medium text-slate-700">
                {isSignup ? "Create Your Account" : "Login Into Your Account"}
              </p>
              {isSignup ? (
                <p className="text-xs text-slate-500">
                  Enter your details to create a user account.
                </p>
              ) : (
                <div className="border border-[#FFE4E6] p-3 text-left" style={controlRadius}>
                  <div className="flex gap-2.5 p-1">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center border border-slate-200 bg-white p-1"
                      style={controlRadius}
                    >
                      <Info className="h-5 w-5 text-[#BE123C]" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-medium text-slate-900">
                        Sign in with your existing account credentials.
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Please enter your email and password to access your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

           

            <form className="space-y-5" onSubmit={submit} autoComplete="on">
              {isSignup ? (
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    name="firstName"
                    label="First name"
                    placeholder="Alice"
                    autoComplete="given-name"
                  />
                  <TextField
                    name="lastName"
                    label="Last name"
                    placeholder="Uwase"
                    autoComplete="family-name"
                  />
                </div>
              ) : null}

              <TextField
                name="email"
                label="Email"
                placeholder="user@example.com"
                type="email"
                autoComplete="email"
                icon={<Mail className="h-4 w-4 text-slate-400" />}
              />

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    className="w-full rounded-[2px] border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#BE123C] focus:ring-2 focus:ring-[#BE123C]/20"
                    style={controlRadius}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeClosed className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!isSignup ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => router.push("/auth/forgot-password")}
                      className="text-xs font-medium text-[#BE123C] transition hover:text-[#9F1239]"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : null}
              </div>

              {error ? (
                <p className="rounded-[2px] border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button
                className="h-auto w-full rounded-[2px] bg-[#BE123C] px-5 py-2.5 text-sm text-white transition hover:bg-[#9F1239]"
                disabled={loading}
                style={controlRadius}
              >
                {isSignup ? <UserPlus className="size-4" /> : <ShieldCheck className="size-4" />}
                {loading ? "Please wait" : isSignup ? "Create account" : "Login"}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
              {isSignup ? "Already have an account? " : "Need an account? "}
              <button
                className="font-medium text-[#BE123C] transition hover:text-[#9F1239]"
                onClick={() => router.push(isSignup ? "/auth/login" : "/auth/signup")}
                type="button"
              >
                {isSignup ? "Login" : "Sign up"}
              </button>
            </div>
          </div>
          </div>
        </div>
      </DotPatternBackground>

      <div className="hidden h-screen overflow-hidden lg:block">
        <Image
          src="/sider.png"
          alt="Fire Extinguisher Management banner"
          width={480}
          height={768}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </main>
  )
}

function TextField({
  label,
  name,
  placeholder,
  type = "text",
  icon = <User className="h-4 w-4 text-slate-400" />,
  autoComplete,
}: {
  label: string
  name: string
  placeholder?: string
  type?: string
  icon?: React.ReactNode
  autoComplete?: React.HTMLInputAutoCompleteAttribute
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="block text-xs font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          id={name}
          className="w-full rounded-[2px] border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#BE123C] focus:ring-2 focus:ring-[#BE123C]/20"
          name={name}
          placeholder={placeholder}
          required
          type={type}
          autoComplete={autoComplete}
          style={controlRadius}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{icon}</div>
      </div>
    </label>
  )
}
