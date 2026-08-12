"use client"

import type { Transaction } from "@/types"
import { useStore } from "@/lib/store"
import { getCategory } from "@/lib/selectors"
import { formatMoney, formatTime, relativeDay } from "@/lib/format"
import { Icon } from "@/lib/icon"
import { cn } from "@/lib/utils"
import { PAYMENT_METHODS } from "@/lib/constants"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function TransactionRow({
  tx,
  onEdit,
  showDate = true,
}: {
  tx: Transaction
  onEdit?: (tx: Transaction) => void
  showDate?: boolean
}) {
  const { data, deleteTransaction, duplicateTransaction } = useStore()
  const cat = getCategory(data, tx.categoryId)
  const isIncome = tx.type === "income"
  const pm = PAYMENT_METHODS.find((p) => p.value === tx.paymentMethod)
  const accent = cat?.color ?? "var(--muted-foreground)"

  const handleDuplicate = async () => {
    try {
      await duplicateTransaction(tx.id)
      toast.success("Transaction duplicated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not duplicate transaction.")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTransaction(tx.id)
      toast.success("Transaction deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete transaction.")
    }
  }

  const meta = [
    cat?.name,
    pm?.label,
    showDate ? relativeDay(tx.date) : null,
    formatTime(tx.time),
  ].filter(Boolean)

  return (
    <article className="group flex items-center gap-3.5 rounded-xl bg-white dark:bg-card px-3.5 py-3.5 shadow-2xs border border-neutral-200/60 dark:border-neutral-800 transition-all hover:bg-neutral-50/50">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl shadow-2xs"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 18%, white)`,
          color: accent,
        }}
      >
        <Icon name={cat?.icon ?? "circle"} className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {tx.description || cat?.name || "Transaction"}
              {tx.recurring ? (
                <Icon name="repeat" className="ml-1.5 inline size-3 text-slate-400" aria-hidden />
              ) : null}
            </p>
            {meta.length > 0 ? (
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{meta.join(" · ")}</p>
            ) : null}
          </div>

          <span
            className={cn(
              "shrink-0 font-mono text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg",
              isIncome
                ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 ring-1 ring-emerald-200/70 dark:ring-emerald-800/60"
                : "text-rose-600 dark:text-rose-400 font-extrabold",
            )}
          >
            {isIncome ? formatMoney(tx.amount, { sign: true }) : `-${formatMoney(tx.amount)}`}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-(--dash-text-muted) opacity-100 sm:opacity-0 sm:group-hover:opacity-100 data-popup-open:opacity-100"
              aria-label="Transaction actions"
            >
              <Icon name="ellipsis-vertical" className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {onEdit ? (
            <DropdownMenuItem onClick={() => onEdit(tx)}>
              <Icon name="pencil" className="size-4" />
              Edit
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => void handleDuplicate()}>
            <Icon name="copy" className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => void handleDelete()}>
            <Icon name="trash-2" className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  )
}
