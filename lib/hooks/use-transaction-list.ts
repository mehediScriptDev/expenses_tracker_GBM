"use client"

import * as React from "react"
import * as transactionsApi from "@/lib/api/transactions"
import { mapTransaction } from "@/lib/api/mappers"
import { ApiError } from "@/lib/api/client"
import type { Transaction } from "@/types"
import type { PaginatedMeta } from "@/lib/api/types"

type TypeFilter = "all" | "expense" | "income"

export function useTransactionList(options: {
  page: number
  pageSize: number
  typeFilter: TypeFilter
  search: string
  revision: number
}) {
  const { page, pageSize, typeFilter, search, revision } = options
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [meta, setMeta] = React.useState<PaginatedMeta | null>(null)
  const [statsTransactions, setStatsTransactions] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(search, 300)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = {
          page,
          limit: pageSize,
          scope: "all" as const,
          type: typeFilter,
          search: debouncedSearch.trim() || undefined,
        }

        const [{ transactions: pageRows, meta: pageMeta }, statsResult] = await Promise.all([
          transactionsApi.listTransactions(params),
          transactionsApi.listTransactions({
            ...params,
            page: 1,
            limit: 500,
          }),
        ])

        if (cancelled) return

        setTransactions(pageRows.map(mapTransaction))
        setMeta(pageMeta ?? null)
        setStatsTransactions(statsResult.transactions.map(mapTransaction))
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load transactions."
        setError(message)
        setTransactions([])
        setMeta(null)
        setStatsTransactions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [page, pageSize, typeFilter, debouncedSearch, revision])

  return { transactions, meta, statsTransactions, loading, error }
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
