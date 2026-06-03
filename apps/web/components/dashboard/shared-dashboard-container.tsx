import { CategoryBreakdownChart } from "./category-breakdown-chart"
import { chartData } from "./dashboard-template-data"
import { DashboardKpiCards } from "./dashboard-kpi-cards"
import { RecentRecordsTable } from "./recent-records-table"
import { RequestedModulesCard } from "./requested-modules-card"
import { StackedAnalyticsChart } from "./stacked-analytics-chart"

export function SharedDashboardContainer() {
  return (
    <div className="space-y-6">
      <DashboardKpiCards />
      <StackedAnalyticsChart data={chartData} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CategoryBreakdownChart />
        <RequestedModulesCard />
      </div>

      <RecentRecordsTable />
    </div>
  )
}
