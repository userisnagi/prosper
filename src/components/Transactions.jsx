import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { escapeCsvCell, normalizeCategoryLabel, formatInr } from "../utils/finance"
import { useToast } from "./ToastProvider"
import { getCategoryConfig } from "../utils/categories"

const MotionDiv = motion.div

const ITEMS_PER_PAGE = 10

function Transactions({ role, transactions, setTransactions, currency = "INR" }) {
  const toast = useToast()
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [currentPage, setCurrentPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState("")

  const [date, setDate] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("Expense")

  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  const dateInputRef = useRef(null)
  const sortMenuRef = useRef(null)
  const exportMenuRef = useRef(null)

  const isAdmin = role === "admin"

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setSortMenuOpen(false)
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSortMenuOpen(false)
        setExportMenuOpen(false)
        setModalOpen(false)
        setEditingId(null)
        setFormError("")
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  // Focus date input when modal opens
  useEffect(() => {
    if (!modalOpen) return
    const id = requestAnimationFrame(() => dateInputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [modalOpen])

  const openAdd = () => {
    setEditingId(null)
    setFormError("")
    setDate("")
    setCategory("")
    setAmount("")
    setType("Expense")
    setModalOpen(true)
  }

  const openEdit = (t) => {
    setEditingId(t.id)
    setFormError("")
    setDate(t.date)
    setCategory(t.category)
    setAmount(String(t.amount))
    setType(t.type)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setFormError("")
  }

  const submit = () => {
    setFormError("")
    if (!date || !category.trim() || amount === "") {
      setFormError("Please fill date, category, and amount.")
      return
    }
    const num = Number(amount)
    if (Number.isNaN(num) || num < 0) {
      setFormError("Amount must be a valid non-negative number.")
      return
    }

    const cat = normalizeCategoryLabel(category)

    if (editingId != null) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...t, date, category: cat, type, amount: num } : t
        )
      )
      toast.success("Transaction updated successfully!")
    } else {
      setTransactions((prev) => [
        ...prev,
        { id: Date.now(), date, category: cat, type, amount: num },
      ])
      toast.success("Transaction added successfully!")
    }
    closeModal()
  }

  const remove = (id) => {
    if (!window.confirm("Delete this transaction?")) return
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    toast.info("Transaction deleted")
  }

  // Filter and sort transactions
  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.category.toLowerCase().includes(search.toLowerCase().trim()))
      .filter((t) => (filterType === "all" ? true : t.type === filterType))
  }, [transactions, search, filterType])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return a.date.localeCompare(b.date)
        case "date-desc":
          return b.date.localeCompare(a.date)
        case "amount-asc":
          return a.amount - b.amount
        case "amount-desc":
          return b.amount - a.amount
        default:
          return 0
      }
    })
  }, [filtered, sortBy])

  // Pagination
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sorted.slice(start, start + ITEMS_PER_PAGE)
  }, [sorted, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterType, sortBy])

  const exportCSV = () => {
    const header = ["Date", "Category", "Type", "Amount"].map(escapeCsvCell).join(",")
    const rows = filtered.map((t) =>
      [t.date, t.category, t.type, t.amount].map(escapeCsvCell).join(",")
    )
    const csvContent = [header, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.csv"
    a.click()
    URL.revokeObjectURL(url)
    setExportMenuOpen(false)
    toast.success("CSV exported successfully!")
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.json"
    a.click()
    URL.revokeObjectURL(url)
    setExportMenuOpen(false)
    toast.success("JSON exported successfully!")
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="rounded-xl bg-white shadow-sm dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-visible"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transactions</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} of {transactions.length} transactions
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Transaction
              </button>
            )}
            
            {/* Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setExportMenuOpen((o) => !o)}
                aria-expanded={exportMenuOpen}
                aria-haspopup="listbox"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
                <svg
                  className={`h-4 w-4 transition-transform ${exportMenuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {exportMenuOpen && (
                  <MotionDiv
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-[60] mt-2 min-w-[200px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-xl dark:border-gray-600 dark:bg-gray-900"
                  >
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-800 dark:focus:bg-gray-800"
                      onClick={exportCSV}
                    >
                      <span className="block font-medium text-gray-900 dark:text-white">Export as CSV</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        Spreadsheet format
                      </span>
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700" />
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-800 dark:focus:bg-gray-800"
                      onClick={exportJSON}
                    >
                      <span className="block font-medium text-gray-900 dark:text-white">Export as JSON</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        Developer format
                      </span>
                    </button>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 overflow-visible">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search category..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search by category"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setSortMenuOpen((o) => !o)}
              aria-expanded={sortMenuOpen}
              className="inline-flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              <span className="truncate">
                {sortBy === "date-desc" ? "Newest first" :
                 sortBy === "date-asc" ? "Oldest first" :
                 sortBy === "amount-desc" ? "Highest amount" :
                 "Lowest amount"}
              </span>
              <svg
                className={`h-4 w-4 shrink-0 ml-2 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <AnimatePresence>
              {sortMenuOpen && (
                <MotionDiv
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 z-[60] mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-xl dark:border-gray-600 dark:bg-gray-900"
                >
                  {[
                    { value: "date-desc", label: "Newest first" },
                    { value: "date-asc", label: "Oldest first" },
                    { value: "amount-desc", label: "Highest amount" },
                    { value: "amount-asc", label: "Lowest amount" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-800 dark:focus:bg-gray-800 ${
                        sortBy === option.value ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : ""
                      }`}
                      onClick={() => {
                        setSortBy(option.value)
                        setSortMenuOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th scope="col" className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                Date
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                Category
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                Type
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                Amount
              </th>
              {isAdmin && (
                <th scope="col" className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="px-4 py-12 text-center"
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    No transactions match your filters
                  </p>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-100 hover:bg-indigo-50/50 dark:border-gray-800 dark:hover:bg-indigo-900/20 transition-all duration-200 hover:shadow-sm cursor-pointer group"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryConfig(t.category).color}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.type === "Income" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {formatInr(t.amount, currency)}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <button
                          type="button"
                          onClick={() => remove(t.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} of {sorted.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal()
            }}
          >
            <MotionDiv
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="txn-modal-title"
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 id="txn-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingId != null ? "Edit Transaction" : "Add Transaction"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 dark:bg-red-900/30 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {formError}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Date
                  </label>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Transaction date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Food, Salary, Transport"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  {editingId != null ? "Save Changes" : "Add Transaction"}
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  )
}

export default Transactions
