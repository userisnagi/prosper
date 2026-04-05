import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, PieChart, AlertCircle, CheckCircle, Sparkles, Loader2 } from 'lucide-react'
import { generateMockInsights } from '../services/aiInsights'

function Insights({ transactions = [], dateFrom, dateTo }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiInsights, setAiInsights] = useState(null)

  const handleGenerateInsights = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const insights = generateMockInsights(transactions, dateFrom, dateTo)
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setAiInsights(insights)
    } catch (err) {
      setError(err.message || 'Unable to generate insights at the moment.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-slate-400">No transaction data available for analysis.</p>
      </div>
    )
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 bg-green-50 dark:bg-green-900/30'
      case 'Healthy': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
      case 'Needs Improvement': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30'
      case 'Risky': return 'text-red-600 bg-red-50 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'action': return <TrendingUp className="w-5 h-5 text-blue-500" />
      case 'info': return <DollarSign className="w-5 h-5 text-purple-500" />
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return <DollarSign className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Generate Insights Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleGenerateInsights}
          disabled={isLoading}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing your financial data...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Financial Insights
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center"
        >
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Insights Display */}
      {aiInsights && (
        <>
          {/* Analysis Mode Badge */}
          <div className="flex justify-center">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              📊 Smart Financial Analysis (Local)
            </span>
          </div>

          {/* Period Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold mb-3">📅 Period Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Current Period</p>
                <p className="font-semibold">{aiInsights.periodInformation.currentPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Previous Period</p>
                <p className="font-semibold">{aiInsights.periodInformation.previousPeriod}</p>
              </div>
            </div>
          </motion.div>

          {/* Spending Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{aiInsights.spendingSummary.totalIncome}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{aiInsights.spendingSummary.totalExpenses}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Net Savings</p>
              <p className="text-2xl font-bold text-blue-600">{aiInsights.spendingSummary.netSavings}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Savings Rate: {aiInsights.spendingSummary.savingsRate}</p>
            </div>
          </motion.div>

          {/* Trend Comparison */}
          {aiInsights.periodInformation.hasPreviousData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-purple-500" />
                Trend Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Income Change</p>
                  <p className={`text-lg font-semibold ${parseFloat(aiInsights.trendComparison.incomeChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {aiInsights.trendComparison.incomeChange}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Expense Change</p>
                  <p className={`text-lg font-semibold ${parseFloat(aiInsights.trendComparison.expenseChange) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {aiInsights.trendComparison.expenseChange}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Savings Change</p>
                  <p className={`text-lg font-semibold ${parseFloat(aiInsights.trendComparison.savingsChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {aiInsights.trendComparison.savingsChange}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400">{aiInsights.trendComparison.analysis}</p>
            </motion.div>
          )}

          {/* Category Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Category Insights
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Top Spending Category</p>
              <p className="text-xl font-bold text-blue-600">
                {aiInsights.categoryInsights.topCategory} - {aiInsights.categoryInsights.topCategoryPercentage}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-slate-400">Top 3 Categories:</p>
              {aiInsights.categoryInsights.top3Categories.map((cat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span>{cat}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-4">{aiInsights.categoryInsights.analysis}</p>
          </motion.div>

          {/* Spending Behavior */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Spending Behavior
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Largest Transaction</p>
                <p className="font-semibold">{aiInsights.spendingBehavior.largestTransaction}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Daily Average</p>
                <p className="font-semibold">{aiInsights.spendingBehavior.dailyAverage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total Transactions</p>
                <p className="font-semibold">{aiInsights.spendingBehavior.totalTransactions}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">{aiInsights.spendingBehavior.analysis}</p>
          </motion.div>

          {/* Financial Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-xl p-6 border ${getHealthColor(aiInsights.financialHealth.status)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {aiInsights.financialHealth.status === 'Excellent' || aiInsights.financialHealth.status === 'Healthy' ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <AlertCircle className="w-8 h-8" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  Financial Health: {aiInsights.financialHealth.status}
                </h3>
                <p className="text-sm opacity-80 mb-2">{aiInsights.financialHealth.reasoning}</p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-current h-2 rounded-full transition-all"
                    style={{ width: `${aiInsights.financialHealth.score}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Financial Recommendations
            </h3>
            <div className="space-y-4">
              {aiInsights.recommendations.map((rec, index) => (
                <div key={index} className="flex gap-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-900">
                  <div className="flex-shrink-0 mt-0.5">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{rec.title}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Initial State */}
      {!aiInsights && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700"
        >
          <Sparkles className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-slate-300">
            Ready to Analyze
          </h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
            Click the button above to generate intelligent financial insights based on your transaction data.
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default Insights
