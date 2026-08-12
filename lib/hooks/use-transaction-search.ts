"use client"

import * as React from "react"
import * as transactionsApi from "@/lib/api/transactions"
import { mapTransaction } from "@/lib/api/mappers"
import type { Transaction } from "@/types"

export function useTransactionSearch(query: string, revision: number) {
  const [results, setResults] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true)
        try {
          const { transactions } = await transactionsApi.listTransactions({
            page: 1,
            limit: 5,
            scope: "all",
            search: trimmed,
          })
          if (!cancelled) setResults(transactions.map(mapTransaction))
        } catch {
          if (!cancelled) setResults([])
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, revision])

  return { results, loading }
}
