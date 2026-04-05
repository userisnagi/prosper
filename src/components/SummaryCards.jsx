import { motion } from "framer-motion"
import { computeTotals, formatInr } from "../utils/finance"
import { memo } from "react"

const MotionCard = motion.div

const SummaryCards = memo(function SummaryCards({ transactions, currency = "INR" }) {
  const { balance, income, expenses } = computeTotals(transactions)

  const cards = [
    { 
      title: "Net Balance", 
      value: formatInr(balance, currency),
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400"
    },
    { 
      title: "Total Income", 
      value: formatInr(income, currency),
      icon: "M7 11l5-5m0 0l5 5m-5-5v12",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
    { 
      title: "Total Expenses", 
      value: formatInr(expenses, currency),
      icon: "M17 13l-5 5m0 0l-5-5m5 5V6",
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-900/20",
      textColor: "text-rose-600 dark:text-rose-400"
    },
  ]

  return (
    <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
      {cards.map((card, index) => (
        <MotionCard
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
          className="rounded-2xl bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                {card.value}
              </h2>
            </div>
            <div className={`p-3.5 rounded-xl ${card.bgColor} shadow-sm`}>
              <svg 
                className={`w-7 h-7 ${card.textColor}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
          </div>
        </MotionCard>
      ))}
    </div>
  )
})

export default SummaryCards
