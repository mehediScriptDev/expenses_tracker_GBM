"use client"

import * as React from "react"
import * as transactionsApi from "@/lib/api/transactions"
import { mapTransaction } from "@/lib/api/mappers"
import { ApiError } from "@/lib/api/client"

export function useCategoryStats(revision: number) {
  const [stats, setStats] = React.useState<Record<string, { total: number; count: number }>>({})
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const { transactions } = await transactionsApi.listTransactions({
          page: 1,
          limit: 500,
          scope: "all",
        })

        if (cancelled) return

        const next: Record<string, { total: number; count: number }> = {}
        for (const row of transactions.map(mapTransaction)) {
          if (!next[row.categoryId]) next[row.categoryId] = { total: 0, count: 0 }
          next[row.categoryId].total += row.amount
          next[row.categoryId].count += 1
        }
        setStats(next)
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load category stats."
        console.warn(message)
        setStats({})
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [revision])

  return { categoryStats: stats, loading }
}
