import type { Metadata } from "next"

import { AuthCard } from "@/components/auth-card"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Fire Extinguisher Management account.",
}

export default function LoginPage() {
  return <AuthCard mode="login" />
}
