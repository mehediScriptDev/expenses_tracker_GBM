"use client"

import * as React from "react"
import {
  PageHeader,
  EmptyState,
  ProgressBar,
  CategoryBadge,
  dashInput,
  DashPage,
  SummaryBar,
  PageHero,
  StatusBadge,
  DashboardCard,
  Pagination,
  FilterToolbar,
  dashSegment,
  dashSegmentItem,
  dashSegmentItemActive,
} from "@/dashboard/shared"
import { useStore } from "@/lib/store"
import { useBudgetList } from "@/lib/hooks/use-budget-list"
import { formatMoney } from "@/lib/format"
import { Icon } from "@/lib/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function BudgetsPage() {
  const { data, setBudget, removeBudget, transactionRevision } = useStore()
  const { budgetUsages, loading, error, reload } = useBudgetList(transactionRevision)
  const [editingCatId, setEditingCatId] = React.useState<string | null>(null)
  const [budgetInput, setBudgetInput] = React.useState<string>("")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [addCategoryId, setAddCategoryId] = React.useState("")
  const [addBudgetInput, setAddBudgetInput] = React.useState("")

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "on-track" | "warning" | "over">("all")

  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const filteredUsages = React.useMemo(() => {
    return budgetUsages.filter((u) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        if (!u.category.name.toLowerCase().includes(q)) return false
      }

      if (statusFilter === "on-track") {
        if (u.over || u.pct >= 85) return false
      } else if (statusFilter === "warning") {
        if (u.over || u.pct < 85) return false
      } else if (statusFilter === "over") {
        if (!u.over) return false
      }

      return true
    })
  }, [budgetUsages, search, statusFilter])

  const totalPages = Math.ceil(filteredUsages.length / pageSize) || 1

  const paginatedUsages = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsages.slice(start, start + pageSize)
  }, [filteredUsages, currentPage, pageSize])

  const totalBudgeted = React.useMemo(
    () => budgetUsages.reduce((sum, b) => sum + b.budget, 0),
    [budgetUsages],
  )
  const totalSpent = React.useMemo(
    () => budgetUsages.reduce((sum, b) => sum + b.spent, 0),
    [budgetUsages],
  )
  const totalRemaining = totalBudgeted - totalSpent
  const overallPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
  const overCount = budgetUsages.filter((b) => b.over).length
  const warningCount = budgetUsages.filter((b) => !b.over && b.pct >= 85).length

  const unbudgetedCategories = React.useMemo(() => {
    const budgetedIds = new Set(Object.keys(data.budgets))
    return data.categories.filter((c) => c.kind === "expense" && !budgetedIds.has(c.id))
  }, [data.categories, data.budgets])

  React.useEffect(() => {
    if (unbudgetedCategories.length > 0 && (!addCategoryId || !unbudgetedCategories.some((c) => c.id === addCategoryId))) {
      setAddCategoryId(unbudgetedCategories[0].id)
    }
  }, [unbudgetedCategories, addCategoryId])

  const handleOpenAdd = () => {
    if (unbudgetedCategories.length > 0) {
      setAddCategoryId(unbudgetedCategories[0].id)
      setAddBudgetInput("")
      setIsAddOpen(true)
    }
  }

  const handleSaveBudget = async (catId: string) => {
    const val = parseFloat(budgetInput)
    if (isNaN(val) || val < 0) return

    try {
      if (val === 0) await removeBudget(catId)
      else await setBudget(catId, val)
      reload()
      toast.success("Budget saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save budget.")
    } finally {
      setEditingCatId(null)
      setBudgetInput("")
    }
  }

  const handleRemoveBudget = async (catId: string) => {
    try {
      await removeBudget(catId)
      reload()
      toast.success("Budget removed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove budget.")
    }
  }

  const stats = [
    {
      label: "Total Budgeted",
      value: formatMoney(totalBudgeted, { symbol: data.settings.currencySymbol }),
      icon: "piggy-bank",
      cardBg: "bg-[#FFF8D6] dark:bg-[#332A00]",
      textColor: "text-[#5C4500] dark:text-[#FFE999]",
      iconBg: "bg-[#FFE885] text-[#423200] dark:bg-[#524200] dark:text-[#FFE999]",
      labelColor: "text-[#7A5C00] dark:text-[#FFDF80]",
    },
    {
      label: "Total Spent",
      value: formatMoney(totalSpent, { symbol: data.settings.currencySymbol }),
      icon: "shopping-bag",
      cardBg: "bg-[#FDF0E9] dark:bg-[#381B0E]",
      textColor: "text-[#6E2E10] dark:text-[#FCD5C5]",
      iconBg: "bg-[#FCD8C5] text-[#52200A] dark:bg-[#5C2A15] dark:text-[#FCD5C5]",
      labelColor: "text-[#8C3D18] dark:text-[#FBBFA8]",
    },
    {
      label: totalRemaining < 0 ? "Over Budget" : "Remaining",
      value: formatMoney(Math.abs(totalRemaining), { symbol: data.settings.currencySymbol }),
      icon: totalRemaining < 0 ? "alert-circle" : "wallet",
      cardBg: totalRemaining < 0 ? "bg-[#FEE2E2] dark:bg-[#451212]" : "bg-[#EBF7EE] dark:bg-[#0B2E17]",
      textColor: totalRemaining < 0 ? "text-[#991B1B] dark:text-[#FCA5A5]" : "text-[#134D25] dark:text-[#C1F0CC]",
      iconBg: totalRemaining < 0 ? "bg-[#FCA5A5] text-[#7F1D1D] dark:bg-[#7F1D1D] dark:text-[#FCA5A5]" : "bg-[#C4EAD0] text-[#0C3B1B] dark:bg-[#194D27] dark:text-[#C1F0CC]",
      labelColor: totalRemaining < 0 ? "text-[#B91C1C] dark:text-[#FCA5A5]" : "text-[#196631] dark:text-[#9EE5AF]",
    },
    {
      label: "Budget Status",
      value: budgetUsages.length > 0 ? `${budgetUsages.length - overCount - warningCount}/${budgetUsages.length} On Track` : "0 Budgets",
      icon: "target",
      cardBg: "bg-[#EEF4FF] dark:bg-[#102347]",
      textColor: "text-[#163870] dark:text-[#C7DBFF]",
      iconBg: "bg-[#CFE1FF] text-[#0E2854] dark:bg-[#1E3B6E] dark:text-[#C7DBFF]",
      labelColor: "text-[#1E4A94] dark:text-[#A8C7FF]",
    },
  ]

  return (
    <DashPage>
      <PageHeader title="Budgets" description="Set monthly limits and track spending against each category." />

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          Could not load budgets from server: {error}
        </div>
      ) : null}

      <section className="rounded-xl bg-white dark:bg-card p-5 sm:p-7 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2 max-w-xl">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Overall budget usage
              </span>
              <span className="text-sm font-extrabold tabular-nums text-neutral-900 dark:text-neutral-100">
                {Math.round(overallPct)}%
              </span>
            </div>
            <ProgressBar
              value={overallPct}
              tone={overallPct > 100 ? "danger" : overallPct >= 85 ? "warning" : "accent"}
              className="h-3"
            />
          </div>

          {unbudgetedCategories.length > 0 ? (
            <Button
              onClick={handleOpenAdd}
              className="h-10 px-5 gap-1.5 shadow-2xs shrink-0 font-semibold"
            >
              <Icon name="plus" className="size-4" />
              Set budget
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 min-w-0 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "min-w-0 overflow-hidden rounded-xl p-3.5 sm:p-4.5 transition-transform hover:-translate-y-0.5 border border-black/5 dark:border-white/5 shadow-2xs",
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

      {loading ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading budgets from server…</div>
      ) : budgetUsages.length === 0 ? (
        <EmptyState
          icon="target"
          title="No budgets yet"
          message="Assign a monthly cap to any expense category and track progress in real time."
          action={
            unbudgetedCategories.length > 0 ? (
              <Button variant="dash" onClick={handleOpenAdd}>
                Set your first budget
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-6">
          <FilterToolbar>
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Icon
                name="search"
                className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--dash-text-faint)]"
              />
              <Input
                placeholder="Search category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(dashInput, "h-11 border-0 bg-[var(--dash-surface)] pl-10 shadow-none")}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="dash-input h-11 w-full pl-3.5 pr-10 text-sm sm:w-auto rounded-xl cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="on-track">On Track</option>
              <option value="warning">{"Near Limit (>=85%)"}</option>
              <option value="over">{"Over Budget (>100%)"}</option>
            </select>
          </FilterToolbar>

          {filteredUsages.length === 0 ? (
            <EmptyState
              icon="search"
              title="No budgets match your filters"
              message="Try resetting your search query or choosing another status filter."
            />
          ) : (
            <>
              {/* Mobile Grid View (Visible on mobile screens) */}
              <div className="sm:hidden grid gap-4">
                {paginatedUsages.map((u) => {
                  const tone = u.over ? "danger" : u.pct >= 85 ? "warning" : "success"
                  const isEditing = editingCatId === u.category.id
                  const statusLabel = u.over ? "Over budget" : u.pct >= 85 ? "Near limit" : "On track"
                  const statusTone = u.over ? "danger" : u.pct >= 85 ? "warning" : "success"

                  return (
                    <DashboardCard
                      key={u.category.id}
                      title=""
                      description={`${Math.round(u.pct)}% of monthly limit used`}
                      action={
                        <div className="flex items-center gap-2">
                          <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
                          {!isEditing && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCatId(u.category.id)
                                  setBudgetInput(String(u.budget))
                                }}
                                aria-label={`Edit ${u.category.name} budget`}
                                className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black dark:hover:border-neutral-100 transition-all cursor-pointer shadow-2xs"
                              >
                                <Icon name="pencil" className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRemoveBudget(u.category.id)}
                                aria-label={`Remove ${u.category.name} budget`}
                                className="flex size-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer shadow-2xs"
                              >
                                <Icon name="trash-2" className="size-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      }
                      bodyClassName="space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <CategoryBadge icon={u.category.icon} color={u.category.color} name={u.category.name} size="md" />
                      </div>

                      {isEditing ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Input
                            type="number"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            placeholder="Amount"
                            className={cn("h-11 min-w-0 flex-1 text-sm", dashInput)}
                            autoFocus
                          />
                          <Button variant="dash" size="sm" className="h-11 px-4" onClick={() => void handleSaveBudget(u.category.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-11 px-3" onClick={() => setEditingCatId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Spent
                              </p>
                              <p className="mt-1 font-mono text-xl font-black tabular-nums text-slate-900 dark:text-slate-50">
                                {formatMoney(u.spent, { symbol: data.settings.currencySymbol })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Limit
                              </p>
                              <p className="mt-1 font-mono text-base font-bold tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                                {formatMoney(u.budget, { symbol: data.settings.currencySymbol })}
                              </p>
                            </div>
                          </div>
                          <ProgressBar value={u.pct} tone={tone} className="h-3" />
                          <div className="flex items-center justify-between text-xs font-semibold">
                            {u.over ? (
                              <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                                {formatMoney(u.spent - u.budget, { symbol: data.settings.currencySymbol })} above limit
                              </span>
                            ) : (
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                {formatMoney(u.budget - u.spent, { symbol: data.settings.currencySymbol })} left this month
                              </span>
                            )}
                            <span className="font-mono text-slate-500 dark:text-slate-400">
                              {Math.round(u.pct)}%
                            </span>
                          </div>
                        </>
                      )}
                    </DashboardCard>
                  )
                })}
              </div>

              {/* Desktop Data Table (Visible on tablet & desktop screens) */}
              <div className="hidden sm:block overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-card shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm animate-in fade-in duration-300">
                    <thead className="bg-neutral-50/80 dark:bg-neutral-900/50 border-b border-neutral-200/80 dark:border-neutral-800 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      <tr>
                        <th scope="col" className="py-3.5 pl-5 pr-3">Category</th>
                        <th scope="col" className="px-3 py-3.5 text-center">Monthly Limit</th>
                        <th scope="col" className="px-3 py-3.5 text-center">Spent</th>
                        <th scope="col" className="px-3 py-3.5 text-center">Remaining</th>
                        <th scope="col" className="px-3 py-3.5 text-center">Usage Progress</th>
                        <th scope="col" className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                      {paginatedUsages.map((u) => {
                        const tone = u.over ? "danger" : u.pct >= 85 ? "warning" : "success"
                        const isEditing = editingCatId === u.category.id
                        const statusLabel = u.over ? "Over budget" : u.pct >= 85 ? "Near limit" : "On track"
                        const statusTone = u.over ? "danger" : u.pct >= 85 ? "warning" : "success"

                        return (
                          <tr
                            key={u.category.id}
                            className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors"
                          >
                            {/* Category Name & Status Badge */}
                            <td className="py-3.5 pl-5 pr-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                                  style={{ backgroundColor: u.category.color }}
                                >
                                  <Icon name={u.category.icon} className="size-4.5" />
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{u.category.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={cn(
                                      "inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border",
                                      u.over
                                        ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40"
                                        : u.pct >= 85
                                        ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40"
                                    )}>
                                      {statusLabel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Monthly Limit */}
                            <td className="px-3 py-3.5 whitespace-nowrap text-center font-mono font-black text-neutral-900 dark:text-neutral-50">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={budgetInput}
                                  onChange={(e) => setBudgetInput(e.target.value)}
                                  placeholder="Amount"
                                  className={cn("h-9 w-24 text-xs font-mono font-bold mx-auto", dashInput)}
                                  autoFocus
                                />
                              ) : (
                                formatMoney(u.budget, { symbol: data.settings.currencySymbol })
                              )}
                            </td>

                            {/* Spent */}
                            <td className="px-3 py-3.5 whitespace-nowrap text-center font-mono text-neutral-600 dark:text-neutral-400">
                              {formatMoney(u.spent, { symbol: data.settings.currencySymbol })}
                            </td>

                            {/* Remaining */}
                            <td className="px-3 py-3.5 whitespace-nowrap text-center font-mono">
                              {u.over ? (
                                <span className="text-rose-600 dark:text-rose-400 font-bold">
                                  {formatMoney(u.spent - u.budget, { symbol: data.settings.currencySymbol })} over
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  {formatMoney(u.budget - u.spent, { symbol: data.settings.currencySymbol })} left
                                </span>
                              )}
                            </td>

                            {/* Usage Progress */}
                            <td className="px-3 py-3.5 text-center">
                              <div className="max-w-[160px] mx-auto space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-neutral-500 font-semibold">{Math.round(u.pct)}%</span>
                                  <span className="text-neutral-400 font-medium">used</span>
                                </div>
                                <ProgressBar value={u.pct} tone={tone} className="h-1.5" />
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="xs"
                                    variant="dash"
                                    className="h-8 px-2.5 text-[10px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white hover:!bg-[#FFC700] hover:!text-black"
                                    onClick={() => void handleSaveBudget(u.category.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    className="h-8 px-2.5 text-[10px] font-bold"
                                    onClick={() => setEditingCatId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCatId(u.category.id)
                                      setBudgetInput(String(u.budget))
                                    }}
                                    className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black transition-all cursor-pointer shadow-2xs"
                                    title="Edit budget"
                                    aria-label={`Edit ${u.category.name} budget`}
                                  >
                                    <Icon name="pencil" className="size-3.5" />
                                  </button>

                                  {/* Remove Button */}
                                  <button
                                    type="button"
                                    onClick={() => void handleRemoveBudget(u.category.id)}
                                    className="flex size-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer shadow-2xs"
                                    title="Remove budget"
                                    aria-label={`Remove ${u.category.name} budget`}
                                  >
                                    <Icon name="trash-2" className="size-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUsages.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 12, 24, 48]}
          />
        </div>
      )}

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open)
          if (open && unbudgetedCategories.length > 0) {
            setAddCategoryId((prev) => prev || unbudgetedCategories[0].id)
            setAddBudgetInput("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set category budget</DialogTitle>
            <DialogDescription>Choose a category and set its monthly spending limit.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void (async () => {
                const targetCatId = addCategoryId || unbudgetedCategories[0]?.id
                const val = parseFloat(addBudgetInput)
                if (!targetCatId || isNaN(val) || val <= 0) {
                  toast.error("Enter a valid monthly limit.")
                  return
                }

                try {
                  await setBudget(targetCatId, val)
                  reload()
                  toast.success("Budget saved")
                  setIsAddOpen(false)
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not save budget.")
                }
              })()
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="dash-label">Category</label>
              <select
                value={addCategoryId || unbudgetedCategories[0]?.id || ""}
                onChange={(e) => setAddCategoryId(e.target.value)}
                className="dash-input w-full px-3 text-sm"
              >
                {unbudgetedCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="dash-label">Monthly limit ({data.settings.currencySymbol})</label>
              <Input
                type="number"
                step="any"
                min="1"
                value={addBudgetInput}
                onChange={(e) => setAddBudgetInput(e.target.value)}
                placeholder="e.g. 5000"
                className={dashInput}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button variant="dash" type="submit">
                Save budget
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashPage>
  )
}
