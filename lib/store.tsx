"use client"

import * as React from "react"
import { toast } from "sonner"
import { createEmptyAppData } from "./defaults"
import { clearNotificationReadState } from "./notifications"
import { useAuth } from "./auth"
import * as categoriesApi from "./api/categories"
import * as transactionsApi from "./api/transactions"
import * as budgetsApi from "./api/budgets"
import * as loansApi from "./api/loans"
import * as goalsApi from "./api/goals"
import * as quickAddsApi from "./api/quick-adds"
import * as notificationsApi from "./api/notifications"
import {
  mapCategory,
  mapTransaction,
  mapBudgetRecords,
  mapLoan,
  mapGoal,
  mapQuickAddPreset,
  toCategoryBody,
  toCreateQuickAddBody,
  toUpdateQuickAddBody,
} from "./api/mappers"
import { ApiError } from "./api/client"
import type {
  AppData,
  Budgets,
  Category,
  Goal,
  Loan,
  QuickAddPreset,
  Settings,
  Transaction,
} from "@/types"

interface StoreValue {
  data: AppData
  hydrated: boolean
  syncing: boolean
  transactionRevision: number
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => Promise<Transaction>
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  duplicateTransaction: (id: string) => Promise<Transaction>
  refreshFromApi: () => Promise<void>
  addCategory: (cat: Omit<Category, "id" | "isCustom">) => Promise<Category>
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addLoan: (loan: Omit<Loan, "id" | "createdAt">) => Promise<Loan>
  updateLoan: (id: string, patch: Partial<Loan>) => Promise<void>
  repayLoan: (id: string, amount: number) => Promise<void>
  deleteLoan: (id: string) => Promise<void>
  setBudget: (categoryId: string, amount: number) => Promise<void>
  removeBudget: (categoryId: string) => Promise<void>
  setBudgets: (b: Budgets) => void
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => Promise<Goal>
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>
  depositGoal: (id: string, amount: number) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  updateSettings: (patch: Partial<Settings>) => void
  addQuickAddPreset: (preset: Omit<QuickAddPreset, "id">) => Promise<QuickAddPreset>
  updateQuickAddPreset: (id: string, patch: Partial<QuickAddPreset>) => Promise<void>
  deleteQuickAddPreset: (id: string) => Promise<void>
  resetNotificationInbox: () => Promise<void>
}

const StoreContext = React.createContext<StoreValue | null>(null)

