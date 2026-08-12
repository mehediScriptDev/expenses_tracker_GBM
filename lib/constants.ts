import type { Category, Mood, PaymentMethod, QuickAddPreset } from "@/types"

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Food", icon: "utensils", color: "var(--chart-2)", kind: "expense", isCustom: false },
  { id: "transport", name: "Transport", icon: "bus", color: "var(--chart-3)", kind: "expense", isCustom: false },
  { id: "family", name: "Family", icon: "users", color: "var(--chart-4)", kind: "expense", isCustom: false },
  { id: "parents", name: "Parents", icon: "heart-handshake", color: "var(--chart-5)", kind: "expense", isCustom: false },
  { id: "wife", name: "Wife", icon: "heart", color: "var(--chart-2)", kind: "expense", isCustom: false },
  { id: "education", name: "Education", icon: "book-open", color: "var(--chart-3)", kind: "expense", isCustom: false },
  { id: "university", name: "University", icon: "graduation-cap", color: "var(--chart-4)", kind: "expense", isCustom: false },
  { id: "medical", name: "Medical", icon: "stethoscope", color: "var(--chart-5)", kind: "expense", isCustom: false },
  { id: "shopping", name: "Shopping", icon: "shopping-bag", color: "var(--chart-2)", kind: "expense", isCustom: false },
  { id: "entertainment", name: "Entertainment", icon: "clapperboard", color: "var(--chart-3)", kind: "expense", isCustom: false },
  { id: "internet", name: "Internet", icon: "wifi", color: "var(--chart-4)", kind: "expense", isCustom: false },
  { id: "electricity", name: "Electricity", icon: "zap", color: "var(--chart-5)", kind: "expense", isCustom: false },
  { id: "rent", name: "Rent", icon: "house", color: "var(--chart-4)", kind: "expense", isCustom: false },
  { id: "fuel", name: "Fuel", icon: "fuel", color: "var(--chart-3)", kind: "expense", isCustom: false },
  { id: "savings", name: "Savings", icon: "piggy-bank", color: "var(--chart-2)", kind: "expense", isCustom: false },
  { id: "investment", name: "Investment", icon: "trending-up", color: "var(--chart-5)", kind: "expense", isCustom: false },
  { id: "loan-repayment", name: "Loan Repayment", icon: "banknote", color: "var(--chart-4)", kind: "expense", isCustom: false },
  { id: "gifts", name: "Gifts", icon: "gift", color: "var(--chart-3)", kind: "expense", isCustom: false },
  { id: "subscriptions", name: "Subscriptions", icon: "repeat", color: "var(--chart-2)", kind: "expense", isCustom: false },
  { id: "emergency", name: "Emergency", icon: "siren", color: "var(--chart-5)", kind: "expense", isCustom: false },
  { id: "other", name: "Other", icon: "ellipsis", color: "var(--chart-4)", kind: "expense", isCustom: false },
  { id: "salary", name: "Salary", icon: "wallet", color: "var(--chart-5)", kind: "income", isCustom: false },
  { id: "freelance", name: "Freelance", icon: "laptop", color: "var(--chart-3)", kind: "income", isCustom: false },
  { id: "borrowed", name: "Borrowed Money", icon: "hand-coins", color: "var(--chart-4)", kind: "income", isCustom: false },
]

export const MOODS: { value: Mood; label: string; icon: string; color: string }[] = [
  { value: "necessary", label: "Necessary", icon: "circle-check", color: "var(--chart-1)" },
  { value: "happy", label: "Happy", icon: "smile", color: "var(--chart-2)" },
  { value: "luxury", label: "Luxury", icon: "gem", color: "var(--chart-3)" },
  { value: "regret", label: "Regret", icon: "frown", color: "var(--chart-4)" },
]

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank" },
  { value: "other", label: "Other" },
]

export const DEFAULT_QUICK_ADD_PRESETS: QuickAddPreset[] = [
  { id: "qa_coffee", label: "Coffee", icon: "coffee", amount: 50, categoryId: "food", paymentMethod: "cash" },
  { id: "qa_bus", label: "Bus", icon: "bus", amount: 40, categoryId: "transport", paymentMethod: "cash" },
  { id: "qa_lunch", label: "Lunch", icon: "utensils", amount: 150, categoryId: "food", paymentMethod: "bkash" },
  { id: "qa_fuel", label: "Fuel", icon: "fuel", amount: 200, categoryId: "fuel", paymentMethod: "cash" },
  { id: "qa_groceries", label: "Groceries", icon: "shopping-bag", amount: 500, categoryId: "food", paymentMethod: "bkash" },
]

export const QUICK_ADD_ICON_CHOICES = [
  "coffee", "bus", "utensils", "fuel", "shopping-bag", "pizza", "phone",
  "car", "shirt", "wallet", "zap", "wifi", "heart", "gift", "repeat",
]

export const CATEGORY_ICON_CHOICES = [
  "utensils", "bus", "users", "heart", "heart-handshake", "book-open",
  "graduation-cap", "stethoscope", "shopping-bag", "clapperboard", "wifi",
  "zap", "house", "fuel", "piggy-bank", "trending-up", "banknote", "gift",
  "repeat", "siren", "wallet", "laptop", "hand-coins", "coffee", "dumbbell",
  "plane", "car", "phone", "shirt", "pizza", "ellipsis",
]

export const CATEGORY_COLOR_CHOICES = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
]

export const AUTH_KEY = "goribmanush:auth:v1"
export const ACCESS_TOKEN_KEY = "goribmanush:access-token"
export const REFRESH_TOKEN_KEY = "goribmanush:refresh-token"
