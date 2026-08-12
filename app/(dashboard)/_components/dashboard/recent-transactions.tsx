"use client"

import Link from "next/link"
import { useDashboardData } from "@/lib/hooks/dashboard-context"
import { TransactionRow } from "@/dashboard/transactions/transaction-row"
import { useUI } from "@/dashboard/layout/app-shell"
import { DashboardCard, EmptyState, dashLink } from "@/dashboard/shared"
import { Icon } from "@/lib/icon"
import { Button } from "@/components/ui/button"

export function RecentTransactions() {
  const { recentTransactions, loading, error } = useDashboardData()
  const ui = useUI()

  return (
    <DashboardCard
      title="Recent activity"
      description="Your latest transactions"
      action={
        <Link href="/transactions" className={dashLink}>
          View all
        </Link>
      }
      bodyClassName="p-0 sm:p-0"
    >
      {loading ? (
        <div className="p-5 sm:p-6 text-sm text-[var(--dash-text-muted)]">Loading recent activity…</div>
      ) : error && recentTransactions.length === 0 ? (
        <div className="p-5 sm:p-6">
          <EmptyState icon="wifi-off" title="Could not load activity" message={error} />
        </div>
      ) : recentTransactions.length === 0 ? (
        <div className="p-5 sm:p-6">
          <EmptyState
            icon="receipt-text"
            title="No transactions yet"
            message="Add your first expense or income to get started."
            action={
              <Button variant="dash" onClick={ui.openAdd} size="sm" className="h-10 px-5">
                <Icon name="plus" className="size-4" />
                Add transaction
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-1.5 px-2 pb-3 sm:space-y-2 sm:px-4 sm:pb-4">
          {recentTransactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onEdit={ui.openEdit} />
          ))}
        </div>
      )}
    </DashboardCard>
  )
}
