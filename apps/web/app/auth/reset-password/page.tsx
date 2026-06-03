import type { Metadata } from "next"
import { Suspense } from "react"

import { PasswordRecoveryCard } from "@/components/password-recovery-card"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your account.",
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <PasswordRecoveryCard mode="reset" />
    </Suspense>
  )
}
