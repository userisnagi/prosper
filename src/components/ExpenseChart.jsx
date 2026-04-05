import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

function ExpenseChart({ data, darkMode }) {
  // Expanded color palette for more categories
  const COLORS = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
    '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#e11d48',
    '#a855f7', '#0ea5e9', '#22c55e', '#eab308', '#dc2626', '#7c3aed',
    '#0891b2', '#65a30d', '#ea580c', '#4f46e5', '#0d9488', '#be123c'
  ]

  // Group data: show top 8 categories, merge rest into "Others"
  const processData = (data) => {
    if (!data || data.length === 0) return []
    
    // Sort by value descending
    const sorted = [...data].sort((a, b) => b.value - a.value)
    
    // If 8 or fewer categories, show all
    if (sorted.length <= 8) {
      return sorted
    }
    
    // Take top 7 and merge the rest into "Others"
    const topCategories = sorted.slice(0, 7)
    const othersValue = sorted.slice(7).reduce((sum, item) => sum + item.value, 0)
    
    return [
      ...topCategories,
      { name: 'Others', value: othersValue }
    ]
  }

  const chartData = processData(data)
  
  // Calculate total for percentage
  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0)

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalSpending) * 100).toFixed(1)
      
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          darkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          <p className={`font-semibold text-sm mb-1 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {data.name}
          </p>
          <div className="space-y-1">
            <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Amount: <span className="font-semibold">₹{data.value.toLocaleString()}</span>
            </p>
            <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Percentage: <span className="font-semibold">{percentage}%</span>
            </p>
            <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Total Spending: <span className="font-semibold">₹{totalSpending.toLocaleString()}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`rounded-xl border p-6 shadow-sm ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Spending by Category
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              activeShape={{
                outerRadius: 115,
                innerRadius: 0,
                fill: '#8884d8',
                stroke: darkMode ? '#e2e8f0' : '#111827',
                strokeWidth: 2
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke={darkMode ? '#1e293b' : '#ffffff'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ 
                paddingLeft: '20px',
                color: darkMode ? '#e2e8f0' : '#111827',
                fontSize: '12px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default ExpenseChart
