import { apiFetch } from "./client"
import type { BackendQuickAdd } from "./types"

export function listQuickAdds() {
  return apiFetch<BackendQuickAdd[]>("/api/quick-adds", { method: "GET" })
}

export function seedDefaultQuickAdds() {
  return apiFetch<BackendQuickAdd[]>("/api/quick-adds/seed-defaults", {
    method: "POST",
  })
}

export function createQuickAdd(body: {
  label: string
  icon: string
  amount: number
  category_id: string
  payment_method: string
  sort_order?: number
}) {
  return apiFetch<BackendQuickAdd>("/api/quick-adds", {
    method: "POST",
    body,
  })
}

export function updateQuickAdd(
  id: string,
  body: Partial<{
    label: string
    icon: string
    amount: number
    category_id: string
    payment_method: string
    sort_order: number
  }>,
) {
  return apiFetch<BackendQuickAdd>(`/api/quick-adds/${id}`, {
    method: "PATCH",
    body,
  })
}

export function deleteQuickAdd(id: string) {
  return apiFetch<null>(`/api/quick-adds/${id}`, { method: "DELETE" })
}
