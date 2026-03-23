'use client'

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from './ThemeProvider'
import { useState, useEffect } from 'react'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleNavClick = (href: string, sectionId: string) => {
    if (isHomePage) {
      scrollToSection(sectionId)
    } else {
      navigate("/")
      // Wait for the home page to mount, then scroll.
      setTimeout(() => scrollToSection(sectionId), 50)
    }
  }

  const navLinks = [
    { href: '/', sectionId: 'home', label: 'Home' },
    { href: '/#features', sectionId: 'features', label: 'Features' },
    { href: '/#pricing', sectionId: 'pricing', label: 'Pricing' },
  ]

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'w-auto' 
        : 'w-[calc(100%-2rem)] max-w-7xl'
    }`}>
      <div className={`bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg transition-all duration-300 ${
        isScrolled 
          ? 'rounded-full px-4 py-2' 
          : 'rounded-2xl px-6 py-3'
      }`}>
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            {!isScrolled && (
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 font-lobster">
                MediCare AI
              </span>
            )}
          </Link>
          
          {/* Navigation Links - Hidden when scrolled */}
          {!isScrolled && (
            <ul className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <li key={link.sectionId}>
                  <button 
                    onClick={() => handleNavClick(link.href, link.sectionId)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle theme"
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

            {/* Start Chat Button */}
            <Link 
              to="/auth" 
              className={`bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition shadow-lg hover:shadow-xl ${
                isScrolled ? 'px-4 py-2 text-sm' : 'px-5 py-2 text-sm'
              }`}
            >
              {isScrolled ? 'Chat' : 'Start Chat'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