function settingsFromUser(user: {
  monthlySalary?: number | null
  salaryDay?: number
  currencyCode?: string
  currencySymbol?: string
} | null | undefined): Partial<Settings> {
  return {
    salary: user?.monthlySalary ?? 0,
    salaryDate: user?.salaryDay ?? 1,
    currency: user?.currencyCode ?? "BDT",
    currencySymbol: user?.currencySymbol ?? "৳",
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated: authHydrated, user } = useAuth()
  const [data, setData] = React.useState<AppData>(() => createEmptyAppData())
  const dataRef = React.useRef(data)
  dataRef.current = data

  const [hydrated, setHydrated] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [transactionRevision, setTransactionRevision] = React.useState(0)

  const bumpTransactions = React.useCallback(() => {
    setTransactionRevision((n) => n + 1)
  }, [])

  const syncFromApi = React.useCallback(async () => {
    if (!isAuthenticated) return

    setSyncing(true)
    try {
      let categories = await categoriesApi.listCategories()
      if (categories.length === 0) {
        categories = await categoriesApi.seedDefaultCategories()
      }

      const [budgetResult, loanResult, goalResult, quickAddResult] =
        await Promise.allSettled([
        budgetsApi.listBudgets({ page: 1, limit: 200 }),
        loansApi.listLoans(),
        goalsApi.listGoals(),
        quickAddsApi.listQuickAdds(),
      ])

      const budgetRows =
        budgetResult.status === "fulfilled" ? budgetResult.value.budgets : []
      const loanRows = loanResult.status === "fulfilled" ? loanResult.value : []
      const goalRows = goalResult.status === "fulfilled" ? goalResult.value : []
      let quickAddRows =
        quickAddResult.status === "fulfilled" ? quickAddResult.value : []

      if (quickAddResult.status === "fulfilled" && quickAddRows.length === 0) {
        try {
          quickAddRows = await quickAddsApi.seedDefaultQuickAdds()
        } catch {
          // Ignore seed failures — user can add presets manually.
        }
      }

      const { budgets, budgetIds } = mapBudgetRecords(budgetRows)

      setData((current) => ({
        ...current,
        categories: categories.map(mapCategory),
        transactions: [],
        budgets,
        budgetIds,
        loans: loanRows.map(mapLoan),
        goals: goalRows.map(mapGoal),
        quickAddPresets: quickAddRows.map(mapQuickAddPreset),
        settings: {
          ...current.settings,
          ...settingsFromUser(user),
        },
      }))
      bumpTransactions()
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to load data from server."
      toast.error(message)
    } finally {
      setSyncing(false)
    }
  }, [isAuthenticated, user, bumpTransactions])

  React.useEffect(() => {
    if (!authHydrated) return

    if (!isAuthenticated) {
      setData(createEmptyAppData())
      setHydrated(true)
      return
    }

    let cancelled = false

    async function bootstrap() {
      setData(createEmptyAppData(user))
      await syncFromApi()
      if (!cancelled) setHydrated(true)
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [authHydrated, isAuthenticated, syncFromApi, user])

  const value = React.useMemo<StoreValue>(() => {
    return {
      data,
      hydrated,
      syncing,
      transactionRevision,
      refreshFromApi: syncFromApi,
      addTransaction: async (tx) => {
        const created = await transactionsApi.createTransaction(tx)
        const mapped = mapTransaction(created)
        bumpTransactions()
        return mapped
      },
      updateTransaction: async (id, patch) => {
        await transactionsApi.updateTransaction(id, patch)
        bumpTransactions()
      },
      deleteTransaction: async (id) => {
        await transactionsApi.deleteTransaction(id)
        bumpTransactions()
      },
      duplicateTransaction: async (id) => {
        const duplicated = await transactionsApi.duplicateTransaction(id)
        const mapped = mapTransaction(duplicated)
        bumpTransactions()
        return mapped
      },
      addCategory: async (cat) => {
        const created = await categoriesApi.createCategory(toCategoryBody(cat))
        const mapped = mapCategory(created)
        setData((d) => ({
          ...d,
          categories: [...d.categories, mapped],
        }))
        return mapped
      },
      updateCategory: async (id, patch) => {
        const existing = dataRef.current.categories.find((c) => c.id === id)
        if (!existing) throw new Error("Category not found.")

        const body = {
          name: patch.name ?? existing.name,
          kind: patch.kind ?? existing.kind,
          icon: patch.icon ?? existing.icon,
          color: patch.color ?? existing.color,
        }

        const updated = await categoriesApi.updateCategory(id, toCategoryBody(body))
        const mapped = mapCategory(updated)
        setData((d) => ({
          ...d,
          categories: d.categories.map((c) => (c.id === id ? mapped : c)),
        }))
      },
      deleteCategory: async (id) => {
        const budgetId = dataRef.current.budgetIds[id]
        if (budgetId) {
          await budgetsApi.deleteBudget(budgetId)
        }

        await categoriesApi.deleteCategory(id)
        setData((d) => {
          const { [id]: _budget, ...budgets } = d.budgets
          const { [id]: _budgetId, ...budgetIds } = d.budgetIds
          return {
            ...d,
            categories: d.categories.filter((c) => c.id !== id),
            budgets,
            budgetIds,
          }
        })
        bumpTransactions()
      },
      addLoan: async (loan) => {
        const created = await loansApi.createLoan(loan)
        const mapped = mapLoan(created)
        setData((d) => ({ ...d, loans: [mapped, ...d.loans] }))
        return mapped
      },
      updateLoan: async (id, patch) => {
        const updated = await loansApi.updateLoan(id, patch)
        const mapped = mapLoan(updated)
        setData((d) => ({
          ...d,
          loans: d.loans.map((l) => (l.id === id ? mapped : l)),
        }))
      },
      repayLoan: async (id, amount) => {
        const updated = await loansApi.repayLoan(id, amount)
        const mapped = mapLoan(updated)
        setData((d) => ({
          ...d,
          loans: d.loans.map((l) => (l.id === id ? mapped : l)),
        }))
      },
      deleteLoan: async (id) => {
        await loansApi.deleteLoan(id)
        setData((d) => ({ ...d, loans: d.loans.filter((l) => l.id !== id) }))
      },
      setBudget: async (categoryId, amount) => {
        const monthlyLimit = Math.round(amount)
        if (!monthlyLimit || monthlyLimit <= 0) {
          const budgetId = dataRef.current.budgetIds[categoryId]
          if (budgetId) {
            await budgetsApi.deleteBudget(budgetId)
          }
          setData((d) => {
            const { [categoryId]: _budget, ...budgets } = d.budgets
            const { [categoryId]: _budgetId, ...budgetIds } = d.budgetIds
            return { ...d, budgets, budgetIds }
          })
          return
        }

        const existingId = dataRef.current.budgetIds[categoryId]
        const budget = existingId
          ? await budgetsApi.updateBudget(existingId, monthlyLimit)
          : await budgetsApi.createBudget(categoryId, monthlyLimit)

        setData((d) => ({
          ...d,
          budgets: { ...d.budgets, [categoryId]: budget.monthly_limit },
          budgetIds: { ...d.budgetIds, [categoryId]: budget.id },
        }))
      },
      removeBudget: async (categoryId) => {
        const budgetId = dataRef.current.budgetIds[categoryId]
        if (budgetId) {
          await budgetsApi.deleteBudget(budgetId)
        }
        setData((d) => {
          const { [categoryId]: _budget, ...budgets } = d.budgets
          const { [categoryId]: _budgetId, ...budgetIds } = d.budgetIds
          return { ...d, budgets, budgetIds }
        })
      },
      setBudgets: (b) => setData((d) => ({ ...d, budgets: b })),
      addGoal: async (goal) => {
        const created = await goalsApi.createGoal(goal)
        const mapped = mapGoal(created)
        setData((d) => ({ ...d, goals: [mapped, ...d.goals] }))
        return mapped
      },
      updateGoal: async (id, patch) => {
        const updated = await goalsApi.updateGoal(id, patch)
        const mapped = mapGoal(updated)
        setData((d) => ({
          ...d,
          goals: d.goals.map((g) => (g.id === id ? mapped : g)),
        }))
      },
      depositGoal: async (id, amount) => {
        const payment = Math.round(amount)
        if (!payment || payment <= 0) {
          throw new Error("Enter a valid deposit amount.")
        }

        const updated = await goalsApi.depositGoal(id, payment)
        const mapped = mapGoal(updated)
        setData((d) => ({
          ...d,
          goals: d.goals.map((g) => (g.id === id ? mapped : g)),
        }))
      },
      deleteGoal: async (id) => {
        await goalsApi.deleteGoal(id)
        setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }))
      },
      updateSettings: (patch) =>
        setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      addQuickAddPreset: async (preset) => {
        const created = await quickAddsApi.createQuickAdd(toCreateQuickAddBody(preset))
        const mapped = mapQuickAddPreset(created)
        setData((d) => ({
          ...d,
          quickAddPresets: [...d.quickAddPresets, mapped],
        }))
        return mapped
      },
      updateQuickAddPreset: async (id, patch) => {
        const updated = await quickAddsApi.updateQuickAdd(id, toUpdateQuickAddBody(patch))
        const mapped = mapQuickAddPreset(updated)
        setData((d) => ({
          ...d,
          quickAddPresets: d.quickAddPresets.map((p) => (p.id === id ? mapped : p)),
        }))
      },
      deleteQuickAddPreset: async (id) => {
        await quickAddsApi.deleteQuickAdd(id)
        setData((d) => ({
          ...d,
          quickAddPresets: d.quickAddPresets.filter((p) => p.id !== id),
        }))
      },
      resetNotificationInbox: async () => {
        try {
          await notificationsApi.clearNotificationReadState()
        } catch {
          // Fall back to local clear if API fails.
        }
        clearNotificationReadState()
      },
    }
  }, [data, hydrated, syncing, transactionRevision, syncFromApi, bumpTransactions])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
