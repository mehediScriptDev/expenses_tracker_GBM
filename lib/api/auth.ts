import { apiFetch } from "./client"
import type { AuthPayload, BackendUser } from "./types"

export function registerUser(name: string, email: string, password: string) {
  return apiFetch<AuthPayload>("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  })
}

export function loginUser(email: string, password: string) {
  return apiFetch<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  })
}

export function googleLogin(idToken: string) {
  return apiFetch<AuthPayload>("/api/auth/google", {
    method: "POST",
    body: { idToken },
  })
}

export function refreshAccessToken(refreshToken: string) {
  return apiFetch<AuthPayload>("/api/auth/refresh-token", {
    method: "POST",
    body: { refreshToken },
  })
}

export function logoutUser() {
  return apiFetch<null>("/api/auth/logout", { method: "POST" })
}

export function getProfile(token: string) {
  return apiFetch<BackendUser>("/api/users/profile", {
    method: "GET",
    token,
  })
}
