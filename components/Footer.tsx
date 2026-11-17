'use client'

import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100 font-lobster">
                MediSpace AI
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your intelligent health companion, available 24/7 to help you make informed decisions about your wellbeing.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {[{ label: 'Features', to: '/features' }, { label: 'Services', to: '/services' }, { label: 'AI Chat', to: '/chat' }].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {[{ label: 'About', to: '/about' }, { label: 'Contact', to: '/contact' }].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {[{ label: 'FAQ', to: '/faq' }, { label: 'Safety & Privacy', to: '/safety' }].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2026 MediSpace AI. All rights reserved.
            </p>
            <div className="flex gap-6">
              {[{ label: 'Safety & Privacy', to: '/safety' }].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Compliance Badges */}
          <div className="flex justify-center gap-6 mt-6 flex-wrap">
            {['256-bit Encryption', 'Private by Design', 'Available 24/7'].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 hover:scale-105 transition-transform duration-200"
              >
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animated gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-gradient-x"></div>
    </footer>
  )
}
