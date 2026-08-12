import { apiFetch, apiFetchWithMeta } from "./client"
import type { BackendTransaction } from "./types"
import {
  toCreateTransactionBody,
  toUpdateTransactionBody,
} from "./mappers"
import type { Transaction } from "@/types"

export type TransactionListParams = {
  page?: number
  limit?: number
  scope?: "current_cycle" | "current_month" | "all"
  type?: "all" | "expense" | "income"
  search?: string
}

function buildQuery(params: TransactionListParams) {
  const q = new URLSearchParams()
  q.set("page", String(params.page ?? 1))
  q.set("limit", String(params.limit ?? 50))
  q.set("scope", params.scope ?? "all")
  if (params.type && params.type !== "all") q.set("type", params.type)
  if (params.search?.trim()) q.set("search", params.search.trim())
  return q.toString()
}

export async function listTransactions(params: TransactionListParams = {}) {
  const { data, meta } = await apiFetchWithMeta<BackendTransaction[]>(
    `/api/transactions?${buildQuery(params)}`,
    { method: "GET" },
  )
  return { transactions: data, meta }
}

export async function listAllTransactions(scope: TransactionListParams["scope"] = "all") {
  const pageSize = 100
  let page = 1
  let total = Infinity
  const all: BackendTransaction[] = []

  while (all.length < total) {
    const { transactions, meta } = await listTransactions({
      page,
      limit: pageSize,
      scope,
    })
    all.push(...transactions)
    total = meta?.total ?? transactions.length
    if (transactions.length < pageSize) break
    page += 1
  }

  return all
}

export function createTransaction(tx: Omit<Transaction, "id" | "createdAt">) {
  return apiFetch<BackendTransaction>("/api/transactions", {
    method: "POST",
    body: toCreateTransactionBody(tx),
  })
}

export function updateTransaction(id: string, patch: Partial<Transaction>) {
  return apiFetch<BackendTransaction>(`/api/transactions/${id}`, {
    method: "PATCH",
    body: toUpdateTransactionBody(patch),
  })
}

export function deleteTransaction(id: string) {
  return apiFetch<null>(`/api/transactions/${id}`, { method: "DELETE" })
}

export function duplicateTransaction(id: string) {
  return apiFetch<BackendTransaction>(`/api/transactions/${id}/duplicate`, {
    method: "POST",
  })
}
