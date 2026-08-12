import { apiFetch, apiFetchWithMeta } from "./client"
import type { BackendNotification } from "./types"

export async function listNotifications(limit = 20) {
  const { data, meta } = await apiFetchWithMeta<BackendNotification[]>(
    `/api/notifications?page=1&limit=${limit}`,
    { method: "GET" },
  )
  return { notifications: data, meta }
}

export function markNotificationRead(notificationKey: string) {
  return apiFetch<null>("/api/notifications/read", {
    method: "POST",
    body: { notification_key: notificationKey },
  })
}

export function markAllNotificationsRead() {
  return apiFetch<null>("/api/notifications/read", {
    method: "POST",
    body: { mark_all: true },
  })
}

export function clearNotificationReadState() {
  return apiFetch<null>("/api/notifications/read", { method: "DELETE" })
}
