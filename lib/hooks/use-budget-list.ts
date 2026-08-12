"use client"

import * as React from "react"
import * as budgetsApi from "@/lib/api/budgets"
import { mapCategory } from "@/lib/api/mappers"
import { ApiError } from "@/lib/api/client"
import type { BackendBudget } from "@/lib/api/types"
import type { Category } from "@/types"

export type BudgetUsageRow = {
  id: string
  category: Category
  budget: number
  spent: number
  remaining: number
  pct: number
  over: boolean
}

function mapBudgetRow(raw: BackendBudget): BudgetUsageRow | null {
  if (!raw.category) return null

  return {
    id: raw.id,
    category: mapCategory({
      id: raw.category.id,
      user_id: raw.user_id,
      system_key: null,
      name: raw.category.name,
      icon: raw.category.icon,
      color: raw.category.color,
      kind: raw.category.kind,
      is_custom: false,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }),
    budget: raw.monthly_limit,
    spent: raw.spent,
    remaining: raw.remaining,
    pct: raw.pct,
    over: raw.over,
  }
}

export function useBudgetList(revision: number) {
  const [rows, setRows] = React.useState<BudgetUsageRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadToken, setReloadToken] = React.useState(0)

  const reload = React.useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { budgets } = await budgetsApi.listBudgets({ page: 1, limit: 200 })
        if (cancelled) return
        setRows(
          budgets
            .map(mapBudgetRow)
            .filter((row): row is BudgetUsageRow => row !== null),
        )
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load budgets.",
        )
        setRows([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [revision, reloadToken])

  return { budgetUsages: rows, loading, error, reload }
}
