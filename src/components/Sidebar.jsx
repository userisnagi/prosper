import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

function Sidebar({ sidebarOpen, toggleSidebar, darkMode, onLogout, onNavigate, activeSection, username = 'User', userType = 'admin', userEmail }) {
  const [togglePosition, setTogglePosition] = useState(50) // Percentage from top
  const [isDragging, setIsDragging] = useState(false)

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, section: 'dashboard-section' },
    { name: 'Currency Convert', icon: Wallet, section: 'currency-section' },
    { name: 'Transactions', icon: ArrowLeftRight, section: 'transactions-section' },
    { name: 'Analytics', icon: BarChart3, section: 'insights-section' },
    { name: 'Settings', icon: Settings, section: 'settings-section' },
  ]

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      
      e.preventDefault()
      
      // Calculate position as percentage of viewport height
      const newPosition = (e.clientY / window.innerHeight) * 100
      // Clamp between 10% and 90%
      const clampedPosition = Math.max(10, Math.min(90, newPosition))
      setTogglePosition(clampedPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      // Use capture phase for smoother tracking
      window.addEventListener('mousemove', handleMouseMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUp)
      // Prevent text selection during drag
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      // Restore cursor and text selection
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging])

  // Touch support for mobile
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!isDragging) return
      
      e.preventDefault()
      
      // Calculate position as percentage of viewport height
      const touch = e.touches[0]
      const newPosition = (touch.clientY / window.innerHeight) * 100
      // Clamp between 10% and 90%
      const clampedPosition = Math.max(10, Math.min(90, newPosition))
      setTogglePosition(clampedPosition)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging])

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] z-30 border-r shadow-lg overflow-hidden ${
          darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
        }`}
      >
        <nav className="flex flex-col h-full py-4 px-3">
          <div className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.section
              
              return (
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.section)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? darkMode
                        ? 'bg-emerald-600/40 text-emerald-200 shadow-lg'
                        : 'bg-emerald-500/25 text-emerald-800 shadow-lg'
                      : darkMode
                        ? 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive
                        ? darkMode
                          ? 'text-emerald-200'
                          : 'text-emerald-700'
                        : darkMode
                          ? 'text-slate-400 group-hover:text-white'
                          : 'text-gray-500 group-hover:text-gray-900'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-sm whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                </button>
              )
            })}
          </div>

          {/* User Profile Section */}
          <div className={`pt-4 mt-4 border-t ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
              darkMode ? 'bg-slate-800/50' : 'bg-gray-50'
            }`}>
              <div className={`p-2 rounded-full ${
                darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'
              }`}>
                <User className={`w-5 h-5 ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate capitalize ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {userType}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4 mt-2">
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                darkMode
                  ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                  : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm whitespace-nowrap">Logout</span>
            </button>
          </div>
        </nav>
      </motion.aside>

      {/* Draggable Toggle Button - Simple Chevron Arrow */}
      <motion.button
        onClick={toggleSidebar}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
        className={`fixed z-40 w-6 h-12 rounded-md shadow-md flex items-center justify-center transition-all ${
          isDragging 
            ? 'duration-0 scale-110' 
            : 'duration-200 hover:scale-110'
        } ${
          darkMode
            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        } ${isDragging ? 'shadow-lg' : ''}`}
        style={{ 
          left: sidebarOpen ? '244px' : '0px',
          top: `${togglePosition}%`,
          transform: 'translateY(-50%)',
          transition: isDragging ? 'none' : 'all 0.2s'
        }}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4" strokeWidth={3} />
        ) : (
          <ChevronRight className="w-4 h-4" strokeWidth={3} />
        )}
      </motion.button>
    </>
  )
}

export default Sidebar
