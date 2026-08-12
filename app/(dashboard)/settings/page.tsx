"use client"

import * as React from "react"
import {
  PageHeader,
  dashLabel,
  dashCaption,
  dashInput,
  DashPage,
  DashboardCard,
} from "@/dashboard/shared"
import { QuickAddPresetsManager } from "@/dashboard/quick-add-presets-manager"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth"
import * as usersApi from "@/lib/api/users"
import { Icon } from "@/lib/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CURRENCIES = [
  { symbol: "৳", name: "BDT — Bangladeshi Taka" },
  { symbol: "$", name: "USD — US Dollar" },
  { symbol: "€", name: "EUR — Euro" },
  { symbol: "£", name: "GBP — British Pound" },
  { symbol: "₹", name: "INR — Indian Rupee" },
  { symbol: "¥", name: "JPY / CNY — Yen / Yuan" },
  { symbol: "R$", name: "BRL — Brazilian Real" },
  { symbol: "AED", name: "AED — UAE Dirham" },
  { symbol: "SAR", name: "SAR — Saudi Riyal" },
]

function SettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <DashboardCard
      title={title}
      description={description}
      className={className}
    >
      {children}
    </DashboardCard>
  )
}

export default function SettingsPage() {
  const { data, updateSettings, resetNotificationInbox } = useStore()
  const { user, applyProfile } = useAuth()

  const [salary, setSalary] = React.useState<string>(String(data.settings.salary))
  const [salaryDate, setSalaryDate] = React.useState<string>(String(data.settings.salaryDate))
  const [currencySymbol, setCurrencySymbol] = React.useState<string>(data.settings.currencySymbol)
  const [currency, setCurrency] = React.useState<string>(data.settings.currency)
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [savingPassword, setSavingPassword] = React.useState(false)

  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)

  React.useEffect(() => {
    setSalary(String(data.settings.salary))
    setSalaryDate(String(data.settings.salaryDate))
    setCurrencySymbol(data.settings.currencySymbol)
    setCurrency(data.settings.currency)
  }, [data.settings])

  const handleSaveFinancialProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const numSalary = Math.max(0, parseFloat(salary) || 0)
    const numDate = Math.min(28, Math.max(1, parseInt(salaryDate, 10) || 1))
    const currencyCode = currency.trim() || "BDT"

    setSavingProfile(true)
    try {
      const profile = await usersApi.updateProfile({
        monthly_salary: Math.round(numSalary),
        salary_day: numDate,
        currency_code: currencyCode,
        currency_symbol: currencySymbol.trim() || "৳",
      })

      applyProfile(profile)
      updateSettings({
        salary: numSalary,
        salaryDate: numDate,
        currencySymbol: profile.currency_symbol,
        currency: profile.currency_code,
      })
      toast.success("Financial profile saved!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error("Please enter your current password.")
      return
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.")
      return
    }

    setSavingPassword(true)
    try {
      await usersApi.changePassword(currentPassword, newPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password.")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <DashPage>
      <PageHeader
        title="Settings"
        description="Configure account security, financial profile, and quick-add shortcuts."
      />

      {/* 1. Account & Password Security */}
      <SettingsSection
        title="Account & Security"
        description="User profile details and password authentication."
      >
        <div className="space-y-5">
          {/* User Information Summary */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-(--dash-border) bg-(--dash-muted)">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--dash-accent-soft) font-mono font-black text-sm text-(--dash-accent)">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-(--dash-text) text-sm truncate">
                {user?.name || "Account"}
              </p>
              <p className="text-xs text-(--dash-text-muted) truncate">
                {user?.email || ""}
              </p>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-(--dash-success-soft) text-(--dash-income) border border-(--dash-border)">
              Active
            </span>
          </div>

          {/* Change Password Form */}
          {user?.authProvider !== "GOOGLE" ? (
          <form onSubmit={(e) => void handleUpdatePassword(e)} className="space-y-4 pt-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-(--dash-text-muted)">
              Change Password
            </h4>

            <div className="space-y-1.5 max-w-md">
              <label className={dashLabel}>Current Password</label>
              <div className="relative">
                <Input
                  className={cn(dashInput, "pr-10")}
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--dash-text-faint) hover:text-(--dash-text) cursor-pointer"
                  aria-label="Toggle current password visibility"
                >
                  <Icon name={showCurrentPassword ? "eye-off" : "eye"} className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div className="space-y-1.5">
                <label className={dashLabel}>New Password</label>
                <div className="relative">
                  <Input
                    className={cn(dashInput, "pr-10")}
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--dash-text-faint) hover:text-(--dash-text) cursor-pointer"
                    aria-label="Toggle new password visibility"
                  >
                    <Icon name={showNewPassword ? "eye-off" : "eye"} className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={dashLabel}>Confirm New Password</label>
                <Input
                  className={dashInput}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <Button variant="dash" type="submit" className="gap-1.5 mt-2" disabled={savingPassword}>
              <Icon name="key-round" className="size-4" />
              {savingPassword ? "Updating..." : "Update password"}
            </Button>
          </form>
          ) : (
            <p className={dashCaption}>Password is managed by Google for this account.</p>
          )}
        </div>
      </SettingsSection>

      {/* 2. Financial Profile & Currency */}
      <SettingsSection
        title="Financial profile & currency"
        description="Monthly salary, payday date, and preferred currency."
      >
        <form onSubmit={(e) => void handleSaveFinancialProfile(e)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={dashLabel}>Monthly salary</label>
              <Input
                className={dashInput}
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 50000"
                required
              />
              <p className={dashCaption}>Used for safe daily spending limits and cycle pacing.</p>
            </div>

            <div className="space-y-1.5">
              <label className={dashLabel}>Payday date (1–28)</label>
              <Input
                className={dashInput}
                type="number"
                min={1}
                max={28}
                value={salaryDate}
                onChange={(e) => setSalaryDate(e.target.value)}
                required
              />
              <p className={dashCaption}>Day of month your salary arrives to reset cycles.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={dashLabel}>Currency preset</label>
              <select
                value={currencySymbol}
                onChange={(e) => {
                  const sel = CURRENCIES.find((c) => c.symbol === e.target.value)
                  if (sel) {
                    setCurrencySymbol(sel.symbol)
                    setCurrency(sel.name.split(" — ")[0])
                  }
                }}
                className="dash-input w-full px-3 text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={dashLabel}>Custom currency symbol</label>
              <Input
                className={dashInput}
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="e.g. ৳ or $"
                required
              />
            </div>
          </div>

          <Button variant="dash" type="submit" className="gap-1.5" disabled={savingProfile}>
            <Icon name="check" className="size-4" />
            {savingProfile ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </SettingsSection>

      {/* 3. Quick Add Presets */}
      <QuickAddPresetsManager />

      <SettingsSection
        title="Notifications"
        description="Manage in-app notification read state."
      >
        <Button
          variant="outline"
          onClick={() => {
            void (async () => {
              try {
                await resetNotificationInbox()
                toast.success("Notifications reset")
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not reset notifications.")
              }
            })()
          }}
          className="gap-1.5"
        >
          <Icon name="bell" className="size-4" />
          Reset notification badges
        </Button>
      </SettingsSection>
    </DashPage>
  )
}
