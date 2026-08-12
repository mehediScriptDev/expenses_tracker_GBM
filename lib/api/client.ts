import type { ApiResponse, AuthPayload, PaginatedMeta } from "./types"
import {
  ACCESS_TOKEN_KEY,
  AUTH_KEY,
  REFRESH_TOKEN_KEY,
} from "../constants"

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  token?: string | null
  skipAuthRetry?: boolean
}

let refreshInFlight: Promise<string | null> | null = null

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError("Unexpected server response.", response.status)
  }
}

function persistAuthPayload(payload: AuthPayload) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      id: payload.user.id,
      email: payload.user.email,
      name: payload.user.name?.trim() || payload.user.email.split("@")[0],
      authProvider: payload.user.auth_provider,
      currencyCode: payload.user.currency_code,
      currencySymbol: payload.user.currency_symbol,
      monthlySalary: payload.user.monthly_salary,
      salaryDay: payload.user.salary_day,
    }),
  )
  window.localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
}

async function refreshAccessTokenOnce(): Promise<string | null> {
  if (typeof window === "undefined") return null

  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) return null

    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    })

    const payload = await parseResponse<AuthPayload>(response)
    if (!payload?.success || !payload.data?.accessToken) return null

    persistAuthPayload(payload.data)
    return payload.data.accessToken
  })()
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ response: Response; payload: ApiResponse<T> }> {
  const { body, token, headers, skipAuthRetry, ...rest } = options

  const requestHeaders = new Headers(headers)
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json")
  }

  const authToken = token ?? getAccessToken()
  if (authToken) {
    requestHeaders.set("Authorization", `Bearer ${authToken}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const payload = await parseResponse<T>(response)

  if (
    response.status === 401 &&
    !skipAuthRetry &&
    !path.startsWith("/api/auth/") &&
    authToken
  ) {
    const nextToken = await refreshAccessTokenOnce()
    if (nextToken) {
      return request(path, { ...options, token: nextToken, skipAuthRetry: true })
    }
  }

  return { response, payload }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { payload } = await request<T>(path, options)

  if (!payload?.success) {
    throw new ApiError(payload?.message ?? "Request failed.", payload?.status ?? 500)
  }

  return payload.data
}

export async function apiFetchWithMeta<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: PaginatedMeta }> {
  const { payload } = await request<T>(path, options)

  if (!payload?.success) {
    throw new ApiError(payload?.message ?? "Request failed.", payload?.status ?? 500)
  }

  return { data: payload.data, meta: payload.meta }
}
