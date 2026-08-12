"use client"

import * as React from "react"
import {
  PageHeader,
  EmptyState,
  ProgressBar,
  dashSegment,
  dashSegmentItem,
  dashSegmentItemActive,
  dashInput,
  DashPage,
  SummaryBar,
  FilterToolbar,
  PageHero,
  StatusBadge,
  DashboardCard,
  Pagination,
} from "@/dashboard/shared"
import { useStore } from "@/lib/store"
import { loanTotals, loanStatus, loanRemaining } from "@/lib/selectors"
import { formatMoney, relativeDay, todayISO } from "@/lib/format"
import { Icon } from "@/lib/icon"
import type { Loan, LoanDirection } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function BorrowedPage() {
  const { data, addLoan, updateLoan, repayLoan, deleteLoan } = useStore()

  const [directionTab, setDirectionTab] = React.useState<LoanDirection | "all">("all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "unpaid" | "overdue" | "paid">("all")
  const [search, setSearch] = React.useState("")

  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  const [loanModalOpen, setLoanModalOpen] = React.useState(false)
  const [editingLoan, setEditingLoan] = React.useState<Loan | null>(null)

  const [repayModalOpen, setRepayModalOpen] = React.useState(false)
  const [targetLoan, setTargetLoan] = React.useState<Loan | null>(null)
  const [repayAmount, setRepayAmount] = React.useState("")

  const totals = React.useMemo(() => loanTotals(data.loans), [data.loans])
  const netPosition = totals.lentOutstanding - totals.borrowedOutstanding

  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, directionTab, statusFilter])

  const filteredLoans = React.useMemo(() => {
    return data.loans
      .filter((loan) => {
        if (directionTab !== "all" && loan.direction !== directionTab) return false

        if (search.trim()) {
          const q = search.toLowerCase().trim()
          const matchPerson = loan.person.toLowerCase().includes(q)
          const matchReason = loan.reason?.toLowerCase().includes(q)
          if (!matchPerson && !matchReason) return false
        }

        const status = loanStatus(loan)
        if (statusFilter === "unpaid" && status === "paid") return false
        if (statusFilter === "overdue" && status !== "overdue") return false
        if (statusFilter === "paid" && status !== "paid") return false

        return true
      })
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [data.loans, directionTab, statusFilter, search])

  const totalPages = Math.ceil(filteredLoans.length / pageSize) || 1

  const paginatedLoans = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLoans.slice(start, start + pageSize)
  }, [filteredLoans, currentPage, pageSize])

  const handleOpenAdd = () => {
    setEditingLoan(null)
    setLoanModalOpen(true)
  }

  const handleOpenEdit = (loan: Loan) => {
    setEditingLoan(loan)
    setLoanModalOpen(true)
  }

  const handleOpenRepay = (loan: Loan) => {
    setTargetLoan(loan)
    setRepayAmount(String(loanRemaining(loan)))
    setRepayModalOpen(true)
  }

  const handleSaveRepayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetLoan) return
    const addAmt = parseFloat(repayAmount)
    if (isNaN(addAmt) || addAmt <= 0) {
      toast.error("Enter a valid payment amount.")
      return
    }

    try {
      await repayLoan(targetLoan.id, addAmt)
      toast.success("Payment recorded")
      setRepayModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record payment.")
    }
  }

  const handleQuickSettle = async (loan: Loan) => {
    try {
      await updateLoan(loan.id, { amountRepaid: loan.amount })
      toast.success("Marked as settled")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not settle loan.")
    }
  }

  const handleDeleteLoan = async (id: string) => {
    try {
      await deleteLoan(id)
      toast.success("Loan deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete loan.")
    }
  }

  const stats = [
    {
      label: "I Owe",
      value: formatMoney(totals.borrowedOutstanding, { symbol: data.settings.currencySymbol }),
      icon: "arrow-down-left",
      cardBg: "bg-[#FEE2E2] dark:bg-[#451212]",
      textColor: "text-[#991B1B] dark:text-[#FCA5A5]",
      iconBg: "bg-[#FCA5A5] text-[#7F1D1D] dark:bg-[#7F1D1D] dark:text-[#FCA5A5]",
      labelColor: "text-[#B91C1C] dark:text-[#FCA5A5]",
    },
    {
      label: "Owed to Me",
      value: formatMoney(totals.lentOutstanding, { symbol: data.settings.currencySymbol }),
      icon: "arrow-up-right",
      cardBg: "bg-[#EBF7EE] dark:bg-[#0B2E17]",
      textColor: "text-[#134D25] dark:text-[#C1F0CC]",
      iconBg: "bg-[#C4EAD0] text-[#0C3B1B] dark:bg-[#194D27] dark:text-[#C1F0CC]",
      labelColor: "text-[#196631] dark:text-[#9EE5AF]",
    },
    {
      label: "Overdue Records",
      value: totals.overdue.length,
      icon: "clock-alert",
      cardBg: "bg-[#FDF0E9] dark:bg-[#381B0E]",
      textColor: "text-[#6E2E10] dark:text-[#FCD5C5]",
      iconBg: "bg-[#FCD8C5] text-[#52200A] dark:bg-[#5C2A15] dark:text-[#FCD5C5]",
      labelColor: "text-[#8C3D18] dark:text-[#FBBFA8]",
    },
    {
      label: "Total Records",
      value: data.loans.length,
      icon: "hand-coins",
      cardBg: "bg-[#EEF4FF] dark:bg-[#102347]",
      textColor: "text-[#163870] dark:text-[#C7DBFF]",
      iconBg: "bg-[#CFE1FF] text-[#0E2854] dark:bg-[#1E3B6E] dark:text-[#C7DBFF]",
      labelColor: "text-[#1E4A94] dark:text-[#A8C7FF]",
    },
  ]

  return (
    <DashPage>
      <PageHeader
        title="Borrowed & lent"
        description="Track money you owe and money others owe you, with due dates and repayment progress."
      />

      <section className="rounded-xl bg-white dark:bg-card p-5 sm:p-7 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2 max-w-xl">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Overall repayment progress
              </span>
              <span className="text-sm font-extrabold tabular-nums text-neutral-900 dark:text-neutral-100">
                {Math.round(totals.repaymentPct)}%
              </span>
            </div>
            <ProgressBar value={totals.repaymentPct} tone="accent" className="h-3" />
          </div>

          <Button
            onClick={handleOpenAdd}
            className="h-10 px-5 gap-1.5 shadow-2xs shrink-0 font-semibold"
          >
            <Icon name="plus" className="size-4" />
            Add record
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

      <FilterToolbar>
        <div className={cn(dashSegment, "w-full bg-[var(--dash-surface)] lg:w-auto")}>
          {(["all", "borrowed", "lent"] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => setDirectionTab(dir)}
              className={cn(
                dashSegmentItem,
                directionTab === dir ? dashSegmentItemActive : "hover:text-[var(--dash-text)]",
              )}
            >
              {dir === "all" ? "All" : dir === "borrowed" ? "I owe" : "Owed to me"}
            </button>
          ))}
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-56">
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--dash-text-faint)]"
            />
            <Input
              placeholder="Search person or reason..."
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
            <option value="unpaid">Outstanding</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Settled</option>
          </select>
        </div>
      </FilterToolbar>

      {filteredLoans.length === 0 ? (
        <EmptyState
          icon="hand-coins"
          title="No loan records found"
          message={
            data.loans.length === 0
              ? "Start tracking borrowed or lent money with due dates and repayment history."
              : "No records match your current filters."
          }
          action={<Button onClick={handleOpenAdd}>Add record</Button>}
        />
      ) : (
        <div className="space-y-6">
          {/* Mobile Grid View (Visible on mobile screens) */}
          <div className="sm:hidden grid gap-4">
            {paginatedLoans.map((loan) => {
              const status = loanStatus(loan)
              const remaining = loanRemaining(loan)
              const pct = loan.amount > 0 ? (loan.amountRepaid / loan.amount) * 100 : 100
              const isBorrowed = loan.direction === "borrowed"

              return (
                <DashboardCard
                  key={loan.id}
                  title={loan.person}
                  description={loan.reason || "No reason provided"}
                  action={
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black dark:hover:border-neutral-100 transition-all cursor-pointer"
                          >
                            <Icon name="ellipsis-vertical" className="size-4" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(loan)}>
                          <Icon name="pencil" className="size-4" />
                          Edit details
                        </DropdownMenuItem>
                        {status !== "paid" ? (
                          <DropdownMenuItem onClick={() => void handleQuickSettle(loan)}>
                            <Icon name="check-check" className="size-4" />
                            Mark settled
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => void handleDeleteLoan(loan.id)}>
                          <Icon name="trash-2" className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                  bodyClassName="space-y-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={isBorrowed ? "danger" : "success"} icon={isBorrowed ? "arrow-down-left" : "arrow-up-right"}>
                      {isBorrowed ? "Borrowed" : "Lent"}
                    </StatusBadge>
                    {status === "overdue" ? (
                      <StatusBadge tone="danger" icon="clock-alert">
                        Overdue
                      </StatusBadge>
                    ) : null}
                    {status === "paid" ? (
                      <StatusBadge tone="success" icon="circle-check">
                        Settled
                      </StatusBadge>
                    ) : null}
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 font-mono text-2xl font-black tabular-nums text-slate-900 dark:text-slate-50">
                        {formatMoney(loan.amount, { symbol: data.settings.currencySymbol })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {status === "paid" ? "Status" : "Remaining"}
                      </p>
                      <p
                        className={cn(
                          "mt-1 font-mono text-base font-bold tabular-nums px-2.5 py-1 rounded-lg",
                          status === "paid"
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
                            : "text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80",
                        )}
                      >
                        {status === "paid"
                          ? "Paid in full"
                          : formatMoney(remaining, { symbol: data.settings.currencySymbol })}
                      </p>
                    </div>
                  </div>

                  <ProgressBar
                    value={pct}
                    tone={status === "paid" ? "success" : status === "overdue" ? "danger" : "accent"}
                    className="h-3"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--dash-text-muted)] font-medium">
                    <span>Started {loan.date}</span>
                    {loan.dueDate ? (
                      <span className={status === "overdue" ? "font-bold text-rose-600 dark:text-rose-400" : ""}>
                        Due {relativeDay(loan.dueDate)} ({loan.dueDate})
                      </span>
                    ) : (
                      <span>No due date</span>
                    )}
                  </div>

                  {status !== "paid" ? (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="dash"
                        className="h-11 flex-1 gap-1.5 text-xs font-extrabold uppercase tracking-wider bg-neutral-900 text-white border border-transparent hover:!bg-[#FFC700] hover:!text-black hover:!border-[#FFC700] transition-all duration-200 [&_svg]:transition-colors hover:[&_svg]:!text-black"
                        onClick={() => handleOpenRepay(loan)}
                      >
                        <Icon name="hand-coins" className="size-3.5" />
                        Record payment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-11 px-5 text-xs font-bold"
                        onClick={() => void handleQuickSettle(loan)}
                      >
                        Settle
                      </Button>
                    </div>
                  ) : null}
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
                    <th scope="col" className="py-3.5 pl-5 pr-3">Person</th>
                    <th scope="col" className="px-3 py-3.5">Direction</th>
                    <th scope="col" className="px-3 py-3.5">Reason</th>
                    <th scope="col" className="px-3 py-3.5">Repayment Progress</th>
                    <th scope="col" className="px-3 py-3.5">Due Date</th>
                    <th scope="col" className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                  {paginatedLoans.map((loan) => {
                    const status = loanStatus(loan)
                    const remaining = loanRemaining(loan)
                    const pct = loan.amount > 0 ? (loan.amountRepaid / loan.amount) * 100 : 100
                    const isBorrowed = loan.direction === "borrowed"

                    return (
                      <tr
                        key={loan.id}
                        className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors"
                      >
                        {/* Person Name & Status Badges */}
                        <td className="py-3.5 pl-5 pr-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs",
                                isBorrowed ? "bg-red-500" : "bg-emerald-500"
                              )}
                            >
                              <Icon name={isBorrowed ? "arrow-down-left" : "arrow-up-right"} className="size-4.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{loan.person}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {status === "overdue" ? (
                                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                    Overdue
                                  </span>
                                ) : null}
                                {status === "paid" ? (
                                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    Settled
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Direction */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                              isBorrowed
                                ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40",
                            )}
                          >
                            {isBorrowed ? "Borrowed" : "Lent"}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="px-3 py-3.5 text-xs text-neutral-600 dark:text-neutral-400 max-w-[200px] truncate">
                          {loan.reason || "—"}
                        </td>

                        {/* Progress */}
                        <td className="px-3 py-3.5">
                          <div className="max-w-[180px] space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-neutral-500 font-semibold">{Math.round(pct)}% repaid</span>
                              {status !== "paid" && (
                                <span className="text-neutral-400 font-medium">
                                  {formatMoney(remaining, { symbol: data.settings.currencySymbol })} left
                                </span>
                              )}
                            </div>
                            <ProgressBar value={pct} tone={status === "paid" ? "success" : status === "overdue" ? "danger" : "accent"} className="h-1.5" />
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
                          {loan.dueDate ? (
                            <div className="space-y-0.5">
                              <p className="font-semibold text-neutral-700 dark:text-neutral-300">{relativeDay(loan.dueDate)}</p>
                              <p className="text-[10px] text-neutral-400">{loan.dueDate}</p>
                            </div>
                          ) : (
                            <span className="text-neutral-400">No due date</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {status !== "paid" && (
                              <Button
                                size="xs"
                                variant="dash"
                                className="h-8 gap-1 px-2.5 text-[10px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white border border-transparent hover:!bg-[#FFC700] hover:!text-black hover:!border-[#FFC700] transition-all duration-200 [&_svg]:transition-colors hover:[&_svg]:!text-black"
                                onClick={() => handleOpenRepay(loan)}
                              >
                                <Icon name="hand-coins" className="size-3" />
                                Pay
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <button
                                    type="button"
                                    className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black dark:hover:border-neutral-100 transition-all cursor-pointer shadow-2xs"
                                  >
                                    <Icon name="ellipsis-vertical" className="size-4" />
                                  </button>
                                }
                              />
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEdit(loan)}>
                                  <Icon name="pencil" className="size-4" />
                                  Edit details
                                </DropdownMenuItem>
                                {status !== "paid" ? (
                                  <DropdownMenuItem onClick={() => void handleQuickSettle(loan)}>
                                    <Icon name="check-check" className="size-4" />
                                    Mark settled
                                  </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => void handleDeleteLoan(loan.id)}>
                                  <Icon name="trash-2" className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLoans.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 12, 24, 48]}
          />
        </div>
      )}

      <LoanDialog
        open={loanModalOpen}
        onOpenChange={setLoanModalOpen}
        editingLoan={editingLoan}
        currencySymbol={data.settings.currencySymbol}
        onSave={(loanData) => {
          void (async () => {
            try {
              if (editingLoan) {
                await updateLoan(editingLoan.id, loanData)
                toast.success("Loan updated")
              } else {
                await addLoan(loanData)
                toast.success("Loan created")
              }
              setLoanModalOpen(false)
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not save loan.")
            }
          })()
        }}
      />

      <Dialog open={repayModalOpen} onOpenChange={setRepayModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment for {targetLoan?.person}</DialogTitle>
            <DialogDescription>Enter the amount paid toward this record.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRepayment} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="dash-label">Payment amount ({data.settings.currencySymbol})</label>
              <Input
                type="number"
                step="any"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="Enter amount"
                className={dashInput}
                required
                autoFocus
              />
              {targetLoan ? (
                <p className="dash-caption">
                  Outstanding: {formatMoney(loanRemaining(targetLoan), { symbol: data.settings.currencySymbol })}
                </p>
              ) : null}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setRepayModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="dash" type="submit">
                Record payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashPage>
  )
}

function LoanDialog({
  open,
  onOpenChange,
  editingLoan,
  currencySymbol,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingLoan: Loan | null
  currencySymbol: string
  onSave: (loan: Omit<Loan, "id" | "createdAt">) => void
}) {
  const [direction, setDirection] = React.useState<LoanDirection>("borrowed")
  const [person, setPerson] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [amountRepaid, setAmountRepaid] = React.useState("0")
  const [date, setDate] = React.useState(todayISO())
  const [dueDate, setDueDate] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (editingLoan) {
      setDirection(editingLoan.direction)
      setPerson(editingLoan.person)
      setAmount(String(editingLoan.amount))
      setAmountRepaid(String(editingLoan.amountRepaid))
      setDate(editingLoan.date)
      setDueDate(editingLoan.dueDate ?? "")
      setReason(editingLoan.reason ?? "")
      setNotes(editingLoan.notes ?? "")
    } else {
      setDirection("borrowed")
      setPerson("")
      setAmount("")
      setAmountRepaid("0")
      setDate(todayISO())
      setDueDate("")
      setReason("")
      setNotes("")
    }
  }, [editingLoan, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    const numRepaid = parseFloat(amountRepaid) || 0
    if (!person.trim() || isNaN(numAmount) || numAmount <= 0) return

    onSave({
      direction,
      person: person.trim(),
      amount: numAmount,
      amountRepaid: Math.min(numAmount, numRepaid),
      date,
      dueDate: dueDate || undefined,
      reason: reason.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingLoan ? "Edit loan details" : "Add borrowed / lent record"}</DialogTitle>
          <DialogDescription>Track money taken from or given to others.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className={cn(dashSegment, "grid grid-cols-2 gap-1 p-1")}>
            <button
              type="button"
              onClick={() => setDirection("borrowed")}
              className={cn(
                dashSegmentItem,
                direction === "borrowed" ? "bg-[var(--dash-surface)] font-semibold text-destructive" : "",
              )}
            >
              I owe
            </button>
            <button
              type="button"
              onClick={() => setDirection("lent")}
              className={cn(
                dashSegmentItem,
                direction === "lent" ? "bg-[var(--dash-surface)] font-semibold text-success" : "",
              )}
            >
              Owed to me
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="dash-label">Person or entity</label>
            <Input
              placeholder="e.g. Rahim, Uncle, Brac Bank"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className={dashInput}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="dash-label">Total ({currencySymbol})</label>
              <Input
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={dashInput}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="dash-label">Already repaid</label>
              <Input
                type="number"
                step="any"
                placeholder="0"
                value={amountRepaid}
                onChange={(e) => setAmountRepaid(e.target.value)}
                className={dashInput}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="dash-label">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={dashInput} required />
            </div>
            <div className="space-y-1.5">
              <label className="dash-label">Due date (optional)</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={dashInput} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="dash-label">Reason</label>
            <Input
              placeholder="e.g. Emergency medical, rent gap"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={dashInput}
            />
          </div>

          <div className="space-y-1.5">
            <label className="dash-label">Notes</label>
            <Textarea
              placeholder="Any reminder notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="dash" type="submit">
              {editingLoan ? "Save changes" : "Create record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
