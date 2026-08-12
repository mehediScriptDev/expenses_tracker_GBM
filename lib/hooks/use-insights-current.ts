"use client"

import * as React from "react"
import * as insightsApi from "@/lib/api/insights"
import { ApiError } from "@/lib/api/client"
import type { BackendMonthlySummary } from "@/lib/api/types"

export function useInsightsCurrent(revision: number) {
  const [summary, setSummary] = React.useState<BackendMonthlySummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await insightsApi.getCurrentMonthSummary()
        if (!cancelled) setSummary(data)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load insights."
        setError(message)
        setSummary(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [revision])

  return { summary, loading, error }
}
