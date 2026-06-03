import { redirect } from "next/navigation"

export default function UserReviewsRedirect() {
  redirect("/dashboard/user/overview")
}
