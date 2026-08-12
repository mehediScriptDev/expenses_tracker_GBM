export interface ApiResponse<T> {
  success: boolean
  status: number
  message: string
  data: T
  meta?: PaginatedMeta
}

export interface BackendUser {
  id: string
  google_id: string | null
  auth_provider: "CREDENTIAL" | "GOOGLE"
  name: string | null
  email: string
  monthly_salary: number | null
  salary_day: number
  currency_code: string
  currency_symbol: string
  carry_over_balance: number
  current_cycle_start: string | null
  created_at: string
  updated_at: string
}

export interface AuthPayload {
  user: BackendUser
  accessToken: string
  refreshToken: string
}

export interface PaginatedMeta {
  page: number
  limit: number
  total: number
  unread_count?: number
}

export interface BackendCategory {
  id: string
  user_id: string
  system_key: string | null
  name: string
  icon: string
  color: string
  kind: string
  is_custom: boolean
  created_at: string
  updated_at: string
}

export interface BackendTransaction {
  id: string
  user_id: string
  category_id: string
  type: string
  amount: number
  description: string
  payment_method: string
  mood: string | null
  tags: string[]
  occurred_at: string
  created_at: string
  updated_at: string
  date: string
  time: string
  category?: {
    id: string
    name: string
    icon: string
    color: string
    kind: string
  }
}

export interface BackendBudget {
  id: string
  user_id: string
  category_id: string
  monthly_limit: number
  spent: number
  remaining: number
  pct: number
  over: boolean
  category?: {
    id: string
    name: string
    icon: string
    color: string
    kind: string
  } | null
  created_at: string
  updated_at: string
}

export interface BackendLoan {
  id: string
  user_id: string
  direction: string
  person: string
  amount: number
  amount_repaid: number
  started_on: string
  due_on: string | null
  reason: string | null
  notes: string | null
  remaining: number
  pct: number
  status: string
  created_at: string
  updated_at: string
}

export interface BackendGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string | null
  icon: string
  color: string
  pct: number
  completed: boolean
  created_at: string
  updated_at: string
}

export interface BackendDashboard {
  carry_over: number
  cycle_income: number
  cycle_expenses: number
  available: number
  benchmark_salary: number
  benchmark_remaining: number
  safe_daily_limit: number
  today_spending: number
  week_spending: number
  month_spending: number
  borrowed_outstanding: number
  borrowed_repaid_pct: number
  borrowed_overdue_count: number
  next_due: { person: string; due_on: string } | null
  cycle: {
    start: string
    end: string
    days_remaining: number
    days_elapsed: number
    total_days: number
  }
  currency_code: string
  currency_symbol: string
  salary_day: number
}

export interface BackendTopCategory {
  category_id: string
  name: string
  icon: string
  color: string
  total: number
  count: number
}

export interface BackendMonthlySummary {
  year: number
  month: number
  total_income: number
  total_expenses: number
  net_saved: number
  transaction_count: number
  top_categories: BackendTopCategory[]
  is_archived: boolean
}

export interface BackendNotification {
  id: string
  type: "BUDGET_LIMIT_WARNING" | "BUDGET_LIMIT_EXCEEDED" | "GOAL_MILESTONE" | "DEBT_DUE_SOON"
  message: string
  href: string
  created_at: string
  read: boolean
}

export interface BackendQuickAdd {
  id: string
  user_id: string
  label: string
  icon: string
  amount: number
  category_id: string
  payment_method: string
  sort_order: number
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    icon: string
    color: string
    kind: string
  } | null
}
