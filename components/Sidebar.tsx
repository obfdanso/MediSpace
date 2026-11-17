import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, CreditCard, Zap, LogOut, Home, Sun, Moon, ChevronsUpDown, LogIn } from 'lucide-react'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeProvider'
import { getConversations, deleteConversation, isPremium, type Conversation } from '@/lib/supabase'

interface ChatSidebarProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  refreshKey?: number
}

// Plain panel outline used for both opening and closing, like Claude's desktop app
function SidebarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9.5 4v16" />
    </svg>
  )
}

// Rounded speech bubble with a curled tail, in the style of iMessage
function ChatBubbleIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3.5c-5.25 0-9.5 3.47-9.5 7.75 0 2.33 1.26 4.42 3.25 5.84-.18 1.3-.83 2.5-1.86 3.4 1.98.02 3.8-.66 5.1-1.8.95.2 1.95.31 3.01.31 5.25 0 9.5-3.47 9.5-7.75S17.25 3.5 12 3.5z" />
    </svg>
  )
}

const GROUPS = ['Today', 'Yesterday', 'Previous 7 days', 'Older'] as const

function groupOf(dateStr: string): typeof GROUPS[number] {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfThatDay = new Date(dateStr)
  startOfThatDay.setHours(0, 0, 0, 0)
  // Rounded so a 23 or 25 hour day around a clock change still counts as one day
  const diffDays = Math.round((startOfToday.getTime() - startOfThatDay.getTime()) / 86_400_000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'Previous 7 days'
  return 'Older'
}

export default function ChatSidebar({
  activeConversationId,
  onSelectConversation,
  onNewChat,
  refreshKey,
}: ChatSidebarProps) {
  const { isLoggedIn, user, profile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return false
    try {
      const saved = localStorage.getItem('sidebar-open')
      return saved !== null ? saved === 'true' : true
    } catch { return true }
  })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      try { localStorage.setItem('sidebar-open', String(isOpen)) } catch { /* storage unavailable */ }
    }
  }, [isOpen, isMobile])

  // Close the account menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    if (isLoggedIn && user) {
      loadConversations()
    } else {
      setConversations([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.id, refreshKey])

  const loadConversations = async () => {
    if (!user) return
    const convs = await getConversations(user.id)
    setConversations(convs)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this chat?')) return
    await deleteConversation(id)
    await loadConversations()
    if (activeConversationId === id) onNewChat()
  }

  const startNewChat = () => {
    onNewChat()
    if (isMobile) setIsOpen(false)
  }

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const grouped = GROUPS
    .map(label => ({ label, items: filtered.filter(c => groupOf(c.updated_at) === label) }))
    .filter(g => g.items.length > 0)

  const displayName = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Guest'
  const initials = displayName.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const isPro = isPremium(profile)

  const iconBtn = 'p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 transition flex-shrink-0'
  const menuItem = 'w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 transition text-left'

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile open button, shown when the sidebar is hidden on phones */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open sidebar"
          className="fixed top-2.5 left-3 z-40 p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition"
        >
          <SidebarIcon size={20} />
        </button>
      )}

      <aside
        className={`h-full bg-stone-100 dark:bg-stone-950 border-r border-stone-200/80 dark:border-stone-800/80 transition-[width] duration-200 flex flex-col flex-shrink-0 ${
          isMobile
            ? isOpen ? 'fixed top-0 left-0 z-50 w-72 shadow-2xl' : 'hidden'
            : isOpen ? 'w-64' : 'w-14'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center h-14 px-2 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen && (
            <button onClick={() => navigate('/')} className="px-2 font-pt-serif text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
              MediSpace
            </button>
          )}
          <button
            onClick={() => setIsOpen(o => !o)}
            title={isOpen ? 'Close sidebar' : 'Open sidebar'}
            className={iconBtn}
          >
            <SidebarIcon size={20} />
          </button>
        </div>

        {/* New chat */}
        <div className="px-2">
          <button
            onClick={startNewChat}
            title="New chat"
            className={`w-full flex items-center gap-2.5 rounded-lg p-1.5 text-sm font-medium text-stone-800 dark:text-stone-100 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition ${isOpen ? '' : 'justify-center'}`}
          >
            <span className="h-7 w-7 flex items-center justify-center rounded-full bg-emerald-600 text-white flex-shrink-0 shadow-sm">
              <Plus size={16} strokeWidth={2.5} />
            </span>
            {isOpen && 'New chat'}
          </button>
        </div>

        {/* Search */}
        {isOpen && isLoggedIn && (
          <div className="px-2 mt-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chats"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-700 transition"
              />
            </div>
          </div>
        )}

        {/* Conversations */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {!isOpen ? null : !isLoggedIn ? (
            <div className="mx-1 mt-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-4 text-center">
              <ChatBubbleIcon size={24} className="mx-auto mb-2 text-stone-400" />
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
                Sign in to save and revisit your chats
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-full transition"
              >
                Sign in
              </button>
            </div>
          ) : grouped.length === 0 ? (
            <p className="px-3 py-2 text-xs text-stone-400 dark:text-stone-500">
              {searchQuery ? 'No chats match your search' : 'No chats yet'}
            </p>
          ) : (
            grouped.map(group => (
              <div key={group.label} className="mb-4">
                <p className="px-3 pb-1 text-xs font-medium text-stone-400 dark:text-stone-500">{group.label}</p>
                {group.items.map(conv => {
                  const active = activeConversationId === conv.id
                  return (
                    <div
                      key={conv.id}
                      onClick={() => { onSelectConversation(conv.id); if (isMobile) setIsOpen(false) }}
                      title={conv.title}
                      className={`group relative flex items-center rounded-lg px-3 py-1.5 cursor-pointer text-sm transition ${
                        active
                          ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    >
                      <span className="flex-1 truncate">{conv.title}</span>
                      <button
                        onClick={e => handleDelete(conv.id, e)}
                        title="Delete chat"
                        className="ml-1 p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </nav>

        {/* Account */}
        <div ref={menuRef} className="relative p-2 border-t border-stone-200/80 dark:border-stone-800/80">
          {menuOpen && (
            <div className={`absolute bottom-full mb-2 z-50 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-1.5 shadow-xl ${isOpen ? 'left-2 right-2' : 'left-2 w-56'}`}>
              {isLoggedIn && user?.email && (
                <p className="px-3 py-2 text-xs text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
              )}
              <button onClick={toggleTheme} className={menuItem}>
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              {isLoggedIn && (
                <button onClick={() => navigate('/billing')} className={menuItem}>
                  <CreditCard size={15} />
                  Billing & plan
                  {isPro && (
                    <span className="ml-auto text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Zap size={10} /> Pro
                    </span>
                  )}
                </button>
              )}
              <button onClick={() => navigate('/')} className={menuItem}>
                <Home size={15} />
                Back to home
              </button>
              <div className="my-1 h-px bg-stone-200 dark:bg-stone-700" />
              {isLoggedIn ? (
                <button
                  onClick={async () => { await logout(); navigate('/') }}
                  className={`${menuItem} text-red-600 dark:text-red-400`}
                >
                  <LogOut size={15} />
                  Log out
                </button>
              ) : (
                <button onClick={() => navigate('/auth')} className={menuItem}>
                  <LogIn size={15} />
                  Sign in
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setMenuOpen(o => !o)}
            title="Account and settings"
            className={`w-full flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition ${isOpen ? '' : 'justify-center'} ${menuOpen ? 'bg-stone-200/70 dark:bg-stone-800' : ''}`}
          >
            <span className="h-8 w-8 flex items-center justify-center rounded-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold flex-shrink-0">
              {initials || '?'}
            </span>
            {isOpen && (
              <>
                <span className="flex-1 min-w-0 text-left">
                  <span className="block text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{displayName}</span>
                  <span className="block text-xs text-stone-500 dark:text-stone-400">
                    {!isLoggedIn ? 'Not signed in' : isPro ? 'Pro plan' : 'Free plan'}
                  </span>
                </span>
                <ChevronsUpDown size={15} className="text-stone-400 flex-shrink-0" />
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
