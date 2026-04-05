import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

function DashboardLayout({ 
  children, 
  darkMode, 
  setDarkMode, 
  currency, 
  setCurrency, 
  currencies, 
  currentCurrency,
  onLogout,
  activeSection,
  onSectionChange,
  userType,
  userEmail
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const mainRef = useRef(null)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleNavigate = (section) => {
    onSectionChange(section)
    
    // Scroll to the section
    setTimeout(() => {
      const element = document.getElementById(section)
      if (element && mainRef.current) {
        const mainContainer = mainRef.current
        
        // For dashboard section, scroll to top
        if (section === 'dashboard-section') {
          mainContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        } else {
          // For other sections, calculate position with offset
          const yOffset = -96 // Account for fixed navbar (64px) + some padding
          const elementRect = element.getBoundingClientRect()
          const y = elementRect.top + mainContainer.scrollTop - yOffset
          
          mainContainer.scrollTo({
            top: y,
            behavior: 'smooth'
          })
        }
      }
    }, 50)
  }

  return (
    <div className={`flex h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currency={currency}
        setCurrency={setCurrency}
        currencies={currencies}
        currentCurrency={currentCurrency}
        userRole={userType}
      />

      {/* Sidebar - Fixed position, doesn't scroll */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        onLogout={onLogout}
        onNavigate={handleNavigate}
        activeSection={activeSection}
        username={userEmail ? userEmail.split('@')[0] : userType}
        userType={userType}
      />

      {/* Main Content */}
      <main
        ref={mainRef}
        className="flex-1 pt-16 overflow-y-auto"
        style={{ marginLeft: sidebarOpen ? '256px' : '0' }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
