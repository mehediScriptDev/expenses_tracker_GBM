"use client"

import * as React from "react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { Icon } from "@/lib/icon"
import { formatMoney } from "@/lib/format"
import { PAYMENT_METHODS, QUICK_ADD_ICON_CHOICES } from "@/lib/constants"
import type { QuickAddPreset, PaymentMethod } from "@/types"
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
import { dashCaption, dashInput, dashLabel, dashLink, dashMuted, DashboardCard } from "@/dashboard/shared"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function QuickAddPresetsManager({ compact = false }: { compact?: boolean }) {
  const { data, addQuickAddPreset, updateQuickAddPreset, deleteQuickAddPreset } = useStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<QuickAddPreset | null>(null)

  const expenseCategories = data.categories.filter((c) => c.kind === "expense")

  const openAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (preset: QuickAddPreset) => {
    setEditing(preset)
    setDialogOpen(true)
  }

  const handleDelete = async (preset: QuickAddPreset) => {
    try {
      await deleteQuickAddPreset(preset.id)
      toast.success(`Removed "${preset.label}"`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete preset.")
    }
  }

  if (compact) {
    return (
      <Link href="/settings#quick-add-presets" className={dashLink}>
        Customize
      </Link>
    )
  }

  return (
    <div id="quick-add-presets" className="scroll-mt-24">
      <DashboardCard
        title="Quick add presets"
        description="Customize the one-tap expense buttons on your dashboard."
        action={
          <Button variant="dash" onClick={openAdd} className="h-9 shrink-0 gap-1.5 px-3.5 text-xs font-semibold">
            <Icon name="plus" className="size-3.5" />
            Add preset
          </Button>
        }
      >
        {data.quickAddPresets.length === 0 ? (
          <div className={cn(dashMuted, "px-5 py-8 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800")}>
            <p className="text-sm font-semibold text-(--dash-text)">No presets yet</p>
            <p className={cn(dashCaption, "mt-1")}>Create shortcuts for coffee, lunch, transport, and more.</p>
            <Button variant="dash" onClick={openAdd} className="mt-4 h-9 text-xs">
              Create first preset
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.quickAddPresets.map((preset) => {
              const cat = data.categories.find((c) => c.id === preset.categoryId)
              const pm = PAYMENT_METHODS.find((p) => p.value === preset.paymentMethod)
              return (
                <li
                  key={preset.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-(--dash-border) bg-(--dash-surface) shadow-2xs hover:border-(--dash-border-strong) transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--dash-muted) text-(--dash-text-muted) shadow-2xs">
                      <Icon name={preset.icon} className="size-4.5" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-extrabold text-(--dash-text)">{preset.label}</p>
                        <span className="text-[10px] font-mono font-black text-(--dash-text) bg-(--dash-muted) px-1.5 py-0.2 rounded">
                          {formatMoney(preset.amount, { symbol: data.settings.currencySymbol })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-(--dash-text-muted)">
                        <span>{cat?.name ?? preset.categoryId}</span>
                        <span>•</span>
                        <span>{pm?.label ?? preset.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(preset)}
                      className="flex size-7.5 items-center justify-center rounded-lg border border-(--dash-border) bg-(--dash-surface) text-(--dash-text-muted) hover:border-(--dash-text) hover:bg-(--dash-text) hover:text-white transition-all cursor-pointer shadow-2xs"
                      title="Edit preset"
                    >
                      <Icon name="pencil" className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(preset)}
                      className="flex size-7.5 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                      title="Delete preset"
                    >
                      <Icon name="trash-2" className="size-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DashboardCard>

      <PresetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        categories={expenseCategories}
        currencySymbol={data.settings.currencySymbol}
        onSave={(payload) => {
          void (async () => {
            try {
              if (editing) {
                await updateQuickAddPreset(editing.id, payload)
                toast.success("Preset updated")
              } else {
                await addQuickAddPreset(payload)
                toast.success("Preset added")
              }
              setDialogOpen(false)
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Could not save preset.")
            }
          })()
        }}
      />
    </div>
  )
}

function PresetDialog({
  open,
  onOpenChange,
  editing,
  categories,
  currencySymbol,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: QuickAddPreset | null
  categories: { id: string; name: string }[]
  currencySymbol: string
  onSave: (payload: Omit<QuickAddPreset, "id">) => void
}) {
  const [label, setLabel] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("food")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cash")
  const [icon, setIcon] = React.useState("coffee")

  React.useEffect(() => {
    if (editing) {
      setLabel(editing.label)
      setAmount(String(editing.amount))
      setCategoryId(editing.categoryId)
      setPaymentMethod(editing.paymentMethod)
      setIcon(editing.icon)
    } else {
      setLabel("")
      setAmount("")
      setCategoryId(categories[0]?.id ?? "food")
      setPaymentMethod("cash")
      setIcon("coffee")
    }
  }, [editing, open, categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (!label.trim() || isNaN(num) || num <= 0) return
    onSave({
      label: label.trim(),
      amount: num,
      categoryId,
      paymentMethod,
      icon,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit preset" : "Add preset"}</DialogTitle>
          <DialogDescription>
            This button will appear on your dashboard for one-tap logging.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <label className={dashLabel}>Label</label>
            <Input
              className={dashInput}
              placeholder="e.g. Coffee, Lunch, Bus"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={dashLabel}>Amount ({currencySymbol})</label>
              <Input
                className={dashInput}
                type="number"
                min={1}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className={dashLabel}>Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="dash-input w-full px-3"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={dashLabel}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="dash-input w-full px-3"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={dashLabel}>Icon</label>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
              {QUICK_ADD_ICON_CHOICES.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl transition-colors",
                    icon === ic
                      ? "bg-(--dash-text) text-white"
                      : "bg-(--dash-muted) text-(--dash-text-muted) hover:bg-(--dash-muted-hover)",
                  )}
                >
                  <Icon name={ic} className="size-4" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="dash">
              {editing ? "Save changes" : "Add preset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
