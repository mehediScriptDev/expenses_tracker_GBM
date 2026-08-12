"use client"

import { useDashboardData } from "@/lib/hooks/dashboard-context"
import { formatMoney } from "@/lib/format"

import { Icon } from "@/lib/icon"

import { DashboardCard, EmptyState, dashMeta } from "@/dashboard/shared"

import { cn } from "@/lib/utils"



export function CategoryBreakdown() {
  const { summary, dashboard, loading, error } = useDashboardData()



  const currencySymbol = dashboard?.currency_symbol ?? "৳"

  const rows = (summary?.top_categories ?? []).slice(0, 6)

  const total = summary?.total_expenses ?? 0



  let acc = 0

  const stops = rows

    .map((row) => {

      const start = total > 0 ? (acc / total) * 100 : 0

      acc += row.total

      const end = total > 0 ? (acc / total) * 100 : 0

      return `${row.color} ${start}% ${end}%`

    })

    .join(", ")



  return (

    <DashboardCard

      title="Spending by category"

      description="Where your money went this month"

      action={<span className={cn(dashMeta, "shrink-0 text-[10px] sm:text-xs")}>This month</span>}

    >

      {loading ? (

        <p className={cn(dashMeta, "py-8 text-center")}>Loading breakdown…</p>

      ) : error && rows.length === 0 ? (

        <EmptyState icon="wifi-off" title="Could not load chart" message={error} />

      ) : rows.length === 0 ? (

        <EmptyState icon="pie-chart" title="No expenses yet" message="Add a transaction to see your breakdown." />

      ) : (

        <div className="flex flex-col gap-5 sm:gap-8 lg:flex-row lg:items-start">

          <div className="relative mx-auto shrink-0 lg:mx-0">

            <div

              className="size-32 rounded-full sm:size-44"

              style={{ background: `conic-gradient(${stops})` }}

              role="img"

              aria-label="Category spending donut chart"

            />

            <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white">

              <span className={cn(dashMeta, "text-[10px] sm:text-xs")}>Total</span>

              <span className="mt-0.5 font-mono text-sm font-bold tabular-nums text-[#1A1A1A] sm:mt-1 sm:text-lg">

                {formatMoney(total, { compact: true, symbol: currencySymbol })}

              </span>

            </div>

          </div>



          <ul className="min-w-0 flex-1 space-y-3.5 sm:space-y-4">

            {rows.map((row) => {

              const pct = total > 0 ? Math.round((row.total / total) * 100) : 0

              return (

                <li key={row.category_id} className="space-y-1.5 sm:space-y-2">

                  <div className="flex items-center gap-2 min-w-0 sm:gap-3">

                    <span

                      className="flex size-7 shrink-0 items-center justify-center rounded-lg shadow-2xs"

                      style={{

                        backgroundColor: `color-mix(in srgb, ${row.color} 18%, white)`,

                        color: row.color,

                      }}

                    >

                      <Icon name={row.icon} className="size-3.5 shrink-0" />

                    </span>

                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-sm">

                      {row.name}

                    </span>

                    <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{pct}%</span>

                    <span className="shrink-0 text-right font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100 sm:text-sm">

                      {formatMoney(row.total, { symbol: currencySymbol })}

                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80 ring-1 ring-black/5">

                    <div

                      className="h-full rounded-full transition-all duration-500 shadow-2xs"

                      style={{ width: `${pct}%`, backgroundColor: row.color }}

                    />

                  </div>

                </li>

              )

            })}

          </ul>

        </div>

      )}

    </DashboardCard>

  )

}

