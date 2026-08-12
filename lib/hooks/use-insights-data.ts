"use client"

import * as React from "react"
import * as insightsApi from "@/lib/api/insights"
import { ApiError } from "@/lib/api/client"
import type { BackendMonthlySummary } from "@/lib/api/types"

export function useInsightsData(year: number, monthIndex: number) {
  const [summaries, setSummaries] = React.useState<BackendMonthlySummary[]>([])
  const [selectedSummary, setSelectedSummary] = React.useState<BackendMonthlySummary | null>(null)
  const [loadingSummaries, setLoadingSummaries] = React.useState(true)
  const [loadingSelected, setLoadingSelected] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function loadSummaries() {
      setLoadingSummaries(true)
      setError(null)
      try {
        const data = await insightsApi.getMonthlySummaries()
        if (!cancelled) setSummaries(data)
      } catch (err) {
        if (cancelled) return
        setSummaries([])
        setError(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load insights.",
        )
      } finally {
        if (!cancelled) setLoadingSummaries(false)
      }
    }

    void loadSummaries()

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    const month = monthIndex + 1

    async function loadSelected() {
      setLoadingSelected(true)
      try {
        const cached = summaries.find((row) => row.year === year && row.month === month)
        if (cached) {
          if (!cancelled) setSelectedSummary(cached)
          return
        }

        const data = await insightsApi.getMonthlySummary(year, month)
        if (!cancelled) setSelectedSummary(data)
      } catch (err) {
        if (cancelled) return
        setSelectedSummary(null)
        setError((current) =>
          current ??
          (err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load month summary."),
        )
      } finally {
        if (!cancelled) setLoadingSelected(false)
      }
    }

    void loadSelected()

    return () => {
      cancelled = true
    }
  }, [summaries, year, monthIndex])

  const loading = loadingSummaries || loadingSelected

  return { summaries, selectedSummary, loading, error }
}
