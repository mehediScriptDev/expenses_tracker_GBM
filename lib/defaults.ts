import type { AppData } from "@/types"
import type { AuthUser } from "./auth"

export function createEmptyAppData(user?: AuthUser | null): AppData {
  return {
    version: 1,
    settings: {
      salary: user?.monthlySalary ?? 0,
      salaryDate: 1,
      currency: user?.currencyCode ?? "BDT",
      currencySymbol: user?.currencySymbol ?? "৳",
    },
    categories: [],
    transactions: [],
    loans: [],
    budgets: {},
    budgetIds: {},
    goals: [],
    quickAddPresets: [],
  }
}
