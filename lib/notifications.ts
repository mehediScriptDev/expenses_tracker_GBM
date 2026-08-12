import type { AppNotification, NotificationType } from "@/types"

export type { AppNotification, NotificationType }

export const NOTIFICATION_PRESENTATION: Record<
  NotificationType,
  { label: string; icon: string; iconWrap: string }
> = {
  BUDGET_LIMIT_WARNING: {
    label: "Budget alert",
    icon: "target",
    iconWrap: "bg-[#E8F0FE] text-[#2563EB]",
  },
  BUDGET_LIMIT_EXCEEDED: {
    label: "Budget exceeded",
    icon: "circle-alert",
    iconWrap: "bg-[#FFF1E6] text-[#EA580C]",
  },
  GOAL_MILESTONE: {
    label: "Goal milestone reached",
    icon: "trophy",
    iconWrap: "bg-[#FEF9C3] text-[#CA8A04]",
  },
  DEBT_DUE_SOON: {
    label: "Debt due soon",
    icon: "clock-alert",
    iconWrap: "bg-[#FFE4E6] text-[#E11D48]",
  },
}

let readIdsCache = new Set<string>()

export function formatNotificationTime(createdAt: number, now = Date.now()): string {
  const diff = Math.max(0, now - createdAt)
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function loadReadIds(): Set<string> {
  return new Set(readIdsCache)
}

export function persistReadIds(ids: Set<string>) {
  readIdsCache = new Set(ids)
}

export function clearNotificationReadState() {
  readIdsCache = new Set()
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("goribmanush:notifications:reset"))
  }
}
