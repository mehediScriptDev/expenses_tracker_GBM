import { apiFetch, apiFetchWithMeta } from "./client"
import type { BackendBudget } from "./types"

export type BudgetListParams = {
  page?: number
  limit?: number
  search?: string
  status?: "all" | "on-track" | "near-limit" | "over"
}

function buildQuery(params: BudgetListParams) {
  const q = new URLSearchParams()
  q.set("page", String(params.page ?? 1))
  q.set("limit", String(params.limit ?? 200))
  if (params.search?.trim()) q.set("search", params.search.trim())
  if (params.status && params.status !== "all") q.set("status", params.status)
  return q.toString()
}

export async function listBudgets(params: BudgetListParams = {}) {
  const { data, meta } = await apiFetchWithMeta<BackendBudget[]>(
    `/api/budgets?${buildQuery(params)}`,
    { method: "GET" },
  )
  return { budgets: data, meta }
}

export function createBudget(categoryId: string, monthlyLimit: number) {
  return apiFetch<BackendBudget>("/api/budgets", {
    method: "POST",
    body: { category_id: categoryId, monthly_limit: monthlyLimit },
  })
}

export function updateBudget(id: string, monthlyLimit: number) {
  return apiFetch<BackendBudget>(`/api/budgets/${id}`, {
    method: "PATCH",
    body: { monthly_limit: monthlyLimit },
  })
}

export function deleteBudget(id: string) {
  return apiFetch<null>(`/api/budgets/${id}`, { method: "DELETE" })
}
