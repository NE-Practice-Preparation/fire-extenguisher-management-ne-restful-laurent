"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { ArrowLeft, Eye, EyeClosed, KeyRound, Mail, Send } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { DotPatternBackground } from "@/components/layout/dot-pattern-background"
import { useToast } from "@/components/toast"
import { api } from "@/lib/api"

type RecoveryMode = "forgot" | "reset"

const controlRadius = { borderRadius: "8px" }

export function PasswordRecoveryCard({ mode }: { mode: RecoveryMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [done, setDone] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const token = searchParams.get("token") ?? ""
  const isReset = mode === "reset"

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(event.currentTarget)

    try {
      if (isReset) {
        if (!token) {
          throw new Error("Missing or invalid reset link.")
        }
        await api<{ success: boolean; message: string }>("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({
            token,
            newPassword: String(form.get("newPassword")),
          }),
        })
        toast({
          type: "success",
          title: "Password reset",
          description: "You can now log in with your new password.",
        })
        router.push("/auth/login")
      } else {
        await api<{ success: boolean; message: string }>("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: String(form.get("email")) }),
        })
        setDone(true)
        toast({
          type: "success",
          title: "Check your email",
          description: "If an account exists, a reset link has been sent.",
        })
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Request failed"
      setError(message)
      toast({ type: "error", title: "Request failed", description: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid h-screen overflow-hidden text-slate-900 lg:grid-cols-[1fr_480px]">
      <DotPatternBackground>
        <div className="relative z-0 flex h-screen flex-col items-center overflow-y-auto px-6 py-8 lg:px-12 lg:py-10">
          <div className="flex min-h-full w-full items-center justify-center py-6">
            <div className="w-full max-w-sm space-y-7">
              <div className="mb-6 flex justify-center">
                <Image
                  src="/fire-ext-logo.png"
                  alt="Fire Extinguisher Management logo"
                  width={180}
                  height={120}
                  priority
                  className="h-auto w-[160px] object-contain"
                />
              </div>

              <div className="space-y-2.5 text-center">
                <h1 className="text-2xl font-bold text-slate-900">
                  {isReset ? "Set a new password" : "Forgot your password?"}
                </h1>
                <p className="text-sm text-slate-600">
                  {isReset
                    ? "Choose a strong new password for your account."
                    : "Enter your email and we'll send you a reset link."}
                </p>
              </div>

              {done && !isReset ? (
                <div
                  className="border border-[#FFE4E6] bg-[#FFF1F2] p-4 text-center text-sm text-slate-700"
                  style={controlRadius}
                >
                  If an account exists for that email, a password reset link is on its way. Check
                  your inbox and spam folder.
                </div>
              ) : (
                <form className="space-y-5" onSubmit={submit}>
                  {isReset ? (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="newPassword"
                        className="block text-xs font-medium text-slate-700"
                      >
                        New password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="New password"
                          required
                          minLength={8}
                          autoComplete="new-password"
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
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-xs font-medium text-slate-700">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="user@example.com"
                          required
                          autoComplete="email"
                          className="w-full rounded-[2px] border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#BE123C] focus:ring-2 focus:ring-[#BE123C]/20"
                          style={controlRadius}
                        />
                        <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  )}

                  {isReset && !token ? (
                    <p className="rounded-[2px] border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                      This reset link is missing its token. Request a new link.
                    </p>
                  ) : null}

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
                    {isReset ? <KeyRound className="size-4" /> : <Send className="size-4" />}
                    {loading ? "Please wait" : isReset ? "Reset password" : "Send reset link"}
                  </Button>
                </form>
              )}

              <div className="text-center text-sm text-slate-500">
                <button
                  className="inline-flex items-center gap-1.5 font-medium text-[#BE123C] transition hover:text-[#9F1239]"
                  onClick={() => router.push("/auth/login")}
                  type="button"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to login
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
