import { apiFetch } from "./client"
import type { BackendDashboard } from "./types"

export function getDashboard() {
  return apiFetch<BackendDashboard>("/api/dashboard", { method: "GET" })
}
