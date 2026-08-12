import { apiFetch, apiFetchWithMeta } from "./client"
import type { BackendGoal } from "./types"
import { toCreateGoalBody, toUpdateGoalBody } from "./mappers"
import type { Goal } from "@/types"

export async function listGoals(limit = 200) {
  const { data } = await apiFetchWithMeta<BackendGoal[]>(
    `/api/goals?page=1&limit=${limit}`,
    { method: "GET" },
  )
  return data
}

export function createGoal(goal: Omit<Goal, "id" | "createdAt">) {
  return apiFetch<BackendGoal>("/api/goals", {
    method: "POST",
    body: toCreateGoalBody(goal),
  })
}

export function updateGoal(id: string, patch: Partial<Goal>) {
  return apiFetch<BackendGoal>(`/api/goals/${id}`, {
    method: "PATCH",
    body: toUpdateGoalBody(patch),
  })
}

export function depositGoal(id: string, amount: number) {
  return apiFetch<BackendGoal>(`/api/goals/${id}/deposit`, {
    method: "POST",
    body: { amount },
  })
}

export function deleteGoal(id: string) {
  return apiFetch<null>(`/api/goals/${id}`, { method: "DELETE" })
}
