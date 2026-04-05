import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightLeft, RefreshCw } from 'lucide-react'
import { formatCurrencyWithSymbol } from '../utils/currency'

function CurrencyConverter({ currencies, darkMode }) {
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('INR')
  const [amount, setAmount] = useState('1000')
  const [convertedAmount, setConvertedAmount] = useState(null)
  const [exchangeRate, setExchangeRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Fetch rates and convert when inputs change
  useEffect(() => {
    const convert = async () => {
      if (!amount || isNaN(amount)) {
        setConvertedAmount(null)
        setExchangeRate(null)
        return
      }

      setLoading(true)
      try {
        // Use ExchangeRate-API which supports all currencies as base
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        const rates = data.rates
        const rate = rates[toCurrency]
        
        if (rate) {
          const result = parseFloat(amount) * rate
          setConvertedAmount(result)
          setExchangeRate(rate)
          setLastUpdated(new Date().toLocaleTimeString())
        }
      } catch (error) {
        console.error('Conversion error:', error)
        // Fallback calculation with approximate rates
        if (fromCurrency === toCurrency) {
          setConvertedAmount(parseFloat(amount))
          setExchangeRate(1)
        }
      } finally {
        setLoading(false)
      }
    }

    convert()
  }, [amount, fromCurrency, toCurrency])

  // Swap currencies
  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        darkMode ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
            }`}>
              <ArrowRightLeft className={`w-5 h-5 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Currency Converter
              </h3>
              {lastUpdated && (
                <p className={`text-xs ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setConvertedAmount(null)
              setExchangeRate(null)
            }}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? 'hover:bg-slate-700 text-slate-400'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="Reset"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Converter Body */}
      <div className="p-6 space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${
            darkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            From
          </label>
          <div className="flex gap-3">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                darkMode
                  ? 'bg-slate-900 border-slate-600 text-white focus:border-emerald-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                darkMode
                  ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className={`p-2 rounded-full transition-all hover:scale-110 ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-emerald-400'
                : 'bg-gray-100 hover:bg-gray-200 text-emerald-600'
            }`}
            title="Swap currencies"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${
            darkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            To
          </label>
          <div className="flex gap-3">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                darkMode
                  ? 'bg-slate-900 border-slate-600 text-white focus:border-emerald-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
            <div
              className={`flex-1 px-4 py-3 rounded-lg border font-medium ${
                darkMode
                  ? 'bg-slate-900/50 border-slate-600 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {loading ? (
                <span className="text-sm">Converting...</span>
              ) : convertedAmount !== null ? (
                formatCurrencyWithSymbol(convertedAmount, toCurrency)
              ) : (
                <span className={`text-sm ${
                  darkMode ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  Result
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        {exchangeRate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 p-3 rounded-lg text-center text-sm ${
              darkMode
                ? 'bg-slate-900/50 text-slate-400'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            <span className="font-medium">1 {fromCurrency}</span> ={' '}
            <span className={`font-semibold ${
              darkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              {exchangeRate.toFixed(4)} {toCurrency}
            </span>
          </motion.div>
        )}

      </div>
    </motion.div>
  )
}

export default CurrencyConverter
