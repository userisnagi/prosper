const API_URL = 'https://llm.chutes.ai/v1/chat/completions'

export function summarizeTransactions(transactions, dateFrom, dateTo) {
  let filtered = transactions
  
  if (dateFrom) {
    filtered = filtered.filter(t => t.date >= dateFrom)
  }
  
  if (dateTo) {
    filtered = filtered.filter(t => t.date <= dateTo)
  }

  const sortedDates = filtered.map(t => t.date).sort()
  const currentPeriodStart = sortedDates[0] || dateFrom || ''
  const currentPeriodEnd = sortedDates[sortedDates.length - 1] || dateTo || ''

  let previousPeriodStart = ''
  let previousPeriodEnd = ''
  
  if (currentPeriodStart && currentPeriodEnd) {
    const start = new Date(currentPeriodStart)
    const end = new Date(currentPeriodEnd)
    const periodLength = end - start
    
    const prevEnd = new Date(start)
    prevEnd.setDate(prevEnd.getDate() - 1)
    
    const prevStart = new Date(prevEnd)
    prevStart.setTime(prevStart.getTime() - periodLength)
    
    previousPeriodEnd = prevEnd.toISOString().split('T')[0]
    previousPeriodStart = prevStart.toISOString().split('T')[0]
  }


  // Calculate totals
  const income = filtered
    .filter(t => t.type.toLowerCase() === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expenses = filtered
    .filter(t => t.type.toLowerCase() === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const savings = income - expenses

  // Category breakdown
  const categoryBreakdown = {}
  filtered
    .filter(t => t.type.toLowerCase() === 'expense')
    .forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
    })

  // Previous period data for comparison
  let previousIncome = 0
  let previousExpenses = 0
  let previousSavings = 0
  
  if (previousPeriodStart && previousPeriodEnd) {
    const previousTransactions = transactions.filter(t => 
      t.date >= previousPeriodStart && t.date <= previousPeriodEnd
    )
    
    previousIncome = previousTransactions
      .filter(t => t.type.toLowerCase() === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    previousExpenses = previousTransactions
      .filter(t => t.type.toLowerCase() === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    previousSavings = previousIncome - previousExpenses
  }

  // Behavior analysis
  const largestTransaction = filtered.reduce(
    (max, t) => t.amount > max.amount ? t : max,
    filtered.length > 0 ? filtered[0] : { amount: 0, category: 'N/A', date: 'N/A' }
  )

  // Daily average spending
  const daysDiff = currentPeriodStart && currentPeriodEnd
    ? Math.max(1, Math.ceil((new Date(currentPeriodEnd) - new Date(currentPeriodStart)) / (1000 * 60 * 60 * 24)))
    : 1
  
  const dailyAverage = expenses / daysDiff

  // Build summarized data structure
  const summary = {
    period: {
      current: currentPeriodStart && currentPeriodEnd ? `${currentPeriodStart} to ${currentPeriodEnd}` : 'No data',
      previous: previousPeriodStart && previousPeriodEnd ? `${previousPeriodStart} to ${previousPeriodEnd}` : 'No data',
      hasPrevious: !!(previousPeriodStart && previousPeriodEnd)
    },
    summary: {
      income,
      expenses,
      savings,
      savingsRate: income > 0 ? ((savings / income) * 100).toFixed(1) : 0
    },
    comparison: {
      previousIncome,
      previousExpenses,
      previousSavings,
      incomeChange: previousIncome > 0 ? (((income - previousIncome) / previousIncome) * 100).toFixed(1) : 0,
      expenseChange: previousExpenses > 0 ? (((expenses - previousExpenses) / previousExpenses) * 100).toFixed(1) : 0,
      savingsChange: previousSavings !== 0 ? (((savings - previousSavings) / Math.abs(previousSavings)) * 100).toFixed(1) : 0
    },
    categories: categoryBreakdown,
    topCategories: Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: expenses > 0 ? ((amount / expenses) * 100).toFixed(1) : 0
      })),
    behavior: {
      largestTransaction: {
        amount: largestTransaction.amount,
        category: largestTransaction.category,
        date: largestTransaction.date
      },
      averageDailySpending: Math.round(dailyAverage),
      totalTransactions: filtered.length
    }
  }

  return summary
}

/**
 * Create Gemini prompt with financial data
 */
