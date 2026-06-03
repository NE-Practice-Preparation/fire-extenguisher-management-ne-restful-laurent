import { redirect } from "next/navigation"

export default function UserEntriesRedirect() {
  redirect("/dashboard/user/overview")
}
