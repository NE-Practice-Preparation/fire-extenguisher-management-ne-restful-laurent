import { redirect } from "next/navigation"

export default function AdminCreateRedirect() {
  redirect("/dashboard/admin/overview")
}
