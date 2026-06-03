import type { Metadata } from "next"

import { AuthCard } from "@/components/auth-card"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Fire Extinguisher Management account.",
}

export default function SignupPage() {
  return <AuthCard mode="signup" />
}
