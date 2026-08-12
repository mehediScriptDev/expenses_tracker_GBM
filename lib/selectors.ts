import { parseISO } from "./format"
import type { AppData, Category, Loan, Transaction } from "@/types"

export function categoryMap(data: AppData): Record<string, Category> {
  return Object.fromEntries(data.categories.map((c) => [c.id, c]))
}

export function getCategory(data: AppData, id: string): Category | undefined {
  return data.categories.find((c) => c.id === id)
}

export interface DateRange {
  start: Date
  end: Date
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function todayRange(now = new Date()): DateRange {
  const start = startOfDay(now)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

export function weekRange(now = new Date()): DateRange {
  const day = now.getDay()
  const mondayOffset = (day + 6) % 7
  const start = startOfDay(now)
  start.setDate(start.getDate() - mondayOffset)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { start, end }
}

export function monthRange(now = new Date()): DateRange {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start, end }
}

export function quarterRange(now = new Date()): DateRange {
  const q = Math.floor(now.getMonth() / 3)
  const start = new Date(now.getFullYear(), q * 3, 1)
  const end = new Date(now.getFullYear(), q * 3 + 3, 1)
  return { start, end }
}

export function yearRange(now = new Date()): DateRange {
  return {
    start: new Date(now.getFullYear(), 0, 1),
    end: new Date(now.getFullYear() + 1, 0, 1),
  }
}

export function payCycle(salaryDate: number, now = new Date()) {
  const day = Math.min(Math.max(salaryDate, 1), 28)
  let start: Date
  if (now.getDate() >= day) {
    start = new Date(now.getFullYear(), now.getMonth(), day)
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 1, day)
  }
  const end = new Date(start.getFullYear(), start.getMonth() + 1, day)
  const today = startOfDay(now)
  const daysRemaining = Math.max(
    0,
    Math.round((end.getTime() - today.getTime()) / 86400000),
  )
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000)
  const daysElapsed = totalDays - daysRemaining
  return { start, end, daysRemaining, daysElapsed, totalDays }
}

export function inRange(t: Transaction, range: DateRange) {
  const d = parseISO(t.date)
  return d >= range.start && d < range.end
}

export function txInRange(txs: Transaction[], range: DateRange) {
  return txs.filter((t) => inRange(t, range))
}

export function sumExpenses(txs: Transaction[]) {
  return txs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)
}

export function sumIncome(txs: Transaction[]) {
  return txs
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)
}

export type LoanStatus = "paid" | "partial" | "unpaid" | "overdue"

export function loanRemaining(loan: Loan) {
  return Math.max(0, loan.amount - loan.amountRepaid)
}

export function loanStatus(loan: Loan, now = new Date()): LoanStatus {
  const remaining = loanRemaining(loan)
  if (remaining <= 0) return "paid"
  if (loan.dueDate) {
    const due = parseISO(loan.dueDate)
    if (due < startOfDay(now)) return "overdue"
  }
  return loan.amountRepaid > 0 ? "partial" : "unpaid"
}

export function loanTotals(loans: Loan[], now = new Date()) {
  const borrowed = loans.filter((l) => l.direction === "borrowed")
  const lent = loans.filter((l) => l.direction === "lent")
  const borrowedOutstanding = borrowed.reduce((s, l) => s + loanRemaining(l), 0)
  const borrowedTotal = borrowed.reduce((s, l) => s + l.amount, 0)
  const borrowedRepaid = borrowed.reduce((s, l) => s + Math.min(l.amountRepaid, l.amount), 0)
  const lentOutstanding = lent.reduce((s, l) => s + loanRemaining(l), 0)
  const overdue = borrowed.filter((l) => loanStatus(l, now) === "overdue")
  const upcoming = borrowed
    .filter((l) => loanStatus(l, now) !== "paid" && loanStatus(l, now) !== "overdue" && l.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
  return {
    borrowed,
    lent,
    borrowedOutstanding,
    borrowedTotal,
    borrowedRepaid,
    lentOutstanding,
    overdue,
    upcoming,
    repaymentPct: borrowedTotal > 0 ? (borrowedRepaid / borrowedTotal) * 100 : 100,
  }
}

