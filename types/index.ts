export type TransactionType = "expense" | "income"

export type Mood = "happy" | "regret" | "necessary" | "luxury"

export type PaymentMethod =
  | "cash"
  | "bkash"
  | "nagad"
  | "card"
  | "bank"
  | "rocket"
  | "other"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  date: string
  time: string
  paymentMethod: PaymentMethod
  mood?: Mood
  recurring: boolean
  createdAt: number
}

export type CategoryKind = "expense" | "income"

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  kind: CategoryKind
  isCustom: boolean
}

export type LoanDirection = "borrowed" | "lent"

export interface Loan {
  id: string
  direction: LoanDirection
  person: string
  amount: number
  date: string
  dueDate?: string
  reason?: string
  amountRepaid: number
  notes?: string
  createdAt: number
}

export interface Settings {
  salary: number
  salaryDate: number
  currency: string
  currencySymbol: string
}

export interface QuickAddPreset {
  id: string
  label: string
  icon: string
  amount: number
  categoryId: string
  paymentMethod: PaymentMethod
}

export type Budgets = Record<string, number>

export interface BudgetIds {
  [categoryId: string]: string
}

export interface AppData {
  version: number
  settings: Settings
  categories: Category[]
  transactions: Transaction[]
  loans: Loan[]
  budgets: Budgets
  budgetIds: BudgetIds
  goals: Goal[]
  quickAddPresets: QuickAddPreset[]
}

export type InsightTone = "positive" | "warning" | "danger" | "neutral"

export interface Insight {
  id: string
  tone: InsightTone
  icon: string
  title: string
  detail?: string
  categoryId?: string
}

export type NotificationType =
  | "BUDGET_LIMIT_WARNING"
  | "BUDGET_LIMIT_EXCEEDED"
  | "GOAL_MILESTONE"
  | "DEBT_DUE_SOON"

export interface AppNotification {
  id: string
  type: NotificationType
  message: string
  href: string
  createdAt: number
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  icon: string
  color: string
  createdAt: number
}
