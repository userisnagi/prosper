import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import SummaryCard from '../components/SummaryCard'
import BalanceChart from '../components/BalanceChart'
import ExpenseChart from '../components/ExpenseChart'
import Transactions from '../components/Transactions'
import Insights from '../components/Insights'
import CurrencyConverter from '../components/CurrencyConverter'
import {
  loadTransactions,
  normalizeCategoriesInTransactions,
  TRANSACTIONS_KEY,
  monthlyBalanceTrend,
  spendingByCategory,
} from '../utils/finance'

function DashboardPage({ darkMode, currencySymbol, currency = 'INR', userRole = 'viewer', currencies, exchangeRates, dateFrom, dateTo, setDateFrom, setDateTo }) {
  const [transactions, setTransactions] = useState(() => {
    const loaded = loadTransactions()
    return normalizeCategoriesInTransactions(loaded || [])
  })

  // Convert transactions to selected currency
  const convertedTransactions = useMemo(() => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return transactions
    }
    
    const rate = currency === 'INR' ? 1 : (exchangeRates[currency] || 1)
    
    return transactions.map(t => ({
      ...t,
      amount: t.amount * rate
    }))
  }, [transactions, exchangeRates, currency])

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    let filtered = convertedTransactions
    
    if (dateFrom) {
      filtered = filtered.filter(t => t.date >= dateFrom)
    }
    
    if (dateTo) {
      filtered = filtered.filter(t => t.date <= dateTo)
    }
    
    return filtered
  }, [convertedTransactions, dateFrom, dateTo])

  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
    } catch {
      /* ignore */
    }
  }, [transactions])

  const balanceData = useMemo(() => monthlyBalanceTrend(filteredTransactions), [filteredTransactions])
  const spendingData = useMemo(() => spendingByCategory(filteredTransactions), [filteredTransactions])

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type.toLowerCase() === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type.toLowerCase() === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const netBalance = totalIncome - totalExpenses

  const formatCurrency = (amount) => {
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
      return formatted
    } catch (error) {
      console.error('Currency formatting error:', error)
      return `${currencySymbol}${amount.toLocaleString('en-IN')}`
    }
  }

  return (
    <div className="space-y-8 transition-colors duration-300">
      {/* Dashboard Section */}
      <div id="dashboard-section" className="scroll-mt-24 min-h-[calc(100vh-120px)]">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome to Prosper
              </h1>
              <p className={`mt-2 text-base ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Your financial command center — track income, spending and balance.
              </p>
            </div>
            
            {/* Global Date Filter */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Date Range:
                </span>
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                  }}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Net Balance"
            value={formatCurrency(netBalance)}
            icon={DollarSign}
            iconBg={darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}
            iconColor="text-emerald-600"
            trend="up"
            trendValue="12.5% from last month"
            darkMode={darkMode}
          />
          <SummaryCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            icon={TrendingUp}
            iconBg={darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}
            iconColor="text-blue-600"
            trend="up"
            trendValue="8.2% from last month"
            darkMode={darkMode}
          />
          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={TrendingDown}
            iconBg={darkMode ? 'bg-red-900/30' : 'bg-red-50'}
            iconColor="text-red-600"
            trend="down"
            trendValue="3.1% from last month"
            darkMode={darkMode}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BalanceChart data={balanceData} darkMode={darkMode} />
          <ExpenseChart data={spendingData} darkMode={darkMode} />
        </div>
        </div>
      </div>

      {/* Currency Converter Section */}
      <div id="currency-section" className="pt-8 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <CurrencyConverter 
            currencies={currencies} 
            darkMode={darkMode} 
          />
        </div>
      </div>

      {/* Transactions Section */}
      <div id="transactions-section" className="pt-8 scroll-mt-24">
        <Transactions
          role={userRole}
          transactions={filteredTransactions}
          setTransactions={setTransactions}
          currency={currency}
        />
      </div>

      {/* Insights Section */}
      <div id="insights-section" className="pt-8 scroll-mt-24">
        <Insights 
          transactions={filteredTransactions}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      </div>

    </div>
  )
}

export default DashboardPage
