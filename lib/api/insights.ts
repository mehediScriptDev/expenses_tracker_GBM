import { apiFetch } from "./client"
import type { BackendMonthlySummary } from "./types"

export function getCurrentMonthSummary() {
  return apiFetch<BackendMonthlySummary>("/api/insights/current", { method: "GET" })
}

export function getMonthlySummaries() {
  return apiFetch<BackendMonthlySummary[]>("/api/insights/summaries", { method: "GET" })
}

export function getMonthlySummary(year: number, month: number) {
  return apiFetch<BackendMonthlySummary>(`/api/insights/summaries/${year}/${month}`, {
    method: "GET",
  })
}
