"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Icon } from "@/lib/icon"
import { LEGAL_TERMS, PRIVACY_POLICY } from "../../_data/legal"
import { LegalDialog } from "../legal-dialog"

interface AuthShellProps {
  progress?: number
  children: React.ReactNode
  footer?: React.ReactNode
  onBack?: () => void
}

export function AuthShell({ progress = 50, children, footer, onBack }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center px-4 py-8 sm:py-10">
      <Link href="/" className="mb-8 lg:mb-10">
        <Image
          src="/logo.png"
          alt="Gorib Manush"
          width={200}
          height={56}
          className="h-12 sm:h-14 w-auto object-contain mx-auto"
          style={{ width: "auto" }}
          priority
        />
      </Link>

      <div className="w-full max-w-md flex items-center gap-3 mb-8 px-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <Icon name="arrow-left" className="size-5" />
          </button>
        ) : (
          <Link
            href="/"
            aria-label="Go back"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-200/60 transition-colors"
          >
            <Icon name="arrow-left" className="size-5" />
          </Link>
        )}
        <div className="h-1.5 flex-1 rounded-full bg-neutral-200 overflow-hidden">
          <div
            className="h-full bg-[#FFC700] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-md rounded-lg border border-neutral-200/80 bg-white overflow-hidden">
        <div className="px-6 py-8 sm:px-8 sm:py-10">{children}</div>
        {footer ? (
          <div className="border-t border-neutral-200 bg-[#FAFAF8] px-6 py-4 text-center text-sm text-neutral-700">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function AuthTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-xl sm:text-2xl font-black text-neutral-900 text-center leading-snug tracking-tight mb-6">
      {children}
    </h1>
  )
}

export function AuthField({
  label,
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  return (
    <label className="block space-y-2">
      <span className="sr-only">{label}</span>
      <input
        {...props}
        placeholder={props.placeholder ?? label}
        className="w-full rounded-md border border-neutral-200 bg-[#F3F3F3] px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:outline-none focus:ring-0 focus:border-[#FFC700] transition-colors"
      />
    </label>
  )
}

export function AuthPasswordField({
  label,
  forgotPassword,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  label: string
  forgotPassword?: React.ReactNode
}) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="space-y-1.5">
      <label className="block space-y-2">
        <span className="sr-only">{label}</span>
        <div className="relative">
          <input
            {...props}
            type={visible ? "text" : "password"}
            placeholder={props.placeholder ?? label}
            className="w-full rounded-md border border-neutral-200 bg-[#F3F3F3] px-4 py-3.5 pr-11 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none focus:outline-none focus:ring-0 focus:border-[#FFC700] transition-colors"
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <Icon name={visible ? "eye-off" : "eye"} className="size-4.5" />
          </button>
        </div>
      </label>
      {forgotPassword && <div className="flex justify-end">{forgotPassword}</div>}
    </div>
  )
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="text-xs font-medium text-neutral-500">or</span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  )
}

export function GoogleAuthButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 cursor-pointer"
    >
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </button>
  )
}

export function AuthTerms() {
  const [activeDocument, setActiveDocument] = React.useState<any>(null)

  return (
    <>
      <p className="text-center text-[11px] leading-relaxed text-neutral-500 pt-1">
        By continuing, you agree to our{" "}
        <button
          type="button"
          onClick={() => setActiveDocument(LEGAL_TERMS)}
          className="underline underline-offset-2 hover:text-neutral-800 cursor-pointer font-semibold"
        >
          Terms of Use
        </button>{" "}
        and{" "}
        <button
          type="button"
          onClick={() => setActiveDocument(PRIVACY_POLICY)}
          className="underline underline-offset-2 hover:text-neutral-800 cursor-pointer font-semibold"
        >
          Privacy Policy
        </button>
        .
      </p>

      <LegalDialog document={activeDocument} onClose={() => setActiveDocument(null)} />
    </>
  )
}
