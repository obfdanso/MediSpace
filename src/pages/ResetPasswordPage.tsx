import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/AuthContext'

// Opened from the reset link in the email; the link signs the person in for this one purpose
export default function ResetPasswordPage() {
  const { isLoggedIn, isLoading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setSaving(true)
    const { error } = await updatePassword(password)
    setSaving(false)
    if (error) return setError(error)
    setDone(true)
    setTimeout(() => navigate('/chat'), 1500)
  }

  const input =
    'w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition'

  let body
  if (isLoading) {
    body = <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Checking your reset link...</p>
  } else if (!isLoggedIn) {
    body = (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This reset link has expired or was already used. Request a new one from the sign-in page.
        </p>
        <Link to="/auth" className="inline-block px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
          Back to sign in
        </Link>
      </div>
    )
  } else if (done) {
    body = <p className="text-emerald-700 dark:text-emerald-300 text-center">Your password has been changed. Taking you to your chats...</p>
  } else {
    body = (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" className={input} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm new password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Re-enter your new password" className={input} />
        </div>
        <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold transition">
          {saving ? 'Saving...' : 'Set new password'}
        </button>
      </form>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">Choose a new password</h1>
        {body}
      </div>
    </div>
  )
}
