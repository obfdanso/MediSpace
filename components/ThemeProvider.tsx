import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function readSaved(): Theme | null {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* storage unavailable */ }
  return null
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Follow the system theme unless the user has picked one with the toggle
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = readSaved() ?? (systemQuery().matches ? 'dark' : 'light')
    // Applied here, not in an effect, so the first paint already has the class
    applyTheme(initial)
    return initial
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Track OS theme changes while there is no manual override
  useEffect(() => {
    const query = systemQuery()
    const onChange = (e: MediaQueryListEvent) => {
      if (!readSaved()) setTheme(e.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      try { localStorage.setItem('theme', next) } catch { /* storage unavailable */ }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
