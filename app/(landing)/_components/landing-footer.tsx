"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { LEGAL_TERMS, PRIVACY_POLICY, type LegalDocument } from "../_data/legal"
import { LandingNavLink } from "./landing-cta"
import { LegalDialog } from "./legal-dialog"

export function LandingFooter() {
  const [activeDocument, setActiveDocument] = React.useState<LegalDocument | null>(null)

  return (
    <>
      <footer className="section-padding w-full container border-t border-neutral-200/60 text-left space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-3.5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Gorib Manush Logo"
                width={240}
                height={64}
                className="h-14 w-auto object-contain object-left lg:h-16"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="text-xs sm:text-sm text-neutral-700 max-w-sm leading-relaxed font-medium">
              Gorib Manush helps you take complete control of your finances with daily spending limits,
              budget tracking, and savings goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-600 font-medium">
            <button
              type="button"
              onClick={() => setActiveDocument(PRIVACY_POLICY)}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveDocument(LEGAL_TERMS)}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Legal Terms
            </button>
            <LandingNavLink />
          </div>
        </div>

        <div className="border-t border-neutral-200/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-neutral-500">
          <p>© 2026 Gorib Manush. All rights reserved.</p>
          <p>
            Developed by{" "}
            <a
              href="https://mehediscriptdev.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-neutral-800 hover:text-black underline underline-offset-2 transition-colors"
            >
              Mehedi
            </a>
          </p>
        </div>
      </footer>

      <LegalDialog document={activeDocument} onClose={() => setActiveDocument(null)} />
    </>
  )
}
