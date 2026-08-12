"use client"

import * as React from "react"
import { useUI } from "@/dashboard/layout/app-shell"
import {
  PageHeader,
  EmptyState,
  dashSegment,
  dashSegmentItem,
  dashSegmentItemActive,
  dashInput,
  DashPage,
  FilterToolbar,
  DateGroupHeader,
  Pagination,
} from "@/dashboard/shared"
import { TransactionRow } from "@/dashboard/transactions/transaction-row"
import { useStore } from "@/lib/store"
import { useTransactionList } from "@/lib/hooks/use-transaction-list"
import { sumExpenses, sumIncome } from "@/lib/selectors"
import { formatMoney } from "@/lib/format"
import { Icon } from "@/lib/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type TypeFilter = "all" | "expense" | "income"

export default function TransactionsPage() {
  const { data, transactionRevision } = useStore()
  const ui = useUI()

  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter])

  const { transactions, meta, statsTransactions, loading, error } = useTransactionList({
    page: currentPage,
    pageSize,
    typeFilter,
    search,
    revision: transactionRevision,
  })

  const totals = React.useMemo(() => {
    const income = sumIncome(statsTransactions)
    const expense = sumExpenses(statsTransactions)
    return {
      income,
      expense,
      net: income - expense,
      count: meta?.total ?? statsTransactions.length,
    }
  }, [statsTransactions, meta])

  const totalPages = Math.ceil((meta?.total ?? 0) / pageSize) || 1

  const grouped = React.useMemo(() => {
    const groups: { [date: string]: typeof transactions } = {}
    for (const tx of transactions) {
      const txDate = tx.date || "Unknown Date"
      if (!groups[txDate]) groups[txDate] = []
      groups[txDate].push(tx)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [transactions])

  const stats = [
    {
      label: "Entries",
      value: totals.count,
      icon: "receipt-text",
      cardBg: "bg-[#EEF4FF] dark:bg-[#102347]",
      textColor: "text-[#163870] dark:text-[#C7DBFF]",
      iconBg: "bg-[#CFE1FF] text-[#0E2854] dark:bg-[#1E3B6E] dark:text-[#C7DBFF]",
      labelColor: "text-[#1E4A94] dark:text-[#A8C7FF]",
    },
    {
      label: "Income",
      value: formatMoney(totals.income, { symbol: data.settings.currencySymbol }),
      icon: "arrow-down-left",
      cardBg: "bg-[#EBF7EE] dark:bg-[#0B2E17]",
      textColor: "text-[#134D25] dark:text-[#C1F0CC]",
      iconBg: "bg-[#C4EAD0] text-[#0C3B1B] dark:bg-[#194D27] dark:text-[#C1F0CC]",
      labelColor: "text-[#196631] dark:text-[#9EE5AF]",
    },
    {
      label: "Expenses",
      value: formatMoney(totals.expense, { symbol: data.settings.currencySymbol }),
      icon: "arrow-up-right",
      cardBg: "bg-[#FDF0E9] dark:bg-[#381B0E]",
      textColor: "text-[#6E2E10] dark:text-[#FCD5C5]",
      iconBg: "bg-[#FCD8C5] text-[#52200A] dark:bg-[#5C2A15] dark:text-[#FCD5C5]",
      labelColor: "text-[#8C3D18] dark:text-[#FBBFA8]",
    },
    {
      label: "Net",
      value: formatMoney(totals.net, { symbol: data.settings.currencySymbol, sign: true }),
      icon: "wallet",
      cardBg: "bg-[#FFF8D6] dark:bg-[#332A00]",
      textColor: "text-[#5C4500] dark:text-[#FFE999]",
      iconBg: "bg-[#FFE885] text-[#423200] dark:bg-[#524200] dark:text-[#FFE999]",
      labelColor: "text-[#7A5C00] dark:text-[#FFDF80]",
    },
  ]

  const isEmpty = !loading && transactions.length === 0

  return (
    <DashPage>
      <PageHeader title="Transactions" description="Search, filter, and review every expense and income entry.">
        <Button variant="dash" onClick={ui.openAdd} className="h-11 w-full gap-1.5 px-5 sm:w-auto">
          <Icon name="plus" className="size-4" />
          Add transaction
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 min-w-0 sm:gap-4 lg:grid-cols-4">
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

      <FilterToolbar>
        <div className="relative min-w-0 flex-1">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-(--dash-text-faint)"
          />
          <Input
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(dashInput, "border-0 bg-(--dash-surface) pl-10 shadow-none")}
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--dash-text-muted) hover:text-(--dash-text)"
              aria-label="Clear search"
            >
              <Icon name="x" className="size-4" />
            </button>
          ) : null}
        </div>

        <div className={cn(dashSegment, "w-full shrink-0 bg-(--dash-surface) sm:w-auto")}>
          {(["all", "expense", "income"] as TypeFilter[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTypeFilter(tf)}
              className={cn(
                dashSegmentItem,
                "flex-1 capitalize sm:flex-none",
                typeFilter === tf ? dashSegmentItemActive : "hover:text-(--dash-text)",
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </FilterToolbar>

      {error ? (
        <EmptyState icon="circle-alert" title="Could not load transactions" message={error} />
      ) : loading ? (
        <div className="py-16 text-center text-sm text-(--dash-text-muted)">Loading transactions...</div>
      ) : isEmpty ? (
        <EmptyState
          icon="receipt-text"
          title="No transactions found"
          message={
            search || typeFilter !== "all"
              ? "Nothing matches your current filters. Try adjusting search or type."
              : "Your ledger is empty. Add your first expense or income to get started."
          }
          action={
            search || typeFilter !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setTypeFilter("all")
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button variant="dash" onClick={ui.openAdd}>
                Add first transaction
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-6 sm:space-y-8">
            {grouped.map(([date, txs]) => {
              const dayIncome = sumIncome(txs)
              const dayExpense = sumExpenses(txs)

              return (
                <section key={date} className="space-y-2">
                  <DateGroupHeader
                    date={date}
                    income={dayIncome}
                    expense={dayExpense}
                    currencySymbol={data.settings.currencySymbol}
                  />

                  <div className="space-y-2">
                    {txs.map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} onEdit={ui.openEdit} showDate={false} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={meta?.total ?? 0}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}
    </DashPage>
  )
}
