"use client"

import * as React from "react"
import { ACCESS_TOKEN_KEY, AUTH_KEY, REFRESH_TOKEN_KEY } from "./constants"
import * as authApi from "./api/auth"
import type { BackendUser } from "./api/types"
import { ApiError } from "./api/client"

export interface AuthUser {
  id: string
  email: string
  name: string
  authProvider?: BackendUser["auth_provider"]
  currencyCode?: string
  currencySymbol?: string
  monthlySalary?: number | null
  salaryDay?: number
}

interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  hydrated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => Promise<void>
  applyProfile: (profile: BackendUser) => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function mapUser(user: BackendUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name?.trim() || user.email.split("@")[0],
    authProvider: user.auth_provider,
    currencyCode: user.currency_code,
    currencySymbol: user.currency_symbol,
    monthlySalary: user.monthly_salary,
    salaryDay: user.salary_day,
  }
}

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  try {
    const rawUser = window.localStorage.getItem(AUTH_KEY)
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!rawUser || !accessToken || !refreshToken) return null

    const user = JSON.parse(rawUser) as AuthUser
    if (!user?.id || !user?.email) return null

    return { user, accessToken, refreshToken }
  } catch {
    return null
  }
}

function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") return

  if (!session) {
    window.localStorage.removeItem(AUTH_KEY)
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    return
  }

  window.localStorage.setItem(AUTH_KEY, JSON.stringify(session.user))
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
}

function applyAuthPayload(payload: { user: BackendUser; accessToken: string; refreshToken: string }): AuthSession {
  return {
    user: mapUser(payload.user),
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    async function hydrateSession() {
      const stored = readStoredSession()
      if (!stored) {
        if (!cancelled) setHydrated(true)
        return
      }

      try {
        const profile = await authApi.getProfile(stored.accessToken)
        if (cancelled) return

        const session = {
          user: mapUser(profile),
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
        }
        persistSession(session)
        setUser(session.user)
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          persistSession(null)
          if (!cancelled) setHydrated(true)
          return
        }

        try {
          const refreshed = await authApi.refreshAccessToken(stored.refreshToken)
          if (cancelled) return

          const session = applyAuthPayload(refreshed)
          persistSession(session)
          setUser(session.user)
        } catch {
          persistSession(null)
        }
      } finally {
        if (!cancelled) setHydrated(true)
      }
    }

    void hydrateSession()

    return () => {
      cancelled = true
    }
  }, [])

  const setSession = React.useCallback((session: AuthSession) => {
    persistSession(session)
    setUser(session.user)
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password.trim()) {
      throw new Error("Email and password are required.")
    }

    const payload = await authApi.loginUser(trimmedEmail, password)
    setSession(applyAuthPayload(payload))
  }, [setSession])

  const signup = React.useCallback(async (name: string, email: string, password: string) => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedName || !trimmedEmail || !password.trim()) {
      throw new Error("Name, email, and password are required.")
    }

    const payload = await authApi.registerUser(trimmedName, trimmedEmail, password)
    setSession(applyAuthPayload(payload))
  }, [setSession])

  const loginWithGoogle = React.useCallback(async (idToken: string) => {
    if (!idToken.trim()) {
      throw new Error("Google sign-in failed. Please try again.")
    }

    const payload = await authApi.googleLogin(idToken)
    setSession(applyAuthPayload(payload))
  }, [setSession])

  const applyProfile = React.useCallback((profile: BackendUser) => {
    const stored = readStoredSession()
    if (!stored) return

    const session = {
      ...stored,
      user: mapUser(profile),
    }
    persistSession(session)
    setUser(session.user)
  }, [])

  const logout = React.useCallback(async () => {
    try {
      await authApi.logoutUser()
    } catch {
      // Clear local session even if the API call fails.
    } finally {
      persistSession(null)
      setUser(null)
    }
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      hydrated,
      login,
      signup,
      loginWithGoogle,
      logout,
      applyProfile,
    }),
    [user, hydrated, login, signup, loginWithGoogle, logout, applyProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
