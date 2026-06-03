import type { Metadata } from "next"

import { AuthCard } from "@/components/auth-card"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Restful Template account.",
}

export default function LoginPage() {
  return <AuthCard mode="login" />
}
