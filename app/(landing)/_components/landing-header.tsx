"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { RiMenu2Line } from "react-icons/ri"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { LandingCta } from "./landing-cta"
import { LandingMobileMenu } from "./landing-mobile-menu"

export function LandingHeader() {
  const { isAuthenticated, hydrated } = useAuth()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="relative z-50 mx-auto container px-4 py-3 sm:px-6 lg:py-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex shrink min-w-0" onClick={closeMenu}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={240}
              height={64}
              className="h-14 w-auto object-contain object-left lg:h-16"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Button variant="outline" size="lg" asChild>
              <a href="#who-its-for">Who&apos;s for</a>
            </Button>
            <LandingCta intent="signup" size="lg" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMenuOpen(true)}
            className={cn("size-9 shrink-0 lg:hidden", menuOpen && "pointer-events-none opacity-0")}
          >
            <RiMenu2Line className="size-5" aria-hidden />
          </Button>
        </div>
      </header>

      <LandingMobileMenu
        open={menuOpen}
        onClose={closeMenu}
        isAuthenticated={isAuthenticated}
        hydrated={hydrated}
      />
    </>
  )
}
