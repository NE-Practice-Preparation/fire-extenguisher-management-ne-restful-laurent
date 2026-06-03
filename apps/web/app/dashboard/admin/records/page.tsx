import { redirect } from "next/navigation"

export default function AdminRecordsRedirect() {
  redirect("/dashboard/admin/overview")
}
