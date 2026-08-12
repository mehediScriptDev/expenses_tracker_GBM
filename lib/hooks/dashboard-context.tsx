"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth"
import { useStore } from "@/lib/store"
import * as dashboardApi from "@/lib/api/dashboard"
import * as insightsApi from "@/lib/api/insights"
import * as transactionsApi from "@/lib/api/transactions"
import * as notificationsApi from "@/lib/api/notifications"
import { mapTransaction } from "@/lib/api/mappers"
import { ApiError } from "@/lib/api/client"
import type {
  BackendDashboard,
  BackendMonthlySummary,
  BackendNotification,
} from "@/lib/api/types"
import type { Transaction } from "@/types"

type DashboardContextValue = {
  dashboard: BackendDashboard | null
  summary: BackendMonthlySummary | null
  recentTransactions: Transaction[]
  notifications: BackendNotification[]
  loading: boolean
  error: string | null
  reload: () => void
}

const DashboardContext = React.createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated: authHydrated } = useAuth()
  const { transactionRevision } = useStore()

  const [dashboard, setDashboard] = React.useState<BackendDashboard | null>(null)
  const [summary, setSummary] = React.useState<BackendMonthlySummary | null>(null)
  const [recentTransactions, setRecentTransactions] = React.useState<Transaction[]>([])
  const [notifications, setNotifications] = React.useState<BackendNotification[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadToken, setReloadToken] = React.useState(0)

  const reload = React.useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  React.useEffect(() => {
    if (!authHydrated || !isAuthenticated) {
      setDashboard(null)
      setSummary(null)
      setRecentTransactions([])
      setNotifications([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const results = await Promise.allSettled([
        dashboardApi.getDashboard(),
        insightsApi.getCurrentMonthSummary(),
        transactionsApi.listTransactions({ page: 1, limit: 6, scope: "all" }),
        notificationsApi.listNotifications(10),
      ])

      if (cancelled) return

      const errors: string[] = []

      if (results[0].status === "fulfilled") {
        setDashboard(results[0].value)
      } else {
        setDashboard(null)
        errors.push(formatLoadError(results[0].reason, "Dashboard"))
      }

      if (results[1].status === "fulfilled") {
        setSummary(results[1].value)
      } else {
        setSummary(null)
        errors.push(formatLoadError(results[1].reason, "Insights"))
      }

      if (results[2].status === "fulfilled") {
        setRecentTransactions(results[2].value.transactions.map(mapTransaction))
      } else {
        setRecentTransactions([])
        errors.push(formatLoadError(results[2].reason, "Transactions"))
      }

      if (results[3].status === "fulfilled") {
        setNotifications(results[3].value.notifications)
      } else {
        setNotifications([])
        errors.push(formatLoadError(results[3].reason, "Notifications"))
      }

      setError(errors.length > 0 ? errors.join(" · ") : null)
      setLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [authHydrated, isAuthenticated, transactionRevision, reloadToken])

  const value = React.useMemo<DashboardContextValue>(
    () => ({
      dashboard,
      summary,
      recentTransactions,
      notifications,
      loading,
      error,
      reload,
    }),
    [dashboard, summary, recentTransactions, notifications, loading, error, reload],
  )

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  )
}

function formatLoadError(reason: unknown, label: string) {
  const message =
    reason instanceof ApiError || reason instanceof Error
      ? reason.message
      : "Request failed."
  return `${label}: ${message}`
}

export function useDashboardData() {
  const ctx = React.useContext(DashboardContext)
  if (!ctx) {
    throw new Error("useDashboardData must be used within DashboardProvider")
  }
  return ctx
}
