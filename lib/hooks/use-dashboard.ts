"use client"

import * as React from "react"
import * as dashboardApi from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/client"
import type { BackendDashboard } from "@/lib/api/types"

export function useDashboard(revision: number) {
  const [dashboard, setDashboard] = React.useState<BackendDashboard | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await dashboardApi.getDashboard()
        if (!cancelled) setDashboard(data)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load dashboard."
        setError(message)
        setDashboard(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [revision])

  return { dashboard, loading, error }
}
