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
    const saved = sessionStorage.getItem('theme')
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
  // Follow the device theme; the toggle only overrides it for this visit
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = readSaved() ?? (systemQuery().matches ? 'dark' : 'light')
    // Applied here, not in an effect, so the first paint already has the class
    applyTheme(initial)
    return initial
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // When the device switches theme, follow it again even if the toggle was
  // used earlier, so the site always ends up matching the device
  useEffect(() => {
    const query = systemQuery()
    const onChange = (e: MediaQueryListEvent) => {
      try { sessionStorage.removeItem('theme') } catch { /* storage unavailable */ }
      setTheme(e.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      try { sessionStorage.setItem('theme', next) } catch { /* storage unavailable */ }
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