function createGeminiPrompt(data) {
  const { period, summary, comparison, categories, topCategories, behavior } = data

  let prompt = `You are a professional financial advisor. Analyze the following financial data and provide structured insights.\n\n`

  prompt += `PERIOD INFORMATION:\n`
  prompt += `Current Period: ${period.current}\n`
  prompt += `Previous Period: ${period.previous}\n\n`

  prompt += `SPENDING SUMMARY:\n`
  prompt += `Total Income: ₹${Math.round(summary.income).toLocaleString()}\n`
  prompt += `Total Expenses: ₹${Math.round(summary.expenses).toLocaleString()}\n`
  prompt += `Net Savings: ₹${Math.round(summary.savings).toLocaleString()}\n`
  prompt += `Savings Rate: ${summary.savingsRate}%\n\n`

  if (period.hasPrevious) {
    prompt += `TREND COMPARISON:\n`
    prompt += `Income Change: ${comparison.incomeChange}%\n`
    prompt += `Expense Change: ${comparison.expenseChange}%\n`
    prompt += `Savings Change: ${comparison.savingsChange}%\n`
    prompt += `Previous Income: ₹${Math.round(comparison.previousIncome).toLocaleString()}\n`
    prompt += `Previous Expenses: ₹${Math.round(comparison.previousExpenses).toLocaleString()}\n`
    prompt += `Previous Savings: ₹${Math.round(comparison.previousSavings).toLocaleString()}\n\n`
  }

  prompt += `TOP SPENDING CATEGORIES:\n`
  topCategories.forEach((cat, index) => {
    prompt += `${index + 1}. ${cat.name}: ₹${Math.round(cat.amount).toLocaleString()} (${cat.percentage}%)\n`
  })
  prompt += `\n`

  prompt += `ALL CATEGORIES BREAKDOWN:\n`
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, amount]) => {
      const percentage = summary.expenses > 0 ? ((amount / summary.expenses) * 100).toFixed(1) : 0
      prompt += `${name}: ₹${Math.round(amount).toLocaleString()} (${percentage}%)\n`
    })
  prompt += `\n`

  prompt += `SPENDING BEHAVIOR:\n`
  prompt += `Largest Transaction: ₹${Math.round(behavior.largestTransaction.amount).toLocaleString()} (${behavior.largestTransaction.category} on ${behavior.largestTransaction.date})\n`
  prompt += `Average Daily Spending: ₹${behavior.averageDailySpending.toLocaleString()}\n`
  prompt += `Total Transactions: ${behavior.totalTransactions}\n\n`

  prompt += `ANALYSIS REQUIREMENTS:\n`
  prompt += `1. Spending Summary: Explain financial status using income, expenses, savings, and savings rate\n`
  prompt += `2. Trend Comparison: Compare current vs previous period with percentage changes\n`
  prompt += `3. Category Insights: Identify top spending categories and their impact\n`
  prompt += `4. Spending Behavior: Analyze patterns and habits\n`
  prompt += `5. Financial Health: Classify as Excellent (30%+ savings), Healthy (20%+), Needs Improvement (10%+), or Risky (<10%)\n`
  prompt += `6. AI Recommendations: Provide 3-5 actionable recommendations with specific amounts\n\n`

  prompt += `OUTPUT FORMAT:\n`
  prompt += `Return ONLY valid JSON with this exact structure:\n`
  prompt += JSON.stringify({
    periodInformation: {
      currentPeriod: "string",
      previousPeriod: "string",
      hasPreviousData: true
    },
    spendingSummary: {
      totalIncome: "₹0",
      totalExpenses: "₹0",
      netSavings: "₹0",
      savingsRate: "0%",
      summary: "string"
    },
    trendComparison: {
      incomeChange: "0%",
      expenseChange: "0%",
      savingsChange: "0%",
      analysis: "string"
    },
    categoryInsights: {
      topCategory: "string",
      topCategoryPercentage: "0%",
      top3Categories: ["string"],
      analysis: "string"
    },
    spendingBehavior: {
      largestTransaction: "string",
      dailyAverage: "₹0",
      totalTransactions: 0,
      analysis: "string"
    },
    financialHealth: {
      status: "Excellent|Healthy|Needs Improvement|Risky",
      score: 85,
      reasoning: "string"
    },
    recommendations: [
      {
        type: "warning|action|info|positive",
        title: "string",
        description: "string"
      }
    ]
  }, null, 2)

  return prompt
}

