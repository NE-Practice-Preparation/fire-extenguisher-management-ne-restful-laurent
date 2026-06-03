import type { Metadata } from "next"
import { Suspense } from "react"

import { PasswordRecoveryCard } from "@/components/password-recovery-card"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your account.",
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <PasswordRecoveryCard mode="forgot" />
    </Suspense>
  )
}
