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

export default function SignupPage() {
  const router = useRouter()
  const { signup, isAuthenticated, hydrated } = useAuth()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [hydrated, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setSubmitting(true)
    try {
      await signup(name, email, password)
      toast.success("Account created!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      progress={100}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-neutral-900 underline underline-offset-2">
            Log in
          </Link>
        </>
      }
    >
      <AuthTitle>Enter your details to create your account.</AuthTitle>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <AuthPasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full mt-2" size="lg" disabled={submitting}>
          {submitting ? "Creating account..." : "Continue"}
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