export async function generateAIInsights(apiKey, transactions, dateFrom, dateTo) {
  const summaryData = summarizeTransactions(transactions, dateFrom, dateTo)
  const prompt = createGeminiPrompt(summaryData)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial advisor. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API request failed: ${response.status}`)
  }

  const data = await response.json()
  const aiResponse = data.choices[0].message.content

  // Parse JSON response
  try {
    // Remove any markdown code blocks if present
    let cleanResponse = aiResponse.trim()
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    
    const insights = JSON.parse(cleanResponse)
    return insights
  } catch (parseError) {
    console.error('Failed to parse AI response:', aiResponse)
    throw new Error('Failed to parse AI response. Please try again.')
  }
}

/**
 * Generate mock insights for demo/testing (no API key needed)
 */
export function generateMockInsights(transactions, dateFrom, dateTo) {
  const summaryData = summarizeTransactions(transactions, dateFrom, dateTo)
  const { summary, comparison, topCategories, behavior } = summaryData

  return {
    periodInformation: {
      currentPeriod: summaryData.period.current,
      previousPeriod: summaryData.period.previous,
      hasPreviousData: summaryData.period.hasPrevious
    },
    spendingSummary: {
      totalIncome: `₹${Math.round(summary.income).toLocaleString()}`,
      totalExpenses: `₹${Math.round(summary.expenses).toLocaleString()}`,
      netSavings: `₹${Math.round(summary.savings).toLocaleString()}`,
      savingsRate: `${summary.savingsRate}%`,
      summary: summary.savingsRate >= 20 
        ? 'Good financial discipline with healthy savings rate.' 
        : 'Consider reducing expenses to improve savings rate.'
    },
    trendComparison: {
      incomeChange: `${comparison.incomeChange}%`,
      expenseChange: `${comparison.expenseChange}%`,
      savingsChange: `${comparison.savingsChange}%`,
      analysis: summaryData.period.hasPrevious
        ? `Expenses changed by ${comparison.expenseChange}% compared to previous period.`
        : 'No previous period data available for comparison.'
    },
    categoryInsights: {
      topCategory: topCategories[0]?.name || 'N/A',
      topCategoryPercentage: `${topCategories[0]?.percentage || 0}%`,
      top3Categories: topCategories.map(c => c.name),
      analysis: topCategories.length > 0
        ? `${topCategories[0].name} dominates spending at ${topCategories[0].percentage}% of total expenses.`
        : 'No expense data available.'
    },
    spendingBehavior: {
      largestTransaction: `₹${Math.round(behavior.largestTransaction.amount).toLocaleString()} on ${behavior.largestTransaction.category}`,
      dailyAverage: `₹${behavior.averageDailySpending.toLocaleString()}`,
      totalTransactions: behavior.totalTransactions,
      analysis: behavior.totalTransactions > 30
        ? 'High transaction volume suggests active spending. Monitor small recurring expenses.'
        : 'Transaction volume is manageable. Continue tracking expenses regularly.'
    },
    financialHealth: {
      status: summary.savingsRate >= 30 ? 'Excellent' 
        : summary.savingsRate >= 20 ? 'Healthy' 
        : summary.savingsRate >= 10 ? 'Needs Improvement' 
        : 'Risky',
      score: Math.min(100, Math.max(0, Math.round(summary.savingsRate * 2 + 50))),
      reasoning: summary.savingsRate >= 20
        ? 'Healthy savings rate indicates good financial management.'
        : 'Low savings rate needs attention. Focus on expense optimization.'
    },
    recommendations: [
      {
        type: 'action',
        title: 'Increase Savings Rate',
        description: `Current savings rate is ${summary.savingsRate}%. Target 20% or higher for better financial security.`
      },
      {
        type: topCategories[0]?.percentage > 40 ? 'warning' : 'info',
        title: `Review ${topCategories[0]?.name || 'Top'} Spending`,
        description: `${topCategories[0]?.name || 'Top category'} accounts for ${topCategories[0]?.percentage || 0}% of expenses. Consider optimizing this category.`
      },
      {
        type: 'info',
        title: 'Track Daily Expenses',
        description: `Average daily spending is ₹${behavior.averageDailySpending.toLocaleString()}. Monitor small purchases that add up over time.`
      }
    ]
  }
}
