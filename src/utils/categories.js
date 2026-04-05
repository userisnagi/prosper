// Category configuration with icons, colors, and labels
export const CATEGORY_CONFIG = {
  // Food & Dining
  'food': { icon: '🍔', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200', label: 'Food & Dining' },
  'groceries': { icon: '🛒', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', label: 'Groceries' },
  'restaurant': { icon: '🍽️', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200', label: 'Restaurant' },
  
  // Transportation
  'transport': { icon: '🚗', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', label: 'Transportation' },
  'fuel': { icon: '⛽', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200', label: 'Fuel' },
  'uber': { icon: '🚕', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200', label: 'Ride Share' },
  
  // Income
  'salary': { icon: '💼', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200', label: 'Salary' },
  'freelance': { icon: '💻', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200', label: 'Freelance' },
  'investment': { icon: '📈', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200', label: 'Investment' },
  
  // Entertainment
  'entertainment': { icon: '🎮', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200', label: 'Entertainment' },
  'movies': { icon: '🎬', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200', label: 'Movies' },
  'shopping': { icon: '🛍️', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200', label: 'Shopping' },
  
  // Bills & Utilities
  'bills': { icon: '📄', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200', label: 'Bills & Utilities' },
  'electricity': { icon: '💡', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200', label: 'Electricity' },
  'internet': { icon: '🌐', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200', label: 'Internet' },
  'rent': { icon: '🏠', color: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-200', label: 'Rent' },
  
  // Health & Wellness
  'health': { icon: '🏥', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200', label: 'Healthcare' },
  'gym': { icon: '🏋️', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200', label: 'Fitness' },
  
  // Education
  'education': { icon: '📚', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200', label: 'Education' },
  'courses': { icon: '🎓', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', label: 'Courses' },
  
  // Default
  'other': { icon: '📌', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200', label: 'Other' },
}

// Helper function to get category config
export function getCategoryConfig(category) {
  if (!category) return CATEGORY_CONFIG['other']
  const normalizedCategory = category.toLowerCase().trim()
  
  // Direct match
  if (CATEGORY_CONFIG[normalizedCategory]) {
    return CATEGORY_CONFIG[normalizedCategory]
  }
  
  // Partial match
  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return config
    }
  }
  
  // Default
  return CATEGORY_CONFIG['other']
}

// Get all unique categories from transactions
export function getCategoriesFromTransactions(transactions) {
  const categories = [...new Set(transactions.map(t => t.category))]
  return categories.map(cat => ({
    name: cat,
    ...getCategoryConfig(cat)
  }))
}
