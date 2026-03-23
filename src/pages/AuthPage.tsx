import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/components/ThemeProvider'

type Tab = 'login' | 'signup'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const { theme, toggleTheme } = useTheme()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Signup form state
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
    try {
      // TODO: Replace with backend API call
      // const res = await fetch('https://your-backend.com/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      // })
      // const data = await res.json()
      // if (!res.ok) throw new Error(data.message)
      // localStorage.setItem('token', data.token)
      // navigate('/chat')
      console.log('Login:', { email: loginEmail, password: loginPassword })
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
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
    try {
      // TODO: Replace with backend API call
      // const res = await fetch('https://your-backend.com/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
      // })
      // const data = await res.json()
      // if (!res.ok) throw new Error(data.message)
      console.log('Signup:', { name: signupName, email: signupEmail })
    } catch (err: any) {
      setSignupError(err.message || 'Signup failed. Please try again.')
    } finally {
      setSignupLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    // TODO: Replace with backend Google OAuth
    // window.location.href = 'https://your-backend.com/api/auth/google'
    console.log('Google sign-in clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 font-lobster">
            MediCare AI
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => { setActiveTab('login'); setLoginError('') }}
                className={`flex-1 py-4 text-sm font-semibold transition ${
                  activeTab === 'login'
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setSignupError('') }}
                className={`flex-1 py-4 text-sm font-semibold transition ${
                  activeTab === 'signup'
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                {activeTab === 'login' ? (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your MediCare AI account</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start your health journey today</p>
                  </>
                )}
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition mb-6 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500">or continue with email</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* LOGIN FORM */}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                      <button type="button" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition pr-11"
                      />
                      <button type="button" onClick={() => setShowLoginPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showLoginPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl text-sm font-semibold transition shadow-lg disabled:cursor-not-allowed mt-2"
                  >
                    {loginLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : 'Sign In'}
                  </button>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setActiveTab('signup')} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                      Sign up
                    </button>
                  </p>
                </form>
              )}

              {/* SIGNUP FORM */}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition pr-11"
                      />
                      <button type="button" onClick={() => setShowSignupPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showSignupPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupConfirm}
                        onChange={e => setSignupConfirm(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition pr-11"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By signing up, you agree to our{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">Privacy Policy</span>.
                  </p>
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl text-sm font-semibold transition shadow-lg disabled:cursor-not-allowed mt-2"
                  >
                    {signupLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : 'Create Account'}
                  </button>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setActiveTab('login')} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                      Log in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
            🔒 HIPAA compliant · 256-bit encryption · Your data is safe
          </p>
        </div>
      </div>
    </div>
  )
}