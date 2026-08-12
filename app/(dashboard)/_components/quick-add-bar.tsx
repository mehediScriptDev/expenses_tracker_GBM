"use client"

import * as React from "react"
import { useStore } from "@/lib/store"
import { Icon } from "@/lib/icon"
import { todayISO, nowTime, formatMoney } from "@/lib/format"
import type { QuickAddPreset, PaymentMethod } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardCard, dashCaption, dashInput, dashMuted } from "@/dashboard/shared"
import { QuickAddPresetsManager } from "@/dashboard/quick-add-presets-manager"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function QuickAddBar() {
  const { data, addTransaction, deleteTransaction } = useStore()
  const [text, setText] = React.useState("")

  const presets = data.quickAddPresets

  const parsed = React.useMemo(() => {
    if (!text.trim()) return null

    const tokens = text.trim().split(/\s+/)
    let amount = 0
    let categoryId = data.categories.find((c) => c.name.toLowerCase() === "other")?.id ?? data.categories[0]?.id ?? ""
    let paymentMethod: PaymentMethod = "cash"
    let type: "expense" | "income" = "expense"
    const descWords: string[] = []

    const paymentKeywords: Record<string, PaymentMethod> = {
      cash: "cash",
      bkash: "bkash",
      nagad: "nagad",
      rocket: "rocket",
      card: "card",
      bank: "bank",
    }

    const catMap = new Map(data.categories.map((c) => [c.id, c.id]))
    const catNameMap = new Map(data.categories.map((c) => [c.name.toLowerCase(), c.id]))

    for (const token of tokens) {
      const lower = token.toLowerCase()

      if (!amount && /^\d+(\.\d+)?$/.test(token)) {
        amount = parseFloat(token)
        continue
      }

      if (paymentKeywords[lower]) {
        paymentMethod = paymentKeywords[lower]
        continue
      }

      if (lower === "income" || lower === "salary" || lower === "freelance") {
        type = "income"
      }

      if (catMap.has(lower)) {
        categoryId = catMap.get(lower)!
        continue
      } else if (catNameMap.has(lower)) {
        categoryId = catNameMap.get(lower)!
        continue
      }

      descWords.push(token)
    }

    const description = descWords.join(" ") || "Quick Transaction"

    return { amount, description, categoryId, paymentMethod, type }
  }, [text, data.categories])

  const handleQuickAddPreset = async (preset: QuickAddPreset) => {
    try {
      const tx = await addTransaction({
        type: "expense",
        amount: preset.amount,
        categoryId: preset.categoryId,
        description: preset.label,
        date: todayISO(),
        time: nowTime(),
        paymentMethod: preset.paymentMethod,
        recurring: false,
      })

      toast.success(`Added ${preset.label} (${formatMoney(preset.amount, { symbol: data.settings.currencySymbol })})`, {
        action: { label: "Undo", onClick: () => void deleteTransaction(tx.id) },
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add transaction.")
    }
  }

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parsed || parsed.amount <= 0) {
      toast.error("Please enter a valid amount (e.g. 'Coffee 150')")
      return
    }

    try {
      const tx = await addTransaction({
        type: parsed.type,
        amount: parsed.amount,
        categoryId: parsed.categoryId,
        description: parsed.description,
        date: todayISO(),
        time: nowTime(),
        paymentMethod: parsed.paymentMethod,
        recurring: false,
      })

      setText("")
      toast.success(
        `Added ${parsed.description} (${formatMoney(parsed.amount, { symbol: data.settings.currencySymbol })})`,
        { action: { label: "Undo", onClick: () => void deleteTransaction(tx.id) } },
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add transaction.")
    }
  }

  return (
    <DashboardCard
      title="Quick add"
      description="Log spending in one tap or one line"
      action={<QuickAddPresetsManager compact />}
      bodyClassName="space-y-4"
    >
      {presets.length === 0 ? (
        <div className={cn(dashMuted, "px-4 py-6 text-center")}>
          <p className="text-sm font-semibold text-(--dash-text)">No quick-add buttons yet</p>
          <p className={cn(dashCaption, "mt-1")}>
            Add presets in Settings to log coffee, lunch, transport, and more in one tap.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleQuickAddPreset(p)}
              className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all hover:bg-amber-50 hover:border-amber-400 hover:text-amber-900 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 hover:scale-[1.02] active:scale-[0.98] sm:min-h-11 sm:px-3.5 sm:py-2.5 sm:text-sm cursor-pointer group"
            >
              <Icon name={p.icon} className="size-4 shrink-0 text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
              <span className="truncate max-w-[100px] sm:max-w-none">{p.label}</span>
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 bg-white/70 dark:bg-slate-900/60 px-1.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                {formatMoney(p.amount, { symbol: data.settings.currencySymbol })}
              </span>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSmartSubmit} className="flex flex-col gap-2 sm:flex-row items-stretch">
        <div className="relative min-w-0 flex-1">
          <Input
            placeholder="e.g. Lunch 180 food bkash"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={cn("h-11", dashInput, "w-full text-xs sm:text-sm")}
          />
          {text ? (
            <button
              type="button"
              onClick={() => setText("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--dash-text-faint) hover:text-(--dash-text)"
              aria-label="Clear input"
            >
              <Icon name="x" className="size-4" />
            </button>
          ) : null}
        </div>
        <Button type="submit" variant="dash" className="h-11 w-full shrink-0 px-6 sm:w-auto">
          Log
        </Button>
      </form>

      {parsed && parsed.amount > 0 ? (
        <div className={cn(dashMuted, "flex flex-wrap items-center gap-1.5 px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm")}>
          <span className="font-semibold text-(--dash-text)">{parsed.description}</span>
          <span className="text-(--dash-text-faint)">·</span>
          <span className="font-medium uppercase text-(--dash-text-muted)">{parsed.categoryId}</span>
          <span className="text-(--dash-text-faint)">·</span>
          <span className="font-mono font-bold text-(--dash-text)">
            {formatMoney(parsed.amount, { symbol: data.settings.currencySymbol })}
          </span>
        </div>
      ) : (
        <p className={dashCaption}>Tip: type amount, description, category, and payment method together.</p>
      )}
    </DashboardCard>
  )
}
