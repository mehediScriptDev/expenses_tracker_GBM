"use client"

import * as React from "react"
import { useStore } from "@/lib/store"
import { useNotifications } from "@/lib/hooks/use-notifications"
import type { AppNotification } from "@/lib/notifications"

export type NotificationInbox = {
  items: AppNotification[]
  unreadCount: number
  isUnread: (id: string) => boolean
  markRead: (id: string) => void
  markAllRead: () => void
}

export function useNotificationInbox(): NotificationInbox {
  const { transactionRevision } = useStore()
  const inbox = useNotifications(transactionRevision, 20)

  const markRead = React.useCallback(
    (id: string) => {
      void inbox.markRead(id)
    },
    [inbox],
  )

  const markAllRead = React.useCallback(() => {
    void inbox.markAllRead()
  }, [inbox])

  return {
    items: inbox.notifications,
    unreadCount: inbox.unreadCount,
    isUnread: inbox.isUnread,
    markRead,
    markAllRead,
  }
}
