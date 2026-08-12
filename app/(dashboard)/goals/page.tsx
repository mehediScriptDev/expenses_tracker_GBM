"use client"

import * as React from "react"
import {
  PageHeader,
  EmptyState,
  ProgressBar,
  DashPage,
  SummaryBar,
  PageHero,
  StatusBadge,
  DashboardCard,
  dashInput,
  Pagination,
  FilterToolbar,
} from "@/dashboard/shared"
import { useStore } from "@/lib/store"
import { formatMoney, relativeDay } from "@/lib/format"
import { Icon } from "@/lib/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import type { Goal } from "@/types"

export default function GoalsPage() {
  const { data, addGoal, updateGoal, depositGoal, deleteGoal } = useStore()
  const goals = data.goals

  const [addModalOpen, setAddModalOpen] = React.useState(false)
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null)

  const [depositModalOpen, setDepositModalOpen] = React.useState(false)
  const [targetGoal, setTargetGoal] = React.useState<Goal | null>(null)
  const [depositAmt, setDepositAmt] = React.useState("")

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "in-progress" | "completed">("all")

  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const totalTarget = React.useMemo(() => goals.reduce((s, g) => s + g.targetAmount, 0), [goals])
  const totalSaved = React.useMemo(() => goals.reduce((s, g) => s + g.currentAmount, 0), [goals])
  const completedCount = React.useMemo(
    () => goals.filter((g) => g.currentAmount >= g.targetAmount).length,
    [goals],
  )
  const totalRemaining = Math.max(0, totalTarget - totalSaved)
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  const filteredGoals = React.useMemo(() => {
    return goals.filter((g) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        if (!g.title.toLowerCase().includes(q)) return false
      }

      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
      const isCompleted = pct >= 100

      if (statusFilter === "in-progress") {
        if (isCompleted) return false
      } else if (statusFilter === "completed") {
        if (!isCompleted) return false
      }

      return true
    })
  }, [goals, search, statusFilter])

  const totalPages = Math.ceil(filteredGoals.length / pageSize) || 1

  const paginatedGoals = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredGoals.slice(start, start + pageSize)
  }, [filteredGoals, currentPage, pageSize])

  const handleOpenAdd = () => {
    setEditingGoal(null)
    setAddModalOpen(true)
  }

  const handleOpenEdit = (g: Goal) => {
    setEditingGoal(g)
    setAddModalOpen(true)
  }

  const handleOpenDeposit = (g: Goal) => {
    setTargetGoal(g)
    setDepositAmt("")
    setDepositModalOpen(true)
  }

  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetGoal) return
    const add = parseFloat(depositAmt)
    if (isNaN(add) || add === 0) {
      toast.error("Enter a valid amount.")
      return
    }

    try {
      if (add > 0) {
        await depositGoal(targetGoal.id, add)
      } else {
        await updateGoal(targetGoal.id, {
          currentAmount: Math.max(0, targetGoal.currentAmount + add),
        })
      }
      toast.success(`Updated savings for ${targetGoal.title}`)
      setDepositModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update savings.")
    }
  }

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id)
      toast.success("Goal deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete goal.")
    }
  }

  const stats = [
    {
      label: "Total Saved",
      value: formatMoney(totalSaved, { symbol: data.settings.currencySymbol }),
      icon: "piggy-bank",
      cardBg: "bg-[#EBF7EE] dark:bg-[#0B2E17]",
      textColor: "text-[#134D25] dark:text-[#C1F0CC]",
      iconBg: "bg-[#C4EAD0] text-[#0C3B1B] dark:bg-[#194D27] dark:text-[#C1F0CC]",
      labelColor: "text-[#196631] dark:text-[#9EE5AF]",
    },
    {
      label: "Total Target",
      value: formatMoney(totalTarget, { symbol: data.settings.currencySymbol }),
      icon: "target",
      cardBg: "bg-[#FFF8D6] dark:bg-[#332A00]",
      textColor: "text-[#5C4500] dark:text-[#FFE999]",
      iconBg: "bg-[#FFE885] text-[#423200] dark:bg-[#524200] dark:text-[#FFE999]",
      labelColor: "text-[#7A5C00] dark:text-[#FFDF80]",
    },
    {
      label: "Remaining",
      value: formatMoney(totalRemaining, { symbol: data.settings.currencySymbol }),
      icon: "sparkles",
      cardBg: "bg-[#FDF0E9] dark:bg-[#381B0E]",
      textColor: "text-[#6E2E10] dark:text-[#FCD5C5]",
      iconBg: "bg-[#FCD8C5] text-[#52200A] dark:bg-[#5C2A15] dark:text-[#FCD5C5]",
      labelColor: "text-[#8C3D18] dark:text-[#FBBFA8]",
    },
    {
      label: "Goals Completed",
      value: `${completedCount}/${goals.length}`,
      icon: "trophy",
      cardBg: "bg-[#EEF4FF] dark:bg-[#102347]",
      textColor: "text-[#163870] dark:text-[#C7DBFF]",
      iconBg: "bg-[#CFE1FF] text-[#0E2854] dark:bg-[#1E3B6E] dark:text-[#C7DBFF]",
      labelColor: "text-[#1E4A94] dark:text-[#A8C7FF]",
    },
  ]

  return (
    <DashPage>
      <PageHeader
        title="Savings goals"
        description="Set targets, track progress, and build toward what matters most."
      />

      <section className="rounded-xl bg-white dark:bg-card p-5 sm:p-7 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2 max-w-xl">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Overall savings progress
              </span>
              <span className="text-sm font-extrabold tabular-nums text-neutral-900 dark:text-neutral-100">
                {Math.round(overallPct)}%
              </span>
            </div>
            <ProgressBar
              value={overallPct}
              tone={overallPct >= 100 ? "success" : "accent"}
              className="h-3"
            />
          </div>

          <Button
            onClick={handleOpenAdd}
            className="h-10 px-5 gap-1.5 shadow-2xs shrink-0 font-semibold"
          >
            <Icon name="plus" className="size-4" />
            Create Goal
          </Button>
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

      {goals.length === 0 ? (
        <EmptyState
          icon="trophy"
          title="No savings goals yet"
          message="Create a target for an emergency fund, travel, or a major purchase."
          action={<Button onClick={handleOpenAdd}>Create savings goal</Button>}
        />
      ) : (
        <div className="space-y-6">
          <FilterToolbar>
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Icon
                name="search"
                className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-(--dash-text-faint)"
              />
              <Input
                placeholder="Search goals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(dashInput, "h-11 border-0 bg-(--dash-surface) pl-10 shadow-none")}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="dash-input h-11 w-full pl-3.5 pr-10 text-sm sm:w-auto rounded-xl cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </FilterToolbar>

          {filteredGoals.length === 0 ? (
            <EmptyState
              icon="search"
              title="No goals match your filters"
              message="Try resetting your search query or choosing another status filter."
            />
          ) : (
            <>
              {/* Mobile Grid View (Visible on mobile screens) */}
              <div className="sm:hidden grid gap-4">
                {paginatedGoals.map((g) => {
                  const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
                  const isCompleted = pct >= 100
                  const remaining = Math.max(0, g.targetAmount - g.currentAmount)

                  return (
                    <DashboardCard
                      key={g.id}
                      title={g.title}
                      description={
                        g.targetDate
                          ? `Target ${relativeDay(g.targetDate)} · ${g.targetDate}`
                          : "No target date set"
                      }
                      action={
                        isCompleted ? (
                          <StatusBadge tone="success" icon="trophy">
                            Completed
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="accent">{Math.round(pct)}%</StatusBadge>
                        )
                      }
                      bodyClassName="space-y-4"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                          style={{ backgroundColor: g.color }}
                        >
                          <Icon name={g.icon || "piggy-bank"} className="size-5" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Saved
                              </p>
                              <p className="mt-1 font-mono text-xl font-black tabular-nums text-slate-900 dark:text-slate-50">
                                {formatMoney(g.currentAmount, { symbol: data.settings.currencySymbol })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Target
                              </p>
                              <p className="mt-1 font-mono text-base font-bold tabular-nums text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                                {formatMoney(g.targetAmount, { symbol: data.settings.currencySymbol })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <ProgressBar value={pct} tone={isCompleted ? "success" : "accent"} className="h-3" />

                      <div className="flex items-center justify-between text-xs font-semibold">
                        {isCompleted ? (
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                            Target achieved — great work!
                          </span>
                        ) : (
                          <span className="font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                            {formatMoney(remaining, { symbol: data.settings.currencySymbol })} remaining
                          </span>
                        )}
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {Math.round(pct)}%
                        </span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="dash"
                          className="h-11 flex-1 gap-1.5 text-xs font-extrabold uppercase tracking-wider bg-neutral-900 text-white border border-transparent hover:bg-[#FFC700]! hover:text-black! hover:border-[#FFC700]! transition-all duration-200 [&_svg]:transition-colors hover:[&_svg]:text-black!"
                          onClick={() => handleOpenDeposit(g)}
                        >
                          <Icon name="plus" className="size-3.5" />
                          Deposit / save
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(g)}
                          aria-label={`Edit ${g.title}`}
                          className="flex size-11 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black transition-all cursor-pointer shadow-2xs"
                        >
                          <Icon name="pencil" className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteGoal(g.id)}
                          aria-label={`Delete ${g.title}`}
                          className="flex size-11 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-400 hover:border-rose-600 hover:bg-rose-600 hover:text-white dark:hover:border-rose-600 dark:hover:bg-rose-600 transition-all cursor-pointer"
                        >
                          <Icon name="trash-2" className="size-4" />
                        </button>
                      </div>
                    </DashboardCard>
                  )
                })}
              </div>

              {/* Desktop Data Table (Visible on tablet & desktop screens) */}
              <div className="hidden sm:block overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-card shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50/80 dark:bg-neutral-900/50 border-b border-neutral-200/80 dark:border-neutral-800 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      <tr>
                        <th scope="col" className="py-3.5 pl-5 pr-3">Goal</th>
                        <th scope="col" className="px-3 py-3.5 text-center">Saved</th>
                        <th scope="col" className="px-3 py-3.5 text-center">Target</th>
                        <th scope="col" className="px-3 py-3.5">Progress</th>
                        <th scope="col" className="px-3 py-3.5">Target Date</th>
                        <th scope="col" className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                      {paginatedGoals.map((g) => {
                        const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
                        const isCompleted = pct >= 100
                        const remaining = Math.max(0, g.targetAmount - g.currentAmount)

                        return (
                          <tr
                            key={g.id}
                            className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors"
                          >
                            {/* Goal Icon & Title */}
                            <td className="py-3.5 pl-5 pr-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                                  style={{ backgroundColor: g.color }}
                                >
                                  <Icon name={g.icon || "piggy-bank"} className="size-4.5" />
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{g.title}</p>
                                  {isCompleted ? (
                                    <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                      Completed
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </td>

                            {/* Saved Amount */}
                            <td className="px-3 py-3.5 whitespace-nowrap text-center font-mono font-black text-neutral-900 dark:text-neutral-50">
                              {formatMoney(g.currentAmount, { symbol: data.settings.currencySymbol })}
                            </td>

                            {/* Target Amount */}
                            <td className="px-3 py-3.5 whitespace-nowrap text-center font-mono text-neutral-600 dark:text-neutral-400">
                              {formatMoney(g.targetAmount, { symbol: data.settings.currencySymbol })}
                            </td>

                            {/* Progress Bar & Percentage */}
                            <td className="px-3 py-3.5">
                              <div className="max-w-40 space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-neutral-500 font-semibold">{Math.round(pct)}%</span>
                                  {!isCompleted && (
                                    <span className="text-neutral-400 font-medium">
                                      {formatMoney(remaining, { symbol: data.settings.currencySymbol })} left
                                    </span>
                                  )}
                                </div>
                                <ProgressBar value={pct} tone={isCompleted ? "success" : "accent"} className="h-1.5" />
                              </div>
                            </td>

                            {/* Target Date */}
                            <td className="px-3 py-3.5 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
                              {g.targetDate ? (
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">{relativeDay(g.targetDate)}</p>
                                  <p className="text-[10px] text-neutral-400">{g.targetDate}</p>
                                </div>
                              ) : (
                                <span className="text-neutral-400">No target date</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Deposit Button */}
                                <Button
                                  size="xs"
                                  variant="dash"
                                  className="h-8 gap-1 px-2.5 text-[10px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white border border-transparent hover:bg-[#FFC700]! hover:text-black! hover:border-[#FFC700]! transition-all duration-200 [&_svg]:transition-colors hover:[&_svg]:text-black!"
                                  onClick={() => handleOpenDeposit(g)}
                                  title="Deposit / Save"
                                >
                                  <Icon name="plus" className="size-3" />
                                  Deposit
                                </Button>

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(g)}
                                  className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black transition-all cursor-pointer shadow-2xs"
                                  title="Edit goal"
                                  aria-label={`Edit ${g.title}`}
                                >
                                  <Icon name="pencil" className="size-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteGoal(g.id)}
                                  className="flex size-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer shadow-2xs"
                                  title="Delete goal"
                                  aria-label={`Delete ${g.title}`}
                                >
                                  <Icon name="trash-2" className="size-3.5" />
                                </button>
                              </div>
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
            totalItems={filteredGoals.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 12, 24, 48]}
          />
        </div>
      )}

      <GoalDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        editingGoal={editingGoal}
        currencySymbol={data.settings.currencySymbol}
        onSave={(goalData) => {
          void (async () => {
            try {
              if (editingGoal) {
                await updateGoal(editingGoal.id, goalData)
              } else {
                await addGoal(goalData)
              }
              setAddModalOpen(false)
              toast.success("Goal saved successfully!")
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not save goal.")
            }
          })()
        }}
      />

      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit into {targetGoal?.title}</DialogTitle>
            <DialogDescription>Add savings toward this goal. Use a negative value to withdraw.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDeposit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="dash-label">Amount ({data.settings.currencySymbol})</label>
              <Input
                type="number"
                step="any"
                value={depositAmt}
                onChange={(e) => setDepositAmt(e.target.value)}
                placeholder="e.g. 5000"
                className={dashInput}
                required
                autoFocus
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDepositModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="dash" type="submit">
                Save deposit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashPage>
  )
}

function GoalDialog({
  open,
  onOpenChange,
  editingGoal,
  currencySymbol,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingGoal: Goal | null
  currencySymbol: string
  onSave: (goal: Omit<Goal, "id" | "createdAt">) => void
}) {
  const [title, setTitle] = React.useState("")
  const [targetAmount, setTargetAmount] = React.useState("")
  const [currentAmount, setCurrentAmount] = React.useState("0")
  const [targetDate, setTargetDate] = React.useState("")
  const [icon, setIcon] = React.useState("piggy-bank")
  const [color, setColor] = React.useState("var(--chart-4)")

  React.useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title)
      setTargetAmount(String(editingGoal.targetAmount))
      setCurrentAmount(String(editingGoal.currentAmount))
      setTargetDate(editingGoal.targetDate || "")
      setIcon(editingGoal.icon)
      setColor(editingGoal.color)
    } else {
      setTitle("")
      setTargetAmount("10000")
      setCurrentAmount("0")
      setTargetDate("")
      setIcon("piggy-bank")
      setColor("var(--chart-4)")
    }
  }, [editingGoal, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetNum = parseFloat(targetAmount)
    const currentNum = parseFloat(currentAmount) || 0
    if (!title.trim() || isNaN(targetNum) || targetNum <= 0) return

    onSave({
      title: title.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum,
      targetDate: targetDate || undefined,
      icon,
      color,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingGoal ? "Edit savings goal" : "Create savings goal"}</DialogTitle>
          <DialogDescription>Define target amount, starting balance, and optional deadline.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="dash-label">Goal title</label>
            <Input
              placeholder="e.g. Emergency fund, New phone, Tour"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={dashInput}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="dash-label">Target ({currencySymbol})</label>
              <Input
                type="number"
                step="any"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className={dashInput}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="dash-label">Starting saved ({currencySymbol})</label>
              <Input
                type="number"
                step="any"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className={dashInput}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="dash-label">Target date (optional)</label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={dashInput} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="dash" type="submit">
              {editingGoal ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
