"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOODS, PAYMENT_METHODS } from "@/lib/constants"
import { nowTime, todayISO } from "@/lib/format"
import { useStore } from "@/lib/store"
import type { Mood, PaymentMethod, Transaction, TransactionType } from "@/types"
import { Icon } from "@/lib/icon"
import { cn } from "@/lib/utils"

export interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Transaction | null
}

interface FormState {
  type: TransactionType
  amount: string
  categoryId: string
  description: string
  date: string
  time: string
  paymentMethod: PaymentMethod
  mood: Mood | "none"
  recurring: boolean
}

function emptyForm(): FormState {
  return {
    type: "expense",
    amount: "",
    categoryId: "food",
    description: "",
    date: todayISO(),
    time: nowTime(),
    paymentMethod: "cash",
    mood: "none",
    recurring: false,
  }
}

function fromTx(tx: Transaction): FormState {
  return {
    type: tx.type,
    amount: String(tx.amount),
    categoryId: tx.categoryId,
    description: tx.description,
    date: tx.date,
    time: tx.time,
    paymentMethod: tx.paymentMethod,
    mood: tx.mood ?? "none",
    recurring: tx.recurring,
  }
}

export function TransactionDialog({ open, onOpenChange, editing }: TransactionDialogProps) {
  const { data, addTransaction, updateTransaction } = useStore()
  const [form, setForm] = React.useState<FormState>(emptyForm)

  React.useEffect(() => {
    if (open) {
      setForm(editing ? fromTx(editing) : emptyForm())
    }
  }, [open, editing])

  const categories = data.categories.filter((c) => c.kind === form.type)
  const categoryItems = categories.map((c) => ({ value: c.id, label: c.name }))

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number.parseFloat(form.amount)
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    const payload = {
      type: form.type,
      amount,
      categoryId: form.categoryId,
      description: form.description.trim() || "Untitled",
      date: form.date,
      time: form.time,
      paymentMethod: form.paymentMethod,
      mood: form.mood === "none" ? undefined : form.mood,
      tags: [],
      recurring: form.recurring,
    }
    if (editing) {
      updateTransaction(editing.id, payload)
      toast.success("Transaction updated")
    } else {
      addTransaction(payload)
      toast.success(form.type === "income" ? "Income added" : "Expense added")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update the details below." : "Record where your money is going."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* type toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#F2EFE9] p-1">
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  const first = data.categories.find((c) => c.kind === t)
                  setForm((f) => ({ ...f, type: t, categoryId: first?.id ?? f.categoryId }))
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  form.type === t
                    ? t === "income"
                      ? "bg-success text-success-foreground"
                      : "bg-white text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* amount */}
          <div className="grid gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {data.settings.currencySymbol}
              </span>
              <Input
                id="amount"
                inputMode="decimal"
                autoFocus
                placeholder="0"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className="pl-7 text-lg tabular"
              />
            </div>
          </div>

          {/* category + payment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                items={categoryItems}
                value={form.categoryId}
                onValueChange={(v) => set("categoryId", v as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <Icon name={c.icon} className="size-4 text-muted-foreground" />
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Payment</Label>
              <Select
                items={PAYMENT_METHODS}
                value={form.paymentMethod}
                onValueChange={(v) => set("paymentMethod", v as PaymentMethod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* description */}
          <div className="grid gap-1.5">
            <Label htmlFor="desc">Description</Label>
            <Input
              id="desc"
              placeholder="e.g. Lunch at campus"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
              />
            </div>
          </div>

          {/* mood */}
          {form.type === "expense" && (
            <div className="grid gap-1.5">
              <Label>How did it feel?</Label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => set("mood", form.mood === m.value ? "none" : m.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors",
                      form.mood === m.value
                        ? "bg-neutral-900 text-white"
                        : "bg-[#F2EFE9] text-muted-foreground hover:bg-[#EBE6DE]",
                    )}
                  >
                    <Icon name={m.icon} className="size-3.5" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}


          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="dash">{editing ? "Save changes" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
