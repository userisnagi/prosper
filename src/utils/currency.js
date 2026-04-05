const API_BASE = 'https://api.exchangerate-api.com/v4/latest'

const CACHE_KEY = 'prosper_exchange_rates'
const CACHE_TIMESTAMP_KEY = 'prosper_exchange_rates_timestamp'
const CACHE_DURATION = 60 * 60 * 1000

export async function fetchExchangeRates(from = 'USD') {
  try {
    const cached = getCachedRates(from)
    if (cached) {
      return cached
    }

    const response = await fetch(`${API_BASE}/${from}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const rates = data.rates

    cacheRates(from, rates)

    return rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return getCachedRates(from, true) || {}
  }
}

export async function convertCurrency(amount, fromCurrency, toCurrency, rates = null) {
  if (fromCurrency === toCurrency) return amount

  if (!rates) {
    rates = await fetchExchangeRates(fromCurrency)
  }

  const rate = rates[toCurrency]
  if (!rate) {
    console.error(`Exchange rate not found for ${toCurrency}`)
    return amount
  }

  return amount * rate
}

function getCachedRates(from, ignoreExpiry = false) {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    const cachedData = localStorage.getItem(CACHE_KEY)

    if (!timestamp || !cachedData) return null

    const parsed = JSON.parse(cachedData)
    const cacheAge = Date.now() - parseInt(timestamp)

    if (ignoreExpiry || cacheAge < CACHE_DURATION) {
      return parsed[from] || null
    }

    return null
  } catch {
    return null
  }
}

function cacheRates(from, rates) {
  try {
    const existingData = localStorage.getItem(CACHE_KEY)
    const allRates = existingData ? JSON.parse(existingData) : {}
    
    allRates[from] = rates
    localStorage.setItem(CACHE_KEY, JSON.stringify(allRates))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    // Silently fail if localStorage is full
  }
}

export function clearRateCache() {
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_TIMESTAMP_KEY)
}

export function formatCurrencyWithSymbol(amount, currency) {
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹',
    JPY: '¥', AUD: 'A$', CAD: 'C$', CHF: 'CHF',
    CNY: '¥', SGD: 'S$', HKD: 'HK$', NZD: 'NZ$',
    SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł',
    CZK: 'Kč', HUF: 'Ft', RON: 'lei', ISK: 'kr',
    BRL: 'R$', MXN: 'MX$', ZAR: 'R', TRY: '₺',
    ILS: '₪', KRW: '₩', THB: '฿', PHP: '₱',
    MYR: 'RM', IDR: 'Rp'
  }

  const symbol = symbols[currency] || currency
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return `${symbol}${formatted}`
}
