export function formatMoney(
  amount: number,
  opts: { symbol?: string; compact?: boolean; sign?: boolean } = {},
) {
  const { symbol = "৳", compact = false, sign = false } = opts
  const abs = Math.abs(amount)
  const num = compact
    ? new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(abs)
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(abs)
  const prefix = amount < 0 ? "-" : sign ? "+" : ""
  return `${prefix}${symbol}${num}`
}

export function todayISO() {
  return toISODate(new Date())
}

export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`
}

export function parseISO(date: string) {
  if (!date) return new Date(NaN)

  const normalized = date.includes("T") ? date.slice(0, 10) : date.slice(0, 10)
  const [y, m, d] = normalized.split("-").map(Number)
  if (!y || !m || !d) return new Date(NaN)

  return new Date(y, m - 1, d)
}

export function formatDate(date: string, style: "short" | "long" | "medium" = "medium") {
  const d = parseISO(date)
  if (style === "short")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  if (style === "long")
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}:${String(m).padStart(2, "0")} ${period}`
}

export function relativeDay(date: string) {
  const target = parseISO(date)
  if (Number.isNaN(target.getTime())) return "Unknown date"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diff === 0) return "Today"
  if (diff === -1) return "Yesterday"
  if (diff === 1) return "Tomorrow"
  if (diff < -365) return formatDate(date.slice(0, 10), "short")
  if (diff < 0) return `${Math.abs(diff)} days ago`
  return `in ${diff} days`
}

export function daysBetween(a: Date, b: Date) {
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}
