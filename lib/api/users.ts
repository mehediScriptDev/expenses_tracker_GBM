import { apiFetch } from "./client"
import type { BackendUser } from "./types"

export function updateProfile(body: {
  name?: string
  monthly_salary?: number
  salary_day?: number
  currency_code?: string
  currency_symbol?: string
}) {
  return apiFetch<BackendUser>("/api/users/profile", {
    method: "PATCH",
    body,
  })
}

export function changePassword(current_password: string, new_password: string) {
  return apiFetch<null>("/api/users/password", {
    method: "PATCH",
    body: { current_password, new_password },
  })
}
