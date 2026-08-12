"use client"

import { OverviewPanel } from "@/dashboard/dashboard/overview-panel"
import { QuickAddBar } from "@/dashboard/quick-add-bar"
import { WarningsBanner } from "@/dashboard/dashboard/warnings-banner"
import { CategoryBreakdown } from "@/dashboard/dashboard/category-breakdown"
import { BorrowedSummary } from "@/dashboard/dashboard/borrowed-summary"
import { RecentTransactions } from "@/dashboard/dashboard/recent-transactions"
import { DashboardFetchError } from "@/dashboard/dashboard/dashboard-fetch-error"
import { DashPage } from "@/dashboard/shared"

export default function DashboardPage() {
  return (
    <DashPage>
      <DashboardFetchError />
      <OverviewPanel />

      <div className="grid w-full min-w-0 gap-4 sm:gap-6 xl:grid-cols-12">
        <div className="w-full min-w-0 space-y-4 sm:space-y-6 xl:col-span-8">
          <CategoryBreakdown />
          <RecentTransactions />
        </div>

        <aside className="w-full min-w-0 space-y-4 sm:space-y-6 xl:col-span-4 xl:sticky xl:top-14 xl:self-start">
          <QuickAddBar />
          <WarningsBanner />
          <BorrowedSummary />
        </aside>
      </div>
    </DashPage>
  )
}
