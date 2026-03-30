import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Plus, Search, Settings, Trash2, PanelLeftClose, PanelLeftOpen, CreditCard, Zap, LogOut, Home } from 'lucide-react'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeProvider'
import { getConversations, deleteConversation, type Conversation } from '@/lib/supabase'

interface ChatSidebarProps {
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  refreshKey?: number
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
    const saved = localStorage.getItem('sidebar-open')
    return saved !== null ? saved === 'true' : true
  })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)

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
    if (!isMobile) localStorage.setItem('sidebar-open', String(isOpen))
  }, [isOpen, isMobile])

  useEffect(() => {
    if (isLoggedIn && user) {
      loadConversations()
    } else {
      setConversations([])
    }
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile open button — shown when sidebar is hidden on mobile */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open sidebar"
          className="fixed top-3 left-3 z-40 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

    <div
      className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col flex-shrink-0 ${
        isMobile
          ? isOpen
            ? 'fixed top-0 left-0 z-50 w-72 shadow-xl'
            : 'hidden'
          : isOpen
            ? 'w-64'
            : 'w-14'
      }`}
    >
      {/* Header: toggle + new chat */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsOpen(o => !o)}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition flex-shrink-0"
        >
          {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        {isOpen && (
          <button
            onClick={onNewChat}
            title="New Chat"
            className="flex-1 flex items-center gap-2 px-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-sm font-medium"
          >
            <Plus size={16} className="flex-shrink-0" />
            New Chat
          </button>
        )}

        {!isOpen && (
          <button
            onClick={onNewChat}
            title="New Chat"
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Search (only when open) */}
      {isOpen && (
        <div className="px-2 pt-2 pb-1 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto py-2">
        {!isLoggedIn ? (
          isOpen ? (
            <div className="px-3 py-6 text-center">
              <MessageSquare size={22} className="mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                Sign in to save and view your chat history
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-full transition"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="flex justify-center py-3">
              <MessageSquare size={18} className="text-gray-400" />
            </div>
          )
        ) : (
          <>
            {isOpen && (
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Recent Chats
              </p>
            )}

            {filtered.length === 0 && isOpen && (
              <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic">
                {searchQuery ? 'No results' : 'No chats yet'}
              </p>
            )}

            {filtered.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                title={conv.title}
                className={`w-full cursor-pointer flex items-center gap-2.5 px-2 py-2 group transition ${
                  activeConversationId === conv.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${isOpen ? '' : 'justify-center'}`}
              >
                <MessageSquare size={15} className="flex-shrink-0" />
                {isOpen && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm truncate">{conv.title}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(conv.updated_at)}
                      </div>
                    </div>
                    <button
                      onClick={e => handleDelete(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition flex-shrink-0"
                    >
                      <Trash2 size={13} className="text-red-500 dark:text-red-400" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-3 space-y-3">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Settings
          </p>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Billing & Settings */}
          {isLoggedIn && (
            <button
              onClick={() => navigate('/billing')}
              className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition flex items-center gap-2"
            >
              <CreditCard size={14} />
              Billing & Plan
              {profile?.tier === 'premium' && (
                <span className="ml-auto text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Zap size={10} /> Pro
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition flex items-center gap-2"
          >
            <Home size={14} />
            Back to Home
          </button>

          {isLoggedIn && (
            <button
              onClick={async () => {
                await logout()
                navigate('/')
              }}
              className="w-full text-left text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-1 transition flex items-center gap-2"
            >
              <LogOut size={14} />
              Log Out
            </button>
          )}
        </div>
      )}

      {/* Settings Button */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2">
        <button
          onClick={() => setShowSettings(s => !s)}
          title="Settings"
          className={`w-full flex items-center gap-3 px-2 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition ${
            isOpen ? '' : 'justify-center'
          } ${showSettings && isOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
          <Settings size={18} className="flex-shrink-0" />
          {isOpen && <span className="text-sm">Settings</span>}
        </button>
      </div>
    </div>
    </>
  )
}
