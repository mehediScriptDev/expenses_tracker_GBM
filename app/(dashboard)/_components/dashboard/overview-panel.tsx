"use client"

import * as React from "react"
import Link from "next/link"
import { useDashboardData } from "@/lib/hooks/dashboard-context"
import { formatMoney } from "@/lib/format"
import { ProgressBar } from "@/dashboard/shared"
import { useUI } from "@/dashboard/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Icon } from "@/lib/icon"
import { cn } from "@/lib/utils"

export function OverviewPanel() {
  const ui = useUI()
  const { dashboard, loading } = useDashboardData()

  const currencySymbol = dashboard?.currency_symbol ?? "৳"
  const available = dashboard?.available ?? 0
  const cycleSpending = dashboard?.cycle_expenses ?? 0
  const cycleBudget = dashboard?.benchmark_salary ?? 0
  const safeDailyLimit = dashboard?.safe_daily_limit ?? 0
  const daysRemaining = dashboard?.cycle.days_remaining ?? 0

  const cyclePct =
    cycleBudget > 0
      ? (cycleSpending / cycleBudget) * 100
      : cycleSpending > 0
        ? 100
        : 0

  const stats = [
    {
      label: "Spent today",
      value: formatMoney(dashboard?.today_spending ?? 0, { symbol: currencySymbol }),
      icon: "sun",
      cardBg: "bg-[#FFF8D6] dark:bg-[#332A00]",
      textColor: "text-[#5C4500] dark:text-[#FFE999]",
      iconBg: "bg-[#FFE885] text-[#423200] dark:bg-[#524200] dark:text-[#FFE999]",
      labelColor: "text-[#7A5C00] dark:text-[#FFDF80]",
    },
    {
      label: "Spent this week",
      value: formatMoney(dashboard?.week_spending ?? 0, { symbol: currencySymbol }),
      icon: "calendar-days",
      cardBg: "bg-[#FDF0E9] dark:bg-[#381B0E]",
      textColor: "text-[#6E2E10] dark:text-[#FCD5C5]",
      iconBg: "bg-[#FCD8C5] text-[#52200A] dark:bg-[#5C2A15] dark:text-[#FCD5C5]",
      labelColor: "text-[#8C3D18] dark:text-[#FBBFA8]",
    },
    {
      label: "Spent this month",
      value: formatMoney(dashboard?.month_spending ?? 0, { symbol: currencySymbol }),
      icon: "calendar-range",
      cardBg: "bg-[#EBF7EE] dark:bg-[#0B2E17]",
      textColor: "text-[#134D25] dark:text-[#C1F0CC]",
      iconBg: "bg-[#C4EAD0] text-[#0C3B1B] dark:bg-[#194D27] dark:text-[#C1F0CC]",
      labelColor: "text-[#196631] dark:text-[#9EE5AF]",
    },
    {
      label: "Borrowed",
      value: formatMoney(dashboard?.borrowed_outstanding ?? 0, { symbol: currencySymbol }),
      icon: "hand-coins",
      cardBg: "bg-[#EEF4FF] dark:bg-[#102347]",
      textColor: "text-[#163870] dark:text-[#C7DBFF]",
      iconBg: "bg-[#CFE1FF] text-[#0E2854] dark:bg-[#1E3B6E] dark:text-[#C7DBFF]",
      labelColor: "text-[#1E4A94] dark:text-[#A8C7FF]",
    },
  ]

  return (
    <section className="rounded-xl bg-white dark:bg-card p-5 sm:p-7 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
      <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4 sm:space-y-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Available balance
            </p>
            <p className="mt-1.5 font-mono text-3xl font-black tabular-nums tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl lg:text-5xl">
              {loading && !dashboard ? "…" : formatMoney(available, { symbol: currencySymbol })}
            </p>
          </div>

          <div className="max-w-lg space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Salary cycle spending
              </span>
              <span className="text-sm font-extrabold tabular-nums text-neutral-900 dark:text-neutral-100">
                {Math.round(cyclePct)}% used
              </span>
            </div>
            <ProgressBar
              value={cyclePct}
              tone={cyclePct > 90 ? "danger" : "primary"}
              className="h-3"
            />
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {cycleBudget <= 0 && cycleSpending > 0 ? (
                <>
                  Spent{" "}
                  <strong className="font-extrabold text-neutral-900 dark:text-neutral-100">
                    {formatMoney(cycleSpending, { symbol: currencySymbol })}
                  </strong>{" "}
                  this cycle · set salary in Settings to track budget usage
                </>
              ) : (
                <>
                  Safe to spend{" "}
                  <strong className="font-extrabold text-neutral-900 dark:text-neutral-100 bg-[#FFC700]/25 dark:bg-[#FFC700]/30 px-2 py-0.5 rounded-md">
                    {formatMoney(safeDailyLimit, { symbol: currencySymbol })}/day
                  </strong>{" "}
                  · {daysRemaining} days left in cycle
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
          <Button
            onClick={ui.openAdd}
            className="h-11 w-full px-6 sm:w-auto lg:w-full xl:w-auto shadow-2xs"
          >
            <Icon name="plus" className="size-4" />
            Add transaction
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full px-6 sm:w-auto lg:w-full xl:w-auto border-neutral-200 dark:border-neutral-800 shadow-2xs"
            asChild
          >
            <Link href="/insights">View insights</Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 min-w-0 sm:mt-7 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "min-w-0 overflow-hidden rounded-xl p-3.5 sm:p-4.5 transition-transform hover:-translate-y-0.5",
              stat.cardBg,
            )}
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl sm:size-9", stat.iconBg)}>
                <Icon name={stat.icon} className="size-4 sm:size-4.5" aria-hidden />
              </span>
              <p className={cn("min-w-0 flex-1 truncate text-xs font-black uppercase tracking-wider", stat.labelColor)}>
                {stat.label}
              </p>
            </div>
            <p className={cn("mt-2.5 truncate font-mono text-xl font-black tabular-nums tracking-tight sm:mt-3 sm:text-2xl", stat.textColor)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
