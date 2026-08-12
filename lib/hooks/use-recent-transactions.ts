"use client"

import * as React from "react"
import * as transactionsApi from "@/lib/api/transactions"
import { mapTransaction } from "@/lib/api/mappers"
import { ApiError } from "@/lib/api/client"
import type { Transaction } from "@/types"

export function useRecentTransactions(revision: number, limit = 6) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { transactions: rows } = await transactionsApi.listTransactions({
          page: 1,
          limit,
          scope: "all",
        })
        if (!cancelled) {
          setTransactions(rows.map(mapTransaction))
        }
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load recent transactions."
        setError(message)
        setTransactions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [revision, limit])

  return { transactions, loading, error }
}
