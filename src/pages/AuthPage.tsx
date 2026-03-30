import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthContext'
import { ShieldCheck, Bot, FlaskConical, ClipboardList, Lock, Sun, Moon, ArrowRight } from 'lucide-react'

type Tab = 'login' | 'signup'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const { theme, toggleTheme } = useTheme()
  const { signIn, signUp, profile } = useAuth()
  const navigate = useNavigate()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields.')
      return
    }
    setLoginLoading(true)
    const { error } = await signIn(loginEmail, loginPassword)
    setLoginLoading(false)
    if (error) {
      setLoginError(error)
      return
    }
    // Small delay to let profile state settle
    setTimeout(() => {
      navigate('/')
    }, 100)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')
    if (!signupName || !signupEmail || !signupPassword || !signupConfirm) {
      setSignupError('Please fill in all fields.')
      return
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.')
      return
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.')
      return
    }
    setSignupLoading(true)
    const { error } = await signUp(signupEmail, signupPassword, signupName)
    setSignupLoading(false)
    if (error) {
      setSignupError(error)
      return
    }
    // Redirect immediately to the health profile page
    setTimeout(() => {
      navigate('/onboarding')
    }, 100)
  }



  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-white text-xl font-bold font-lobster">MediCare AI</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">

        {/* Left: Branding */}
        <div className="hidden lg:flex flex-col flex-1 text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 w-fit">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">AI-Powered Health Assistant</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Your health journey <br /> starts here
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Join thousands of users who trust MediCare AI for smarter, safer health decisions.
          </p>

          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: 'HIPAA Compliant and Secure' },
              { icon: Bot, text: 'AI-Powered Medical Insights' },
              { icon: FlaskConical, text: 'Drug Interaction Checker' },
              { icon: ClipboardList, text: 'Symptom Analysis' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 hover:bg-white/15 transition"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          <p className="mt-10 text-white/50 text-sm italic">
            "The future of personal healthcare is intelligent, accessible, and always available."
          </p>
        </div>

        {/* Right: Auth card */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-black/20 border border-white/50 dark:border-gray-700 overflow-hidden">

            <div className="px-8 pt-8 pb-0">
              {activeTab === 'login' ? (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sign in to continue to MediCare AI</p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Start your health journey for free</p>
                </>
              )}

              <div className="relative flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-6 border border-gray-200 dark:border-gray-700">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg transition-all duration-300 ease-in-out ${
                    activeTab === 'login' ? 'left-1' : 'left-[calc(50%+3px)]'
                  }`}
                />
                <button
                  onClick={() => { setActiveTab('login'); setLoginError('') }}
                  className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                    activeTab === 'login' ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => { setActiveTab('signup'); setSignupError('') }}
                  className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                    activeTab === 'signup' ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div className="px-8 pb-8">

              {/* Login form */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                      <button type="button" onClick={() => setShowLoginPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showLoginPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-emerald-500/30 hover:shadow-xl disabled:cursor-not-allowed mt-1"
                  >
                    {loginLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setActiveTab('signup')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                      Sign up free
                    </button>
                  </p>
                </form>
              )}

              {/* Signup form */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupError && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {signupError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={signupName}
                        onChange={e => setSignupName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                      <button type="button" onClick={() => setShowSignupPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showSignupPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm password</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupConfirm}
                        onChange={e => setSignupConfirm(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showConfirmPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By signing up, you agree to our{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline font-medium">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline font-medium">Privacy Policy</span>.
                  </p>

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-emerald-500/30 hover:shadow-xl disabled:cursor-not-allowed mt-1"
                  >
                    {signupLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Create Account <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setActiveTab('login')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                      Log in
                    </button>
                  </p>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  HIPAA Compliant
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  256-bit Encrypted
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <Bot className="w-3.5 h-3.5 text-emerald-500" />
                  24/7 Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
