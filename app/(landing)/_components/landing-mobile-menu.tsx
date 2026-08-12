"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { RiCloseLine } from "react-icons/ri"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface LandingMobileMenuProps {
  open: boolean
  onClose: () => void
  isAuthenticated: boolean
  hydrated: boolean
}

interface NavItem {
  href: string
  label: string
  index: string
}

function MobileNavLink({
  item,
  active,
  delay,
  onClose,
}: {
  item: NavItem
  active: boolean
  delay: number
  onClose: () => void
}) {
  const isAnchor = item.href.startsWith("#")

  const content = (
    <>
      <span className="w-7 shrink-0 font-mono text-[11px] font-medium tabular-nums tracking-widest text-neutral-400">
        {item.index}
      </span>
      <span className="font-serif text-[2.125rem] font-black leading-[1.05] tracking-tight text-neutral-900 underline decoration-[#FFC700] decoration-2 underline-offset-10 sm:text-[2.5rem]">
        {item.label}
      </span>
    </>
  )

  const className =
    "group flex w-full items-center gap-3 py-3 text-left outline-none transition-transform duration-300 active:scale-[0.99]"

  return (
    <li
      style={{ transitionDelay: active ? `${delay}ms` : "0ms" }}
      className={cn(
        "translate-y-8 opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        active && "translate-y-0 opacity-100",
      )}
    >
      {isAnchor ? (
        <a href={item.href} onClick={onClose} className={className}>
          {content}
        </a>
      ) : (
        <Link href={item.href} onClick={onClose} className={className}>
          {content}
        </Link>
      )}
    </li>
  )
}

export function LandingMobileMenu({ open, onClose, isAuthenticated, hydrated }: LandingMobileMenuProps) {
  const [mounted, setMounted] = React.useState(false)
  const [active, setActive] = React.useState(false)
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  React.useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true))
      })
      return () => cancelAnimationFrame(frame)
    }

    setActive(false)
    const timer = window.setTimeout(() => setMounted(false), 520)
    return () => window.clearTimeout(timer)
  }, [open])

  React.useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const navItems = React.useMemo<NavItem[]>(() => {
    const items: NavItem[] = [{ href: "#who-its-for", label: "Who's for", index: "01" }]

    if (hydrated) {
      items.push(
        isAuthenticated
          ? { href: "/dashboard", label: "Dashboard", index: "02" }
          : { href: "/login", label: "Log in", index: "02" },
      )
    }

    return items
  }, [hydrated, isAuthenticated])

  if (!mounted || !portalRoot) return null

  return createPortal(
    <div
      id="landing-mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className={cn(
        "fixed inset-0 z-100 flex flex-col overflow-hidden bg-[#FAF8F3] lg:hidden",
        "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        active ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div
        aria-hidden
        className={cn(
          "h-1 shrink-0 bg-neutral-200/80 transition-[width] duration-700 ease-out",
          active ? "w-full" : "w-0",
        )}
      >
        <div className="h-full w-full bg-[#FFC700]" />
      </div>

      <div className="relative flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" onClick={onClose} className="relative z-10 shrink-0">
          <Image
            src="/logo.png"
            alt="Gorib Manush"
            width={240}
            height={64}
            className="h-12 w-auto object-contain object-left"
            style={{ width: "auto" }}
          />
        </Link>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Close menu"
          onClick={onClose}
          className="relative z-10 size-10 shrink-0"
        >
          <RiCloseLine className="size-5" aria-hidden />
        </Button>
      </div>

      <div className="relative flex flex-1 flex-col px-4 pb-8 sm:px-6">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <MobileNavLink
              key={item.href}
              item={item}
              active={active}
              delay={140 + index * 80}
              onClose={onClose}
            />
          ))}
        </ul>
      </div>
    </div>,
    portalRoot,
  )
}
