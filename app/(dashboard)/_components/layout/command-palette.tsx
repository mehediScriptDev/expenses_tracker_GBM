"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { useTransactionSearch } from "@/lib/hooks/use-transaction-search"
import { formatMoney } from "@/lib/format"
import { getCategory } from "@/lib/selectors"
import { Icon } from "@/lib/icon"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function CommandPalette({
  open,
  onOpenChange,
  onOpenAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenAdd: () => void
}) {
  const router = useRouter()
  const { data, transactionRevision } = useStore()
  const [query, setQuery] = React.useState("")
  const { results: matchingTx, loading: searchingTx } = useTransactionSearch(query, transactionRevision)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const navItems = [
    { label: "Go to Dashboard", href: "/", icon: "layout-dashboard" },
    { label: "Go to Transactions", href: "/transactions", icon: "receipt-text" },
    { label: "Go to Budgets", href: "/budgets", icon: "target" },
    { label: "Go to Savings Goals", href: "/goals", icon: "trophy" },
    { label: "Go to Borrowed & Lent", href: "/borrowed", icon: "hand-coins" },
    { label: "Go to Insights", href: "/insights", icon: "sparkles" },
    { label: "Go to Categories", href: "/categories", icon: "shapes" },
    { label: "Go to Settings", href: "/settings", icon: "settings" },
  ]

  const actions = [
    {
      id: "add-tx",
      label: "Add New Transaction",
      icon: "plus",
      perform: () => {
        onOpenChange(false)
        onOpenAdd()
      },
    },
  ]

  const matchingNav = React.useMemo(() => {
    if (!query.trim()) return navItems
    const q = query.toLowerCase().trim()
    return navItems.filter((n) => n.label.toLowerCase().includes(q))
  }, [query])

  const matchingActions = React.useMemo(() => {
    if (!query.trim()) return actions
    const q = query.toLowerCase().trim()
    return actions.filter((a) => a.label.toLowerCase().includes(q))
  }, [query])

  const handleSelectNav = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg overflow-hidden ring-0 shadow-none rounded-xl">
        <div className="flex items-center px-3">
          <Icon name="search" className="size-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Type a command or search transactions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-sm h-12"
            autoFocus
          />
          <kbd className="hidden sm:inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
          {matchingActions.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </p>
              {matchingActions.map((act) => (
                <button
                  key={act.id}
                  onClick={act.perform}
                  className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-muted/70 transition-colors"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-[#D4E4FF] text-[#2B4C7E]">
                    <Icon name={act.icon} className="size-3.5" />
                  </span>
                  <span className="font-medium text-foreground">{act.label}</span>
                </button>
              ))}
            </div>
          )}

          {matchingNav.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Navigation
              </p>
              {matchingNav.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleSelectNav(item.href)}
                  className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-muted/70 transition-colors"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon name={item.icon} className="size-3.5" />
                  </span>
                  <span className="font-medium text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {query.trim() && searchingTx && (
            <div className="px-2 py-4 text-center text-muted-foreground">Searching transactions…</div>
          )}

          {query.trim() && !searchingTx && matchingTx.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Matching Transactions
              </p>
              {matchingTx.map((tx) => {
                const cat = getCategory(data, tx.categoryId)
                return (
                  <button
                    key={tx.id}
                    onClick={() => {
                      router.push("/transactions")
                      onOpenChange(false)
                    }}
                    className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs"
                        style={{
                          backgroundColor: `color-mix(in oklch, ${cat?.color ?? "var(--muted)"} 16%, transparent)`,
                          color: cat?.color,
                        }}
                      >
                        <Icon name={cat?.icon ?? "circle"} className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold">
                      {formatMoney(tx.amount, { symbol: data.settings.currencySymbol })}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {query.trim() &&
            !searchingTx &&
            matchingActions.length === 0 &&
            matchingNav.length === 0 &&
            matchingTx.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No matching commands or transactions found for &quot;{query}&quot;
            </div>
          )}
        </div>

        <div className="bg-[#F2EFE9]/70 px-3 py-2 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Tip: Press <kbd className="rounded bg-muted px-1 font-mono">⌘K</kbd> anywhere to open</span>
          <span className="font-medium">Gorib Manush Quick Search</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
