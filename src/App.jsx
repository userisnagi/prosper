import DashboardLayout from "./layout/DashboardLayout"
import LoginPage from "./LoginPage"
import DashboardPage from "./pages/DashboardPage"
import { ToastProvider } from "./components/ToastProvider"
import { useState, useEffect } from "react"
import { fetchExchangeRates } from "./utils/currency"

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
]

function loadCurrency() {
  try {
    const saved = localStorage.getItem("prosper_currency")
    return saved || "INR"
  } catch {
    return "INR"
  }
}

function loadDarkMode() {
  try {
    const saved = localStorage.getItem("prosper_dark_mode")
    return saved === "1"
  } catch {
    return false
  }
}

function App() {
  const [activeSection, setActiveSection] = useState("dashboard-section")
  const [transactionCount, setTransactionCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState("viewer")
  const [userType, setUserType] = useState("guest")
  const [darkMode, setDarkMode] = useState(loadDarkMode)
  const [currency, setCurrency] = useState(loadCurrency)
  const [exchangeRates, setExchangeRates] = useState({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      document.body.style.backgroundColor = "#0f172a"
      document.body.style.color = "#e2e8f0"
    } else {
      document.documentElement.classList.remove("dark")
      document.body.style.backgroundColor = "#f9fafb"
      document.body.style.color = "#111827"
    }
    try {
      localStorage.setItem("prosper_dark_mode", darkMode ? "1" : "0")
    } catch {}
  }, [darkMode])

  useEffect(() => {
    try {
      localStorage.setItem("prosper_currency", currency)
    } catch {}
    
    const loadRates = async () => {
      try {
        const rates = await fetchExchangeRates('INR')
        rates['INR'] = 1
        setExchangeRates(rates)
      } catch (error) {
        console.error('Failed to load exchange rates:', error)
        const fallbackRates = {
          'USD': 0.012,
          'EUR': 0.011,
          'GBP': 0.0095,
          'JPY': 1.8,
          'AUD': 0.019,
          'CAD': 0.017,
          'CHF': 0.011,
          'SGD': 0.016,
          'INR': 1,
          'CNY': 0.086,
          'HKD': 0.094,
          'NZD': 0.020,
          'SEK': 0.13,
          'KRW': 16.5,
          'MXN': 0.24,
          'BRL': 0.067,
          'ZAR': 0.22,
          'TRY': 0.41,
          'THB': 0.41,
          'PHP': 0.69,
          'MYR': 0.054,
          'IDR': 195
        }
        setExchangeRates(fallbackRates)
      }
    }
    
    loadRates()
  }, [currency])

  const handleLogin = (role, type) => {
    setUserRole(role)
    setUserType(type)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("prosper_session")
    setIsAuthenticated(false)
    setUserRole("viewer")
    setUserType("guest")
    window.history.pushState(null, '', window.location.pathname)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />
  }

  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  const getSessionEmail = () => {
    try {
      const session = localStorage.getItem("prosper_session")
      if (session) {
        const parsed = JSON.parse(session)
        return parsed.email || null
      }
    } catch {}
    return null
  }

  const userEmail = getSessionEmail()

  return (
    <ToastProvider>
      <DashboardLayout 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userType={userRole}
        setUserType={setUserType}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currency={currency}
        setCurrency={setCurrency}
        currencies={CURRENCIES}
        currentCurrency={currentCurrency}
        userEmail={userEmail}
      >
        <DashboardPage 
          darkMode={darkMode}
          currencySymbol={currentCurrency.symbol}
          currency={currency}
          userRole={userRole}
          currencies={CURRENCIES}
          exchangeRates={exchangeRates}
          dateFrom={dateFrom}
          dateTo={dateTo}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
        />
      </DashboardLayout>
    </ToastProvider>
  )
}

export default App
