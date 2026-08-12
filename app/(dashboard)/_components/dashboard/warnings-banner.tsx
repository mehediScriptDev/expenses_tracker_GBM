"use client"

import { useDashboardData } from "@/lib/hooks/dashboard-context"
import { NOTIFICATION_PRESENTATION } from "@/lib/notifications"
import { Icon } from "@/lib/icon"
import { cn } from "@/lib/utils"
import { dashSectionTitle, dashCaption } from "@/dashboard/shared"
import { AlertRow } from "@/dashboard/dashboard/alert-row"
import type { InsightTone } from "@/types"

function toneForType(type: string): InsightTone {
  if (type === "BUDGET_LIMIT_EXCEEDED" || type === "DEBT_DUE_SOON") return "danger"
  if (type === "BUDGET_LIMIT_WARNING") return "warning"
  return "neutral"
}

export function WarningsBanner() {
  const { notifications, loading } = useDashboardData()

  const alerts = notifications.slice(0, 3).map((item) => {
    const presentation = NOTIFICATION_PRESENTATION[item.type]
    return {
      id: item.id,
      tone: toneForType(item.type),
      icon: presentation.icon,
      title: presentation.label,
      detail: item.message,
      href: item.href,
    }
  })

  if (loading) {
    return (
      <div className="rounded-xl bg-[#EDE9E1] px-4 py-4 sm:px-5 sm:py-5">
        <p className={dashCaption}>Loading alerts…</p>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl bg-[#E4F4E8] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-3">
          <Icon name="circle-check" className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">You&apos;re on track</p>
            <p className={cn(dashCaption, "mt-1")}>No warnings right now. Keep spending with intention.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className={dashSectionTitle}>Alerts</h3>
      {alerts.map((alert) => (
        <AlertRow key={alert.id} alert={alert} href={alert.href} />
      ))}
    </div>
  )
}
