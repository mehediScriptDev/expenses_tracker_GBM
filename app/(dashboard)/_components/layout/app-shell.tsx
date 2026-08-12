"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { usePathname } from "next/navigation"
import { Icon } from "@/lib/icon"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { TransactionDialog } from "@/dashboard/transactions/transaction-dialog"
import { CommandPalette } from "@/dashboard/layout/command-palette"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/types"
import { MAIN_NAV, MOBILE_NAV } from "@/config/navigation"
import { MobileSidebar } from "@/dashboard/layout/mobile-sidebar"
import { NotificationBell } from "@/dashboard/layout/notification-bell"
import { DashboardScrollReset } from "@/dashboard/layout/dashboard-scroll-reset"
import { DashboardProvider } from "@/lib/hooks/dashboard-context"
import { headerActionClass } from "@/dashboard/layout/header-action-button"
import { BrandSpinner } from "@/app/loading"

interface UIContextValue {
  openAdd: () => void
  openEdit: (tx: Transaction) => void
}

const UIContext = React.createContext<UIContextValue | null>(null)

export function useUI() {
  const ctx = React.useContext(UIContext)
  if (!ctx) throw new Error("useUI must be used within AppShell")
  return ctx
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="Logo"
        width={180}
        height={48}
        className="h-11 w-auto object-contain"
        style={{ width: "auto" }}
        priority
      />
    </Link>
  )
}

function UserMenu() {
  const router = useRouter()
  const { logout } = useAuth()
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="User Menu"
        aria-expanded={open}
        className={cn(headerActionClass(open), "font-mono font-bold text-xs")}
      >
        <span>AA</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-card border border-neutral-200 dark:border-neutral-800 p-1.5 shadow-lg z-50 text-sm font-semibold text-neutral-800 dark:text-neutral-200 text-left animate-in fade-in zoom-in-95 duration-100"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="space-y-0.5">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Account Settings
            </Link>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Home Page
            </Link>

            <div className="border-t border-neutral-200 dark:border-neutral-800 my-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  void logout()
                  router.push("/")
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm sm:text-base font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { hydrated } = useStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Transaction | null>(null)

  const ui = React.useMemo<UIContextValue>(
    () => ({
      openAdd: () => {
        setEditing(null)
        setDialogOpen(true)
      },
      openEdit: (tx: Transaction) => {
        setEditing(tx)
        setDialogOpen(true)
      },
    }),
    [],
  )

  const activeLabel = MAIN_NAV.find((n) => n.href === pathname)?.label ?? "Dashboard"

  return (
    <UIContext.Provider value={ui}>
      <DashboardScrollReset />
      <div className="min-h-svh bg-background">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-[#FAF8F3] dark:bg-sidebar px-3 py-5 lg:flex">
          <div className="px-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <Brand />
          </div>

          <nav className="mt-4 flex flex-1 flex-col gap-1">
            {MAIN_NAV.map((item) => {
              const active = item.href === pathname
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all rounded-tl-lg rounded-tr-[12px] rounded-br-none rounded-bl-[14px]",
                    active
                      ? "bg-[#FFC700] text-neutral-900 font-extrabold"
                      : "text-neutral-600 dark:text-muted-foreground hover:bg-white dark:hover:bg-muted hover:text-neutral-900 dark:hover:text-foreground",
                  )}
                >
                  <Icon name={item.icon} className="size-4.5 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto rounded-xl bg-white dark:bg-muted p-3 space-y-1">
            <p className="text-sm font-bold text-[#1A1A1A] dark:text-foreground">Spend with intention</p>
            <p className="text-sm leading-relaxed text-[#5C5955] dark:text-muted-foreground text-pretty">
              Every taka you track is a step toward financial calm.
            </p>
          </div>
        </aside>

        <div className="lg:pl-60">
          <header className="z-20 flex min-h-14 items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 bg-[#FAF8F3] dark:bg-background px-4 pt-[env(safe-area-inset-top,0px)] sm:px-6 lg:sticky lg:top-0 lg:pt-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-muted-foreground hover:bg-neutral-100 dark:hover:bg-muted transition-colors cursor-pointer lg:hidden"
              >
                <Icon name="menu" className="size-5" />
              </button>

              <span className="lg:hidden">
                <Brand />
              </span>

              <h1 className="hidden text-lg font-bold text-[#1A1A1A] dark:text-foreground lg:block">
                {activeLabel}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <span className="hidden h-5 w-px bg-neutral-200 dark:bg-neutral-700 sm:block" aria-hidden />
              <UserMenu />
            </div>
          </header>

          <main className="w-full px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pb-10">
            {hydrated ? <DashboardProvider>{children}</DashboardProvider> : <LoadingScreen />}
          </main>
        </div>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 lg:hidden"
          style={{ background: "var(--color-background, #FAF8F3)" }}
        >
          <div className="border-t border-neutral-200 dark:border-neutral-800" />

          <div
            className="flex items-center justify-around px-1 pt-2 pb-2"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0.5rem))" }}
          >
            {MOBILE_NAV.map((item) => {
              if (item.fab) {
                return (
                  <div key={item.href} className="flex flex-1 items-center justify-center">
                    <button
                      type="button"
                      onClick={ui.openAdd}
                      aria-label="Add transaction"
                      className={cn(
                        "flex h-14 w-14 -mt-7 items-center justify-center rounded-full",
                        "bg-[#FFC700] text-neutral-900 shadow-lg shadow-amber-300/40 dark:shadow-amber-900/40",
                        "ring-4 ring-[#FAF8F3] dark:ring-background",
                        "transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer",
                      )}
                    >
                      <Icon name="plus" className="size-6 stroke-[2.5]" />
                    </button>
                  </div>
                )
              }

              const active = item.href === pathname
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-1 items-center justify-center px-2 py-3 transition-colors",
                    "rounded-tl-lg rounded-tr-[12px] rounded-br-none rounded-bl-[14px]",
                    active
                      ? "bg-[#FFC700] text-neutral-900"
                      : "text-[#5C5955] dark:text-muted-foreground",
                  )}
                >
                  <Icon name={item.icon} className="size-5" />
                </Link>
              )
            })}
          </div>
        </nav>

        <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} onOpenAdd={ui.openAdd} />
      </div>
    </UIContext.Provider>
  )
}

function LoadingScreen() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <BrandSpinner />
    </div>
  )
}
