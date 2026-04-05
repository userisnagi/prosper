import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sun, Moon } from 'lucide-react'

function Navbar({ sidebarOpen, toggleSidebar, darkMode, setDarkMode, currency, setCurrency, currencies, currentCurrency, userRole, userEmail }) {
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white shadow-lg z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Logo - Original design */}
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-white/20 rounded-xl rotate-3"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            
            {/* App Title */}
            <h1 className="text-xl font-bold tracking-tight">
              Prosper
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* User Profile */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm ${
            userRole === 'admin' 
              ? 'bg-white/15' 
              : userRole === 'guest'
                ? 'bg-white/15'
                : 'bg-white/15'
          }`}>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {userEmail ? userEmail[0].toUpperCase() : userRole[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-semibold text-white capitalize">
              {userEmail ? userEmail.split('@')[0] : userRole}
            </span>
          </div>

          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
              aria-label="Select currency"
            >
              <span className="text-lg">{currentCurrency.symbol}</span>
              <span className="text-sm font-medium hidden sm:inline">{currentCurrency.code}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showCurrencyMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCurrencyMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden"
                  >
                    {currencies.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr.code)
                          setShowCurrencyMenu(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                          currency === curr.code ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                        }`}
                      >
                        <span className="text-xl w-6 text-center flex-shrink-0">{curr.symbol}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{curr.code}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{curr.name}</div>
                        </div>
                        <div className="w-5 flex-shrink-0">
                          {currency === curr.code && (
                            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 90, scale: 0 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                >
                  <Moon className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: -90, scale: 0 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                >
                  <Sun className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
