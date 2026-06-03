import { redirect } from "next/navigation"

export default function UserNotificationsRedirect() {
  redirect("/dashboard/user/overview")
}
