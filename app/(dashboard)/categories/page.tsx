"use client"

import * as React from "react"
import {
  PageHeader,
  EmptyState,
  CategoryBadge,
  dashSegment,
  dashSegmentItem,
  dashSegmentItemActive,
  dashInput,
  DashPage,
  SummaryBar,
  FilterToolbar,
  StatusBadge,
  Pagination,
  ProgressBar,
} from "@/dashboard/shared"
import { useStore } from "@/lib/store"
import { useCategoryStats } from "@/lib/hooks/use-category-stats"
import { formatMoney } from "@/lib/format"
import { Icon } from "@/lib/icon"
import { CATEGORY_COLOR_CHOICES, CATEGORY_ICON_CHOICES } from "@/lib/constants"
import type { Category, CategoryKind } from "@/types"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CategoryFilter = "expense" | "income" | "overbudget" | "undertarget" | "all"

export default function CategoriesPage() {
  const { data, addCategory, updateCategory, deleteCategory, setBudget, removeBudget, transactionRevision } = useStore()
  const { categoryStats } = useCategoryStats(transactionRevision)

  const [filter, setFilter] = React.useState<CategoryFilter>("expense")
  const [search, setSearch] = React.useState("")

  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(9)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  const filteredCategories = React.useMemo(() => {
    return data.categories.filter((cat) => {
      const spent = categoryStats[cat.id]?.total ?? 0
      const limit = data.budgets[cat.id]

      if (filter === "expense") {
        if (cat.kind !== "expense") return false
      } else if (filter === "income") {
        if (cat.kind !== "income") return false
      } else if (filter === "overbudget") {
        if (cat.kind !== "expense") return false
        if (!limit || limit <= 0 || spent <= limit) return false
      } else if (filter === "undertarget") {
        if (cat.kind !== "expense") return false
        if (!limit || limit <= 0 || spent > limit) return false
      }

      if (search.trim()) {
        const q = search.toLowerCase().trim()
        if (!cat.name.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [data.categories, data.budgets, categoryStats, filter, search])

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1

  const paginatedCategories = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCategories.slice(start, start + pageSize)
  }, [filteredCategories, currentPage, pageSize])

  const expenseCount = data.categories.filter((c) => c.kind === "expense").length
  const incomeCount = data.categories.filter((c) => c.kind === "income").length
  const filteredTotal = filteredCategories.reduce(
    (sum, cat) => sum + (categoryStats[cat.id]?.total ?? 0),
    0,
  )

  const budgetInsights = React.useMemo(() => {
    let overCount = 0
    let overAmount = 0
    let underCount = 0
    let topSpender = { name: "None", amount: 0 }

    for (const cat of data.categories) {
      if (cat.kind !== "expense") continue
      const spent = categoryStats[cat.id]?.total ?? 0
      const limit = data.budgets[cat.id]

      if (spent > topSpender.amount) {
        topSpender = { name: cat.name, amount: spent }
      }

      if (limit && limit > 0) {
        if (spent > limit) {
          overCount++
          overAmount += spent - limit
        } else {
          underCount++
        }
      }
    }

    return { overCount, overAmount, underCount, topSpender }
  }, [data.categories, data.budgets, categoryStats])

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id)
      toast.success("Category deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete category.")
    }
  }

  const handleSaveCategory = async (
    catData: Omit<Category, "id" | "isCustom">,
    budgetLimit?: number,
  ) => {
    try {
      let catId = editingCategory?.id
      if (editingCategory) {
        await updateCategory(editingCategory.id, catData)
      } else {
        const newCat = await addCategory(catData)
        catId = newCat.id
      }

      if (catId) {
        if (budgetLimit && budgetLimit > 0) {
          await setBudget(catId, budgetLimit)
        } else {
          await removeBudget(catId)
        }
      }

      toast.success(editingCategory ? "Category updated" : "Category created")
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save category.")
    }
  }

  const stats: {
    label: string
    value: string | number
    icon: string
    cardBg: string
    textColor: string
    iconBg: string
    labelColor: string
    filterKey: CategoryFilter
  }[] = [
    {
      label: "Over Budget",
      value: budgetInsights.overCount,
      icon: "alert-triangle",
      cardBg: "bg-[#FEE2E2] dark:bg-[#451212]",
      textColor: "text-[#991B1B] dark:text-[#FCA5A5]",
      iconBg: "bg-[#FCA5A5] text-[#7F1D1D] dark:bg-[#7F1D1D] dark:text-[#FCA5A5]",
      labelColor: "text-[#B91C1C] dark:text-[#FCA5A5]",
      filterKey: "overbudget",
    },
    {
      label: "Under Target",
      value: budgetInsights.underCount,
      icon: "check-circle-2",
      cardBg: "bg-[#EBF7EE] dark:bg-[#0B2E17]",
      textColor: "text-[#134D25] dark:text-[#C1F0CC]",
      iconBg: "bg-[#C4EAD0] text-[#0C3B1B] dark:bg-[#194D27] dark:text-[#C1F0CC]",
      labelColor: "text-[#196631] dark:text-[#9EE5AF]",
      filterKey: "undertarget",
    },
    {
      label: "Top Spender",
      value: budgetInsights.topSpender.name,
      icon: "flame",
      cardBg: "bg-[#EEF4FF] dark:bg-[#102347]",
      textColor: "text-[#163870] dark:text-[#C7DBFF]",
      iconBg: "bg-[#CFE1FF] text-[#0E2854] dark:bg-[#1E3B6E] dark:text-[#C7DBFF]",
      labelColor: "text-[#1E4A94] dark:text-[#A8C7FF]",
      filterKey: "expense",
    },
    {
      label: "Total Spend",
      value: formatMoney(filteredTotal, { symbol: data.settings.currencySymbol, compact: true }),
      icon: "receipt-text",
      cardBg: "bg-[#FFF8D6] dark:bg-[#332A00]",
      textColor: "text-[#5C4500] dark:text-[#FFE999]",
      iconBg: "bg-[#FFE885] text-[#423200] dark:bg-[#524200] dark:text-[#FFE999]",
      labelColor: "text-[#7A5C00] dark:text-[#FFDF80]",
      filterKey: "all",
    },
  ]

  return (
    <DashPage>
      <PageHeader
        title="Categories"
        description="Organize spending and income with custom icons, colors, and labels."
      >
        <Button onClick={handleOpenAdd} className="h-11 w-full gap-1.5 px-5 sm:w-auto">
          <Icon name="plus" className="size-4" />
          Add category
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 min-w-0 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => setFilter(stat.filterKey)}
            className={cn(
              "min-w-0 text-left overflow-hidden rounded-xl p-3.5 sm:p-4.5 transition-transform hover:-translate-y-0.5 border border-black/5 dark:border-white/5 shadow-2xs cursor-pointer",
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
          </button>
        ))}
      </div>

      <FilterToolbar className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="overflow-x-auto pb-1 max-w-full no-scrollbar">
          <div className={cn(dashSegment, "inline-flex w-auto bg-[var(--dash-surface)] shrink-0 whitespace-nowrap")}>
            <button
              type="button"
              onClick={() => setFilter("expense")}
              className={cn(
                dashSegmentItem,
                filter === "expense" ? dashSegmentItemActive : "hover:text-[var(--dash-text)]",
              )}
            >
              Expense ({expenseCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("income")}
              className={cn(
                dashSegmentItem,
                filter === "income" ? dashSegmentItemActive : "hover:text-[var(--dash-text)]",
              )}
            >
              Income ({incomeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("overbudget")}
              className={cn(
                dashSegmentItem,
                filter === "overbudget" ? dashSegmentItemActive : "hover:text-[var(--dash-text)]",
              )}
            >
              Over Budget ({budgetInsights.overCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("undertarget")}
              className={cn(
                dashSegmentItem,
                filter === "undertarget" ? dashSegmentItemActive : "hover:text-[var(--dash-text)]",
              )}
            >
              Under Target ({budgetInsights.underCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                dashSegmentItem,
                filter === "all" ? dashSegmentItemActive : "hover:text-[var(--dash-text)]",
              )}
            >
              All
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--dash-text-faint)]"
          />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(dashInput, "h-11 border-0 bg-[var(--dash-surface)] pl-10 shadow-none")}
          />
        </div>
      </FilterToolbar>

      {filteredCategories.length === 0 ? (
        <EmptyState
          icon="shapes"
          title="No categories found"
          message="Adjust your filters or create a new category to get started."
          action={<Button onClick={handleOpenAdd}>Add category</Button>}
        />
      ) : (
        <div className="space-y-6">
          {/* Mobile Card Grid (Visible on mobile screens) */}
          <div className="grid gap-3.5 sm:hidden">
            {paginatedCategories.map((cat) => {
              const stat = categoryStats[cat.id] ?? { total: 0, count: 0 }
              const budgetLimit = data.budgets[cat.id]
              const hasBudget = cat.kind === "expense" && budgetLimit && budgetLimit > 0
              const pct = hasBudget ? Math.round((stat.total / budgetLimit!) * 100) : 0

              return (
                <div
                  key={cat.id}
                  className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-card p-4 shadow-2xs space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Icon name={cat.icon} className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-neutral-900 dark:text-neutral-50 truncate text-base">
                          {cat.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                              cat.kind === "expense"
                                ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40",
                            )}
                          >
                            {cat.kind}
                          </span>
                          {cat.isCustom ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40">
                              Custom
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black transition-all cursor-pointer shadow-2xs"
                        title="Edit category"
                      >
                        <Icon name="pencil" className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(cat.id)}
                        className="flex size-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                        title="Delete category"
                      >
                        <Icon name="trash-2" className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial metrics */}
                  <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400 font-semibold">Total Spent / Earned</span>
                      <span className="font-mono font-black text-neutral-900 dark:text-neutral-100 text-sm">
                        {formatMoney(stat.total, { symbol: data.settings.currencySymbol })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400 font-semibold">Monthly Budget</span>
                      <span className="font-mono font-bold text-neutral-600 dark:text-neutral-400 text-xs">
                        {budgetLimit && budgetLimit > 0
                          ? formatMoney(budgetLimit, { symbol: data.settings.currencySymbol })
                          : "No limit"}
                      </span>
                    </div>

                    {hasBudget ? (
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className="text-neutral-500 dark:text-neutral-400 font-semibold">Budget Progress</span>
                        <span className={cn("font-mono font-black text-sm", pct > 100 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                          {pct}%
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Data Table (Visible on tablet & desktop screens) */}
          <div className="hidden sm:block overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-card shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50/80 dark:bg-neutral-900/50 border-b border-neutral-200/80 dark:border-neutral-800 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <tr>
                    <th scope="col" className="py-3.5 pl-5 pr-3">Category</th>
                    <th scope="col" className="px-3 py-3.5">Type</th>
                    <th scope="col" className="px-3 py-3.5">Activity</th>
                    <th scope="col" className="px-3 py-3.5 text-center">Total Spent / Earned</th>
                    <th scope="col" className="px-3 py-3.5 text-center">Monthly Budget</th>
                    <th scope="col" className="px-3 py-3.5 text-center">Budget Progress</th>
                    <th scope="col" className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                  {paginatedCategories.map((cat) => {
                    const stat = categoryStats[cat.id] ?? { total: 0, count: 0 }
                    const budgetLimit = data.budgets[cat.id]
                    const hasBudget = cat.kind === "expense" && budgetLimit && budgetLimit > 0
                    const pct = hasBudget ? Math.round((stat.total / budgetLimit!) * 100) : 0

                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors"
                      >
                        {/* Category Icon & Name */}
                        <td className="py-3.5 pl-5 pr-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                              style={{ backgroundColor: cat.color }}
                            >
                              <Icon name={cat.icon} className="size-4.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{cat.name}</p>
                              {cat.isCustom ? (
                                <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                  Custom
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                              cat.kind === "expense"
                                ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40",
                            )}
                          >
                            {cat.kind}
                          </span>
                        </td>

                        {/* Activity */}
                        <td className="px-3 py-3.5 whitespace-nowrap font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {stat.count} {stat.count === 1 ? "entry" : "entries"}
                        </td>

                        {/* Total Spent / Earned */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-center font-mono font-black text-neutral-900 dark:text-neutral-50">
                          {formatMoney(stat.total, { symbol: data.settings.currencySymbol })}
                        </td>

                        {/* Monthly Budget */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-center font-mono text-neutral-600 dark:text-neutral-400">
                          {budgetLimit && budgetLimit > 0
                            ? formatMoney(budgetLimit, { symbol: data.settings.currencySymbol })
                            : "No limit"}
                        </td>

                        {/* Budget Progress (Percentage text only e.g. 40%, 300%) */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-center">
                          {hasBudget ? (
                            <span className={cn("font-mono font-black text-sm", pct > 100 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-black transition-all cursor-pointer shadow-2xs"
                              title="Edit category"
                              aria-label={`Edit ${cat.name}`}
                            >
                              <Icon name="pencil" className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDelete(cat.id)}
                              className="flex size-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer shadow-2xs"
                              title="Delete category"
                              aria-label={`Delete ${cat.name}`}
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredCategories.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[9, 18, 27, 45]}
          />
        </div>
      )}

      <CategoryModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingCategory={editingCategory}
        initialBudget={editingCategory ? data.budgets[editingCategory.id] : undefined}
        currencySymbol={data.settings.currencySymbol}
        onSave={(catData, budgetLimit) => void handleSaveCategory(catData, budgetLimit)}
      />
    </DashPage>
  )
}

function CategoryModal({
  open,
  onOpenChange,
  editingCategory,
  initialBudget,
  currencySymbol,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCategory: Category | null
  initialBudget?: number
  currencySymbol: string
  onSave: (cat: Omit<Category, "id" | "isCustom">, budgetLimit?: number) => void
}) {
  const [name, setName] = React.useState("")
  const [kind, setKind] = React.useState<CategoryKind>("expense")
  const [icon, setIcon] = React.useState("shapes")
  const [color, setColor] = React.useState("var(--chart-4)")
  const [budgetInput, setBudgetInput] = React.useState("")

  React.useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name)
      setKind(editingCategory.kind)
      setIcon(editingCategory.icon)
      setColor(editingCategory.color)
      setBudgetInput(initialBudget && initialBudget > 0 ? String(initialBudget) : "")
    } else {
      setName("")
      setKind("expense")
      setIcon("shapes")
      setColor("var(--chart-4)")
      setBudgetInput("")
    }
  }, [editingCategory, initialBudget, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const parsedBudget = parseFloat(budgetInput)
    const budgetLimit = !isNaN(parsedBudget) && parsedBudget > 0 ? parsedBudget : undefined

    onSave(
      {
        name: name.trim(),
        kind,
        icon,
        color,
      },
      budgetLimit,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingCategory ? "Edit category" : "Add custom category"}</DialogTitle>
          <DialogDescription>Customize name, type, icon, color, and optional budget limit.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className={cn(dashSegment, "grid grid-cols-2 gap-1 p-1")}>
            <button
              type="button"
              onClick={() => setKind("expense")}
              className={cn(
                dashSegmentItem,
                "w-full",
                kind === "expense" ? dashSegmentItemActive : "hover:text-[var(--dash-text)]",
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setKind("income")}
              className={cn(
                dashSegmentItem,
                "w-full",
                kind === "income" ? dashSegmentItemActive : "hover:text-[var(--dash-text)]",
              )}
            >
              Income
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="dash-label">Category name</label>
            <Input
              placeholder="e.g. Subscriptions, Groceries, Freelance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={dashInput}
              required
            />
          </div>

          {kind === "expense" ? (
            <div className="space-y-1.5">
              <label className="dash-label flex items-center justify-between">
                <span>Monthly budget limit ({currencySymbol})</span>
                <span className="text-2xs font-medium text-neutral-400">Optional</span>
              </label>
              <Input
                type="number"
                placeholder="e.g. 5000 (leave empty for no limit)"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className={dashInput}
                min="0"
                step="any"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="dash-label">Color</label>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_COLOR_CHOICES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-8 rounded-full transition-transform",
                    color === c ? "scale-110 ring-2 ring-ring ring-offset-2 ring-offset-background" : "",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="dash-label">Icon</label>
            <div className="grid max-h-40 grid-cols-6 gap-2 overflow-y-auto rounded-xl bg-[var(--dash-muted)] p-2">
              {CATEGORY_ICON_CHOICES.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg transition-colors",
                    icon === ic
                      ? "bg-neutral-900 text-white"
                      : "bg-[var(--dash-surface)] text-[var(--dash-text)] hover:bg-white",
                  )}
                  aria-label={`Select icon ${ic}`}
                >
                  <Icon name={ic} className="size-4" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="dash" type="submit">
              {editingCategory ? "Save category" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
