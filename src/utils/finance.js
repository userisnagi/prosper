export const TRANSACTIONS_KEY = "transactions"
export const DARK_MODE_KEY = "finance_dark_mode"

const DEFAULT_TRANSACTIONS = [
  // January 2026
  { id: 1, date: "2026-01-05", category: "Salary", type: "Income", amount: 75000 },
  { id: 2, date: "2026-01-07", category: "Rent", type: "Expense", amount: 15000 },
  { id: 3, date: "2026-01-10", category: "Groceries", type: "Expense", amount: 3500 },
  { id: 4, date: "2026-01-12", category: "Electricity Bill", type: "Expense", amount: 1200 },
  { id: 5, date: "2026-01-15", category: "Dining Out", type: "Expense", amount: 2800 },
  { id: 6, date: "2026-01-18", category: "Transport", type: "Expense", amount: 800 },
  { id: 7, date: "2026-01-20", category: "Freelance Work", type: "Income", amount: 12000 },
  { id: 8, date: "2026-01-22", category: "Entertainment", type: "Expense", amount: 1500 },
  { id: 9, date: "2026-01-25", category: "Shopping", type: "Expense", amount: 4200 },
  { id: 10, date: "2026-01-28", category: "Internet Bill", type: "Expense", amount: 999 },
  
  // February 2026
  { id: 11, date: "2026-02-05", category: "Salary", type: "Income", amount: 75000 },
  { id: 12, date: "2026-02-06", category: "Rent", type: "Expense", amount: 15000 },
  { id: 13, date: "2026-02-08", category: "Groceries", type: "Expense", amount: 4100 },
  { id: 14, date: "2026-02-10", category: "Gym Membership", type: "Expense", amount: 2000 },
  { id: 15, date: "2026-02-12", category: "Dining Out", type: "Expense", amount: 3200 },
  { id: 16, date: "2026-02-14", category: "Valentine Dinner", type: "Expense", amount: 5500 },
  { id: 17, date: "2026-02-16", category: "Transport", type: "Expense", amount: 900 },
  { id: 18, date: "2026-02-18", category: "Online Course", type: "Expense", amount: 3500 },
  { id: 19, date: "2026-02-20", category: "Dividend Income", type: "Income", amount: 2500 },
  { id: 20, date: "2026-02-22", category: "Healthcare", type: "Expense", amount: 1800 },
  { id: 21, date: "2026-02-25", category: "Shopping", type: "Expense", amount: 6200 },
  { id: 22, date: "2026-02-27", category: "Mobile Recharge", type: "Expense", amount: 599 },
  
  // March 2026
  { id: 23, date: "2026-03-01", category: "Salary", type: "Income", amount: 78000 },
  { id: 24, date: "2026-03-03", category: "Rent", type: "Expense", amount: 15000 },
  { id: 25, date: "2026-03-05", category: "Groceries", type: "Expense", amount: 3800 },
  { id: 26, date: "2026-03-07", category: "Fuel", type: "Expense", amount: 2500 },
  { id: 27, date: "2026-03-09", category: "Dining Out", type: "Expense", amount: 2200 },
  { id: 28, date: "2026-03-10", category: "Insurance Premium", type: "Expense", amount: 4500 },
  { id: 29, date: "2026-03-12", category: "Freelance Project", type: "Income", amount: 18000 },
  { id: 30, date: "2026-03-14", category: "Entertainment", type: "Expense", amount: 1800 },
  { id: 31, date: "2026-03-16", category: "Clothing", type: "Expense", amount: 5500 },
  { id: 32, date: "2026-03-18", category: "Transport", type: "Expense", amount: 1100 },
  { id: 33, date: "2026-03-20", category: "Electricity Bill", type: "Expense", amount: 1400 },
  { id: 34, date: "2026-03-22", category: "Gift", type: "Expense", amount: 3000 },
  { id: 35, date: "2026-03-24", category: "Stock Sale", type: "Income", amount: 8500 },
  { id: 36, date: "2026-03-26", category: "Restaurant", type: "Expense", amount: 2800 },
  { id: 37, date: "2026-03-28", category: "Home Maintenance", type: "Expense", amount: 3500 },
  { id: 38, date: "2026-03-30", category: "Internet Bill", type: "Expense", amount: 999 },
  { id: 39, date: "2026-03-31", category: "Groceries", type: "Expense", amount: 2900 },
]

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY)
    if (raw === null) return DEFAULT_TRANSACTIONS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_TRANSACTIONS
  } catch {
    return DEFAULT_TRANSACTIONS
  }
}

