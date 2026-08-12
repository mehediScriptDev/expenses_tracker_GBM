"use client"

import * as React from "react"
import * as notificationsApi from "@/lib/api/notifications"
import { ApiError } from "@/lib/api/client"
import type { BackendNotification } from "@/lib/api/types"
import type { AppNotification, NotificationType } from "@/types"

function mapNotification(raw: BackendNotification): AppNotification {
  return {
    id: raw.id,
    type: raw.type as NotificationType,
    message: raw.message,
    href: raw.href,
    createdAt: new Date(raw.created_at).getTime(),
  }
}

export function useNotifications(revision: number, limit = 20) {
  const [rows, setRows] = React.useState<BackendNotification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { notifications, meta } = await notificationsApi.listNotifications(limit)
      setRows(notifications)
      setUnreadCount(meta?.unread_count ?? notifications.filter((row) => !row.read).length)
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Failed to load notifications."
      setError(message)
      setRows([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [limit])

  React.useEffect(() => {
    void load()
  }, [load, revision])

  const notifications = React.useMemo(() => rows.map(mapNotification), [rows])

  const unreadIds = React.useMemo(
    () => new Set(rows.filter((row) => !row.read).map((row) => row.id)),
    [rows],
  )

  const markRead = React.useCallback(
    async (id: string) => {
      try {
        await notificationsApi.markNotificationRead(id)
        setRows((prev) =>
          prev.map((row) => (row.id === id ? { ...row, read: true } : row)),
        )
        setUnreadCount((count) => Math.max(0, count - 1))
      } catch {
        // Ignore mark-read failures in the UI.
      }
    },
    [],
  )

  const markAllRead = React.useCallback(async () => {
    try {
      await notificationsApi.markAllNotificationsRead()
      setRows((prev) => prev.map((row) => ({ ...row, read: true })))
      setUnreadCount(0)
    } catch {
      // Ignore mark-read failures in the UI.
    }
  }, [])

  return {
    notifications,
    unreadCount,
    unreadIds,
    loading,
    error,
    markRead,
    markAllRead,
    reload: load,
    isUnread: (id: string) => unreadIds.has(id),
  }
}
