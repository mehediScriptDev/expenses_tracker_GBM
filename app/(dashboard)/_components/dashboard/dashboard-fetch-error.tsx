"use client"

import { useDashboardData } from "@/lib/hooks/dashboard-context"
import { Button } from "@/components/ui/button"
import { Icon } from "@/lib/icon"

export function DashboardFetchError() {
  const { error, loading, reload } = useDashboardData()

  if (loading || !error) return null

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <Icon name="triangle-alert" className="mt-0.5 size-4 shrink-0" />
        <p>
          Could not load live dashboard data from the server.{" "}
          <span className="font-medium">{error}</span>
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={reload}>
        Retry
      </Button>
    </div>
  )
}