export function loadDarkMode() {
  try {
    return localStorage.getItem(DARK_MODE_KEY) === "1"
  } catch {
    return false
  }
}

/** Title-case category for display; trims and collapses spaces. */
export function normalizeCategoryLabel(s) {
  const t = String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
  if (!t) return "Other"
  return t
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .filter(Boolean)
    .join(" ")
}

/** Merge duplicate categories that differ only by case (and fix stored rows on load). */
export function normalizeCategoriesInTransactions(transactions) {
  const keyToLabel = {}
  for (const t of transactions) {
    const raw = String(t.category ?? "").trim() || "Other"
    const key = raw.toLowerCase()
    if (keyToLabel[key] === undefined) {
      keyToLabel[key] = normalizeCategoryLabel(raw)
    }
  }
  return transactions.map((t) => {
    const raw = String(t.category ?? "").trim() || "Other"
    const key = raw.toLowerCase()
    return { ...t, category: keyToLabel[key] }
  })
}

export function formatInr(amount, currencyCode = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function computeTotals(transactions) {
  let income = 0
  let expenses = 0
  for (const t of transactions) {
    if (t.type === "Income") income += t.amount
    else expenses += t.amount
  }
  return { income, expenses, balance: income - expenses }
}

export function monthlyBalanceTrend(transactions) {
  const byMonth = {}
  for (const t of transactions) {
    if (!t.date || t.date.length < 7) continue
    const key = t.date.slice(0, 7)
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 }
    if (t.type === "Income") byMonth[key].income += t.amount
    else byMonth[key].expense += t.amount
  }
  const months = Object.keys(byMonth).sort()
  let running = 0
  return months.map((m) => {
    const { income, expense } = byMonth[m]
    running += income - expense
    const label = new Date(`${m}-01T12:00:00`).toLocaleString("en", { month: "short" })
    return { month: label, balance: running }
  })
}

export function spendingByCategory(transactions) {
  const map = {}
  for (const t of transactions) {
    if (t.type !== "Expense") continue
    const raw = String(t.category ?? "").trim() || "Other"
    const key = raw.toLowerCase()
    if (!map[key]) {
      map[key] = { name: normalizeCategoryLabel(raw), value: 0 }
    }
    map[key].value += t.amount
  }
  return Object.values(map)
}

export function escapeCsvCell(value) {
  const s = String(value ?? "")
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** Label for YYYY-MM for display */
export function formatMonthKey(ym) {
  if (!ym || ym.length < 7) return ym
  const d = new Date(`${ym}-01T12:00:00`)
  return d.toLocaleString("en", { month: "short", year: "numeric" })
}

/**
 * Compare expense totals between the two latest calendar months that have data.
 */
export function monthlyExpenseComparison(transactions) {
  const byMonth = {}
  for (const t of transactions) {
    if (t.type !== "Expense" || !t.date || t.date.length < 7) continue
    const key = t.date.slice(0, 7)
    byMonth[key] = (byMonth[key] || 0) + t.amount
  }
  const months = Object.keys(byMonth).sort()
  if (months.length === 0) {
    return { kind: "none" }
  }
  if (months.length === 1) {
    const m = months[0]
    return { kind: "single", month: m, amount: byMonth[m] }
  }
  const older = months[months.length - 2]
  const newer = months[months.length - 1]
  const olderAmt = byMonth[older]
  const newerAmt = byMonth[newer]
  const diff = newerAmt - olderAmt
  const pctChange = olderAmt === 0 ? null : (diff / olderAmt) * 100
  return {
    kind: "compare",
    olderMonth: older,
    newerMonth: newer,
    olderAmt,
    newerAmt,
    diff,
    pctChange,
  }
}
