import { Component, type ReactNode } from 'react'

// Shows a friendly screen instead of a blank page when something crashes
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('MediSpace crashed:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Something went wrong</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sorry, this page ran into a problem. Reloading usually fixes it. Your saved chats are safe.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              Reload page
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
