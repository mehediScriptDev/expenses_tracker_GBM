import type {
  Category,
  PaymentMethod,
  Transaction,
  TransactionType,
  Mood,
  CategoryKind,
  Loan,
  LoanDirection,
  Goal,
  Budgets,
  BudgetIds,
  QuickAddPreset,
} from "@/types"
import type {
  BackendCategory,
  BackendTransaction,
  BackendBudget,
  BackendLoan,
  BackendGoal,
  BackendQuickAdd,
} from "./types"

function parseOccurredAt(raw: BackendTransaction) {
  const occurred = new Date(raw.occurred_at)
  if (!Number.isNaN(occurred.getTime())) {
    return {
      date: `${occurred.getUTCFullYear()}-${String(occurred.getUTCMonth() + 1).padStart(2, "0")}-${String(occurred.getUTCDate()).padStart(2, "0")}`,
      time: `${String(occurred.getUTCHours()).padStart(2, "0")}:${String(occurred.getUTCMinutes()).padStart(2, "0")}`,
      createdAt: occurred.getTime(),
    }
  }

  const fallbackDate = raw.date?.slice(0, 10) ?? ""
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(fallbackDate)

  return {
    date: validDate ? fallbackDate : new Date().toISOString().slice(0, 10),
    time: raw.time?.slice(0, 5) ?? "00:00",
    createdAt: Date.now(),
  }
}

export function mapCategory(raw: BackendCategory): Category {
  return {
    id: raw.id,
    name: raw.name,
    icon: raw.icon,
    color: raw.color,
    kind: raw.kind.toLowerCase() as CategoryKind,
    isCustom: raw.is_custom,
  }
}

export function mapTransaction(raw: BackendTransaction): Transaction {
  const when = parseOccurredAt(raw)

  return {
    id: raw.id,
    type: raw.type as TransactionType,
    amount: raw.amount,
    categoryId: raw.category_id,
    description: raw.description,
    date: when.date,
    time: when.time,
    paymentMethod: raw.payment_method as PaymentMethod,
    mood: raw.mood ? (raw.mood as Mood) : undefined,
    recurring: false,
    createdAt: when.createdAt,
  }
}

export function toCreateTransactionBody(tx: Omit<Transaction, "id" | "createdAt">) {
  return {
    type: tx.type,
    amount: tx.amount,
    category_id: tx.categoryId,
    description: tx.description,
    date: tx.date,
    time: tx.time,
    payment_method: tx.paymentMethod,
    ...(tx.type === "expense" && tx.mood ? { mood: tx.mood } : {}),
  }
}

export function toUpdateTransactionBody(patch: Partial<Transaction>) {
  const body: Record<string, unknown> = {}

  if (patch.type !== undefined) body.type = patch.type
  if (patch.amount !== undefined) body.amount = patch.amount
  if (patch.categoryId !== undefined) body.category_id = patch.categoryId
  if (patch.description !== undefined) body.description = patch.description
  if (patch.date !== undefined) body.date = patch.date
  if (patch.time !== undefined) body.time = patch.time
  if (patch.paymentMethod !== undefined) body.payment_method = patch.paymentMethod
  if (patch.mood !== undefined) body.mood = patch.mood ?? null

  return body
}

export function toCategoryBody(cat: Pick<Category, "name" | "kind" | "icon" | "color">) {
  return {
    name: cat.name,
    kind: cat.kind,
    icon: cat.icon,
    color: cat.color,
  }
}

export function mapBudgetRecords(budgets: BackendBudget[]): { budgets: Budgets; budgetIds: BudgetIds } {
  const budgetMap: Budgets = {}
  const budgetIds: BudgetIds = {}

  for (const budget of budgets) {
    budgetMap[budget.category_id] = budget.monthly_limit
    budgetIds[budget.category_id] = budget.id
  }

  return { budgets: budgetMap, budgetIds }
}

export function mapLoan(raw: BackendLoan): Loan {
  return {
    id: raw.id,
    direction: raw.direction as LoanDirection,
    person: raw.person,
    amount: raw.amount,
    date: raw.started_on,
    dueDate: raw.due_on ?? undefined,
    reason: raw.reason ?? undefined,
    amountRepaid: raw.amount_repaid,
    notes: raw.notes ?? undefined,
    createdAt: new Date(raw.created_at).getTime(),
  }
}

export function toCreateLoanBody(loan: Omit<Loan, "id" | "createdAt">) {
  return {
    direction: loan.direction,
    person: loan.person,
    amount: loan.amount,
    amount_repaid: loan.amountRepaid,
    started_on: loan.date,
    due_on: loan.dueDate,
    reason: loan.reason,
    notes: loan.notes,
  }
}

export function toUpdateLoanBody(patch: Partial<Loan>) {
  const body: Record<string, unknown> = {}

  if (patch.direction !== undefined) body.direction = patch.direction
  if (patch.person !== undefined) body.person = patch.person
  if (patch.amount !== undefined) body.amount = patch.amount
  if (patch.amountRepaid !== undefined) body.amount_repaid = patch.amountRepaid
  if (patch.date !== undefined) body.started_on = patch.date
  if (patch.dueDate !== undefined) body.due_on = patch.dueDate ?? null
  if (patch.reason !== undefined) body.reason = patch.reason ?? null
  if (patch.notes !== undefined) body.notes = patch.notes ?? null

  return body
}

export function mapGoal(raw: BackendGoal): Goal {
  return {
    id: raw.id,
    title: raw.title,
    targetAmount: raw.target_amount,
    currentAmount: raw.current_amount,
    targetDate: raw.target_date ?? undefined,
    icon: raw.icon,
    color: raw.color,
    createdAt: new Date(raw.created_at).getTime(),
  }
}

export function mapQuickAddPreset(raw: BackendQuickAdd): QuickAddPreset {
  return {
    id: raw.id,
    label: raw.label,
    icon: raw.icon,
    amount: raw.amount,
    categoryId: raw.category_id,
    paymentMethod: raw.payment_method as PaymentMethod,
  }
}

export function toCreateQuickAddBody(preset: Omit<QuickAddPreset, "id">) {
  return {
    label: preset.label,
    icon: preset.icon,
    amount: preset.amount,
    category_id: preset.categoryId,
    payment_method: preset.paymentMethod,
  }
}

export function toUpdateQuickAddBody(patch: Partial<QuickAddPreset>) {
  const body: Record<string, unknown> = {}

  if (patch.label !== undefined) body.label = patch.label
  if (patch.icon !== undefined) body.icon = patch.icon
  if (patch.amount !== undefined) body.amount = patch.amount
  if (patch.categoryId !== undefined) body.category_id = patch.categoryId
  if (patch.paymentMethod !== undefined) body.payment_method = patch.paymentMethod

  return body
}

export function toCreateGoalBody(goal: Omit<Goal, "id" | "createdAt">) {
  return {
    title: goal.title,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    target_date: goal.targetDate,
    icon: goal.icon,
    color: goal.color,
  }
}

export function toUpdateGoalBody(patch: Partial<Goal>) {
  const body: Record<string, unknown> = {}

  if (patch.title !== undefined) body.title = patch.title
  if (patch.targetAmount !== undefined) body.target_amount = patch.targetAmount
  if (patch.currentAmount !== undefined) body.current_amount = patch.currentAmount
  if (patch.targetDate !== undefined) body.target_date = patch.targetDate ?? null
  if (patch.icon !== undefined) body.icon = patch.icon
  if (patch.color !== undefined) body.color = patch.color

  return body
}
