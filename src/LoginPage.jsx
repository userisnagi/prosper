import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from 'lucide-react'

function LoginPage({ onLogin, darkMode, setDarkMode }) {
  const [showDemoCredentials, setShowDemoCredentials] = useState(true)
  const [authMode, setAuthMode] = useState("social") // social, login, signup, forgot
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("viewer")
  const [isAnimating, setIsAnimating] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showSocialConfirm, setShowSocialConfirm] = useState(null) // null, 'google', 'facebook'

  // Check for existing session
  useEffect(() => {
    const savedSession = localStorage.getItem("prosper_session")
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        onLogin(session.role, session.userType)
      } catch {
        localStorage.removeItem("prosper_session")
      }
    }
  }, [onLogin])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (authMode === "login" || authMode === "signup") {
      if (!email) {
        newErrors.email = "Email is required"
      } else if (!validateEmail(email)) {
        newErrors.email = "Please enter a valid email"
      }
      
      if (!password) {
        newErrors.password = "Password is required"
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      }
    }
    
    if (authMode === "signup") {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }
    
    if (authMode === "forgot" && otpSent) {
      if (!otp) {
        newErrors.otp = "OTP is required"
      } else if (otp.length !== 6) {
        newErrors.otp = "OTP must be 6 digits"
      }
      
      if (!newPassword) {
        newErrors.newPassword = "New password is required"
      } else if (newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Simulate backend authentication
    if (authMode === "login") {
      if (email.includes("admin")) {
        handleLogin("admin", "email")
      } else {
        handleLogin("viewer", "email")
      }
    } else if (authMode === "signup") {
      alert("✅ Account created successfully! Please login.")
      setAuthMode("login")
      setPassword("")
      setConfirmPassword("")
    } else if (authMode === "forgot" && !otpSent) {
      setOtpSent(true)
      alert("📧 OTP sent to your email! (Use any 6-digit code for demo)")
    } else if (authMode === "forgot" && otpSent) {
      alert("✅ Password reset successfully! Please login.")
      setAuthMode("login")
      setOtp("")
      setNewPassword("")
      setOtpSent(false)
    }
  }

  const handleLogin = (role, userType) => {
    setIsAnimating(true)
    setTimeout(() => {
      const session = { role, userType, loginTime: new Date().toISOString(), email }
      localStorage.setItem("prosper_session", JSON.stringify(session))
      
      // Use replaceState to prevent back button from going to login
      window.history.replaceState(null, '', window.location.pathname)
      
      onLogin(role, userType)
    }, 400)
  }

  return (
    <AnimatePresence mode="wait">
      {!isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 flex items-center justify-center p-4 relative"
        >
          {/* Dark Mode Toggle - Top Right */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-300"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 90, scale: 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <Moon className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: -90, scale: 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <Sun className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Social Login Confirmation Modal */}
          <AnimatePresence>
            {showSocialConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowSocialConfirm(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      showSocialConfirm === "google" ? "bg-blue-50" : "bg-blue-100"
                    }`}>
                      {showSocialConfirm === "google" ? (
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Continue with {showSocialConfirm === "google" ? "Google" : "Facebook"}?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      You'll be logged in as Admin with full access to Prosper dashboard.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          handleLogin("admin", showSocialConfirm)
                          setShowSocialConfirm(null)
                        }}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                          showSocialConfirm === "google"
                            ? "bg-gradient-to-r from-blue-500 to-red-500 hover:opacity-90"
                            : "bg-[#1877F2] hover:bg-[#166FE5]"
                        }`}
                      >
                        Yes, Continue
                      </button>
                      <button
                        onClick={() => setShowSocialConfirm(null)}
                        className="w-full py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative w-full max-w-md"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-2xl mb-4"
              >
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 rounded-xl rotate-6"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-1">Prosper</h1>
              <p className="text-white/80 text-sm">Your Financial Command Center</p>
            </div>

            <motion.div
              key={authMode}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
            >
              {/* Social Login */}
              {authMode === "social" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    Welcome Back
                  </h2>

                  {/* Demo Access Buttons */}
                  <div className="mb-6 space-y-2">
                    <button 
                      onClick={() => handleLogin("admin", "demo-admin")}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left"
                    >
                      <span className="text-lg">⚙️</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Admin Access</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Full control - Add, edit, delete transactions</div>
                      </div>
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleLogin("viewer", "demo-viewer")}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all text-left"
                    >
                      <span className="text-lg">👁️</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Viewer Access</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Read-only - View all data, cannot edit</div>
                      </div>
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleLogin("guest", "guest")}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                    >
                      <span className="text-lg">👤</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Guest Mode</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Explore without account - session only</div>
                      </div>
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">or sign in with</span></div>
                  </div>

                  {/* Social Buttons */}
                  <div className="space-y-3 mb-6">
                    <button 
                      onClick={() => setShowSocialConfirm("google")} 
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-xl transition-all group"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="flex-1 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Continue with Google</span>
                    </button>

                    <button 
                      onClick={() => setShowSocialConfirm("facebook")}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="flex-1 text-left text-sm font-semibold">Continue with Facebook</span>
                    </button>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">or continue with email</span></div>
                  </div>

                  <button onClick={() => setAuthMode("login")} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all mb-4">
                    Sign In with Email
                  </button>

                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <button onClick={() => setAuthMode("signup")} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Sign Up</button>
                  </p>
                </div>
              )}

              {/* Email/Password Login */}
              {authMode === "login" && (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Sign In</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.email ? "border-red-500" : "border-gray-200"}`} placeholder="you@example.com" />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.password ? "border-red-500" : "border-gray-200"}`} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /><span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span></label>
                      <button type="button" onClick={() => setAuthMode("forgot")} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</button>
                    </div>

                    <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">Sign In</button>
                  </div>

                  <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("signup")} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign Up</button>
                  </p>

                  <button type="button" onClick={() => setAuthMode("social")} className="mt-3 w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">← Back to social login</button>
                </form>
              )}

              {/* Sign Up */}
              {authMode === "signup" && (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Create Account</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.email ? "border-red-500" : "border-gray-200"}`} placeholder="you@example.com" />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.password ? "border-red-500" : "border-gray-200"}`} placeholder="••••••••" />
                      {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.confirmPassword ? "border-red-500" : "border-gray-200"}`} placeholder="••••••••" />
                      {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">Create Account</button>
                  </div>

                  <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("login")} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign In</button>
                  </p>

                  <button type="button" onClick={() => setAuthMode("social")} className="mt-3 w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">← Back to social login</button>
                </form>
              )}

              {/* Forgot Password */}
              {authMode === "forgot" && (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Reset Password</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">Enter your email to receive a reset OTP</p>
                  
                  <div className="space-y-4">
                    {!otpSent ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="you@example.com" />
                        <button type="submit" className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">Send OTP</button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OTP (6 digits)</label>
                          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.otp ? "border-red-500" : "border-gray-200"}`} placeholder="123456" />
                          {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${errors.newPassword ? "border-red-500" : "border-gray-200"}`} placeholder="••••••••" />
                          {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
                        </div>

                        <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">Reset Password</button>
                      </>
                    )}
                  </div>

                  <button type="button" onClick={() => { setAuthMode("login"); setOtpSent(false); }} className="mt-4 w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">← Back to login</button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoginPage
