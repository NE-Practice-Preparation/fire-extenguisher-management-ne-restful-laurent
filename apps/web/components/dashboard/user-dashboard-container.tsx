import { UserEmptyState } from "./user-empty-state"
import { UserKpiCards } from "./user-kpi-cards"
import { UserQuickActions } from "./user-quick-actions"

export function UserDashboardContainer() {
  const hasEntries = false

  return (
    <div className="space-y-6">
      <UserKpiCards />
      <UserQuickActions />
      {hasEntries ? null : <UserEmptyState />}
    </div>
  )
}
