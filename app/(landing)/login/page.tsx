"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  AuthDivider,
  AuthField,
  AuthPasswordField,
  AuthShell,
  AuthTerms,
  AuthTitle,
} from "@/landing/auth/auth-shell"
import { GoogleSignInButton } from "@/landing/auth/google-sign-in-button"
import { isGoogleAuthConfigured } from "@/components/providers/google-auth-provider"

type AuthMode = "login" | "forgot_email" | "forgot_code" | "forgot_reset" | "forgot_success"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, hydrated } = useAuth()

  const [mode, setMode] = React.useState<AuthMode>("login")


  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const [resetEmail, setResetEmail] = React.useState("")
  const [resetCode, setResetCode] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("")

  React.useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [hydrated, isAuthenticated, router])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartForgotPassword = () => {
    setResetEmail(email)
    setMode("forgot_email")
  }

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      toast.error("Please enter your email address.")
      return
    }
    toast.success(`Verification code sent to ${resetEmail}!`)
    setMode("forgot_code")
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetCode.trim() || resetCode.trim().length < 4) {
      toast.error("Please enter a valid verification code.")
      return
    }
    toast.success("Code verified successfully!")
    setMode("forgot_reset")
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword) {
      toast.error("Please enter a new password.")
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.")
      return
    }
    toast.success("Your password has been updated!")
    setMode("forgot_success")
  }

  const handleReturnToLogin = () => {
    setPassword("")
    setResetCode("")
    setNewPassword("")
    setConfirmNewPassword("")
    setMode("login")
  }



  if (mode === "forgot_email") {
    return (
      <AuthShell progress={25} onBack={() => setMode("login")}>
        <AuthTitle>Reset your password.</AuthTitle>
        <p className="text-center text-sm text-neutral-700 font-medium mb-6 -mt-3 leading-relaxed">
          Enter your email address and we&apos;ll send you a 6-digit verification code.
        </p>

        <form onSubmit={handleSendEmail} className="space-y-4">
          <AuthField
            label="Email Address"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button type="submit" className="w-full mt-2" size="lg">
            Send Code
          </Button>
        </form>
      </AuthShell>
    )
  }

  if (mode === "forgot_code") {
    return (
      <AuthShell progress={60} onBack={() => setMode("forgot_email")}>
        <AuthTitle>Enter verification code.</AuthTitle>
        <p className="text-center text-sm text-neutral-700 font-medium mb-6 -mt-3 leading-relaxed">
          We sent a 6-digit verification code to <span className="font-bold text-neutral-900">{resetEmail}</span>.
        </p>

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <AuthField
            label="Verification Code"
            placeholder="Enter 6-digit code (e.g. 123456)"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            maxLength={6}
            required
            autoComplete="one-time-code"
          />

          <Button type="submit" className="w-full mt-2" size="lg">
            Verify Code
          </Button>
        </form>
      </AuthShell>
    )
  }

  if (mode === "forgot_reset") {
    return (
      <AuthShell progress={90} onBack={() => setMode("forgot_code")}>
        <AuthTitle>Create new password.</AuthTitle>
        <p className="text-center text-sm text-neutral-700 font-medium mb-6 -mt-3 leading-relaxed">
          Enter a new password for your account below.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <AuthPasswordField
            label="New Password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <AuthPasswordField
            label="Confirm New Password"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full mt-2" size="lg">
            Reset Password
          </Button>
        </form>
      </AuthShell>
    )
  }

  if (mode === "forgot_success") {
    return (
      <AuthShell progress={100}>
        <AuthTitle>Password updated!</AuthTitle>
        <p className="text-center text-sm text-neutral-700 font-medium mb-6 leading-relaxed">
          Your password has been reset successfully. You can now log in with your new credentials.
        </p>

        <Button type="button" onClick={handleReturnToLogin} className="w-full mt-2" size="lg">
          Back to Login
        </Button>
      </AuthShell>
    )
  }


  return (
    <AuthShell
      progress={50}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-neutral-900 underline underline-offset-2">
            Sign up
          </Link>
        </>
      }
    >
      <AuthTitle>Welcome back. Log in to your account.</AuthTitle>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <AuthField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AuthPasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          forgotPassword={
            <button
              type="button"
              onClick={handleStartForgotPassword}
              className="text-xs text-neutral-600 hover:text-neutral-900 underline underline-offset-2 font-normal transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          }
        />

        <Button type="submit" className="w-full mt-2" size="lg" disabled={submitting}>
          {submitting ? "Signing in..." : "Continue"}
        </Button>
      </form>

      {isGoogleAuthConfigured() ? (
        <div className="mt-6 space-y-4">
          <AuthDivider />
          <GoogleSignInButton />
          <AuthTerms />
        </div>
      ) : (
        <div className="mt-6">
          <AuthTerms />
        </div>
      )}
    </AuthShell>
  )
}
