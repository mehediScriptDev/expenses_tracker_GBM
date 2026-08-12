import { apiFetch, apiFetchWithMeta } from "./client"
import type { BackendLoan } from "./types"
import { toCreateLoanBody, toUpdateLoanBody } from "./mappers"
import type { Loan } from "@/types"

export async function listLoans(limit = 200) {
  const { data } = await apiFetchWithMeta<BackendLoan[]>(
    `/api/loans?page=1&limit=${limit}`,
    { method: "GET" },
  )
  return data
}

export function createLoan(loan: Omit<Loan, "id" | "createdAt">) {
  return apiFetch<BackendLoan>("/api/loans", {
    method: "POST",
    body: toCreateLoanBody(loan),
  })
}

export function updateLoan(id: string, patch: Partial<Loan>) {
  return apiFetch<BackendLoan>(`/api/loans/${id}`, {
    method: "PATCH",
    body: toUpdateLoanBody(patch),
  })
}

export function repayLoan(id: string, amount: number) {
  return apiFetch<BackendLoan>(`/api/loans/${id}/repay`, {
    method: "POST",
    body: { amount },
  })
}

export function deleteLoan(id: string) {
  return apiFetch<null>(`/api/loans/${id}`, { method: "DELETE" })
}
