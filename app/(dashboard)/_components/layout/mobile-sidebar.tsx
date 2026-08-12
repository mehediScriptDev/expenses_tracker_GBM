"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Icon } from "@/lib/icon"
import { cn } from "@/lib/utils"
import { MAIN_NAV } from "@/config/navigation"
import { ModalBackdrop } from "@/components/ui/modal-overlay"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

function SidebarBrand({ onClose }: { onClose: () => void }) {
  return (
    <Link href="/" onClick={onClose} className="flex items-center">
      <Image
        src="/logo.png"
        alt="Logo"
        width={160}
        height={44}
        className="h-10 w-auto object-contain"
        style={{ width: "auto" }}
        priority
      />
    </Link>
  )
}

function SidebarNavItem({
  href,
  icon,
  label,
  active,
  onClose,
}: {
  href: string
  icon: string
  label: string
  active: boolean
  onClose: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all",
        "rounded-tl-lg rounded-tr-[12px] rounded-br-none rounded-bl-[14px]",
        active
          ? "bg-[#FFC700] text-neutral-900 font-extrabold"
          : "text-neutral-600 dark:text-muted-foreground hover:bg-white dark:hover:bg-muted hover:text-neutral-900 dark:hover:text-foreground",
      )}
    >
      <Icon name={icon} className="size-4.5 shrink-0" />
      {label}
    </Link>
  )
}

function SidebarFooter({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    onClose()
    void logout()
    router.push("/")
  }

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors rounded-tl-lg rounded-tr-[12px] rounded-br-none rounded-bl-[14px] cursor-pointer"
      >
        <Icon name="log-out" className="size-4.5 shrink-0" />
        Logout
      </button>
    </div>
  )
}



export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname()

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <ModalBackdrop
        onDismiss={onClose}
        className={cn(
          "z-40 transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col",
          "bg-[#FAF8F3] dark:bg-sidebar",
          "border-r border-neutral-200 dark:border-neutral-800",
          "shadow-2xl",
          "transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <SidebarBrand onClose={onClose} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-muted hover:text-neutral-900 dark:hover:text-foreground transition-colors cursor-pointer"
          >
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {MAIN_NAV.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={item.href === pathname}
              onClose={onClose}
            />
          ))}
        </nav>

        <div className="px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="mb-3 rounded-xl bg-white dark:bg-muted p-3 space-y-1">
            <p className="text-sm font-bold text-[#1A1A1A] dark:text-foreground">Spend with intention</p>
            <p className="text-sm leading-relaxed text-[#5C5955] dark:text-muted-foreground text-pretty">
              Every taka you track is a step toward financial calm.
            </p>
          </div>

          <SidebarFooter onClose={onClose} />
        </div>
      </aside>
    </>
  )
}
