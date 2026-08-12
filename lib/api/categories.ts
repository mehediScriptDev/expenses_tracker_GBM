import { apiFetch, apiFetchWithMeta } from "./client"
import type { BackendCategory, BackendTransaction } from "./types"

export async function listCategories(limit = 100) {
  const { data } = await apiFetchWithMeta<BackendCategory[]>(
    `/api/categories?page=1&limit=${limit}`,
    { method: "GET" },
  )
  return data
}

export function seedDefaultCategories() {
  return apiFetch<BackendCategory[]>("/api/categories/seed-defaults", {
    method: "POST",
  })
}

export function createCategory(body: {
  name: string
  kind: string
  icon: string
  color: string
}) {
  return apiFetch<BackendCategory>("/api/categories", {
    method: "POST",
    body,
  })
}

export function updateCategory(
  id: string,
  body: Partial<{ name: string; kind: string; icon: string; color: string }>,
) {
  return apiFetch<BackendCategory>(`/api/categories/${id}`, {
    method: "PATCH",
    body,
  })
}

export function deleteCategory(id: string) {
  return apiFetch<null>(`/api/categories/${id}`, { method: "DELETE" })
}
