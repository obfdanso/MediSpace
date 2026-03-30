import { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { getMessages } from "@/lib/supabase";
import { sendChatMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  streaming?: boolean;
}

interface ChatUIProps {
  onNewMessage?: () => void;
  messageCount?: number;
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
}

// Anonymous free limit (client-side UI only — backend enforces actual limit)
const ANON_LIMIT = 3;

export default function ChatUI({
  onNewMessage,
  messageCount = 0,
  conversationId,
  onConversationCreated,
}: ChatUIProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const topic = searchParams.get("topic");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "this morning";
    if (hour >= 12 && hour < 17) return "this afternoon";
    if (hour >= 17 && hour < 21) return "this evening";
    return "tonight";
  };

  const initialGreeting = topic
    ? `Hello! I see you are interested in ${topic}. How can I help you with that ${getGreeting()}?`
    : `Hello! How can I help you ${getGreeting()}?`;

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: initialGreeting },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [usageLeft, setUsageLeft] = useState<number | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  // Tracks which AI message IDs have finished their typewriter animation
  const [animDone, setAnimDone] = useState<Set<string>>(new Set());
  const markAnimDone = useCallback((id: string) => {
    setAnimDone(prev => new Set(prev).add(id));
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const remainingMessages = ANON_LIMIT - messageCount;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation when conversationId prop changes, or reset for new chat
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    if (conversationId) {
      const load = async () => {
        const msgs = await getMessages(conversationId);
        if (msgs.length > 0) {
          setMessages(
            msgs.map((m) => ({
              id: m.id,
              role: m.role === "assistant" ? "ai" : "user",
              content: m.content,
            }))
          );
        }
        setActiveConversationId(conversationId);
      };
      load();
    } else {
      setMessages([{ id: "1", role: "ai", content: initialGreeting }]);
      setActiveConversationId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isLoggedIn, user?.id]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    if (!isLoggedIn && messageCount >= ANON_LIMIT) {
      navigate("/auth");
      return;
    }

    const userContent = input.trim();
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    // Optimistically add user message
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: userContent },
    ]);
    setInput("");
    setErrorBanner(null);

    // Add empty streaming AI message placeholder
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: "ai", content: "", streaming: true },
    ]);
    setIsStreaming(true);

    if (onNewMessage) onNewMessage();

    try {
      const result = await sendChatMessage({
        message: userContent,
        conversationId: activeConversationId,
        topic,
        onChunk: (chunk: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
      });

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, streaming: false } : m
        )
      );

      // Update conversation ID if newly created by backend
      if (result.conversationId && result.conversationId !== activeConversationId) {
        setActiveConversationId(result.conversationId);
        if (onConversationCreated) onConversationCreated(result.conversationId);
      }

      // Update usage display
      setUsageLeft(result.usageLeft);
    } catch (err: unknown) {
      // Remove the empty streaming placeholder
      setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));

      const error = err as { message?: string; status?: number }
      const message = error.message ?? "Something went wrong. Please try again.";
      setErrorBanner(message);

      // Rate limited — redirect to auth for anonymous users
      if (error.status === 429 && !isLoggedIn) {
        setTimeout(() => navigate("/auth"), 2000);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) handleSend();
  };

  const isLocked = !isLoggedIn && messageCount >= ANON_LIMIT;

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden">

      {/* Chat Header */}
      <div className="relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg font-pt-serif">
              MediSpace AI Assistant
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Always here to help</p>
          </div>
        </div>

        {/* Usage badge */}
        {!isLoggedIn && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                remainingMessages <= 1
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                  : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  remainingMessages <= 1 ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              {remainingMessages > 0
                ? `${remainingMessages} free message${remainingMessages !== 1 ? "s" : ""} left`
                : "Free limit reached"}
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-full transition"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Logged-in usage badge */}
        {isLoggedIn && usageLeft !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {usageLeft} messages left today
          </div>
        )}
      </div>

      {/* Context Badge */}
      {topic && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/50 px-6 py-2.5 flex items-center justify-center shrink-0 shadow-sm z-0">
          <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-sm font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Active Context: {topic}
          </div>
        </div>
      )}

      {/* Warning banner */}
      {!isLoggedIn && remainingMessages === 1 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last free message. Sign in to keep chatting.
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-full transition"
          >
            Sign In Free
          </button>
        </div>
      )}

      {/* Error banner */}
      {errorBanner && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-3 flex items-center justify-between shrink-0">
          <p className="text-sm text-red-600 dark:text-red-400">{errorBanner}</p>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-red-400 hover:text-red-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="max-w-5xl mx-auto space-y-6 w-full">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} transition-all duration-300 ease-in-out`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
              </div>

              <div
                className={`max-w-[85%] md:max-w-[75%] px-5 py-3.5 text-sm md:text-base leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.role === "user" ? (
                  msg.content
                ) : (msg.streaming || !animDone.has(msg.id)) && msg.content ? (
                  // Typewriter animation: word by word, steady rate
                  <StreamingText
                    full={msg.content}
                    onCaughtUp={() => { if (!msg.streaming) markAnimDone(msg.id); }}
                  />
                ) : msg.streaming && !msg.content ? (
                  <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                    <Loader2 size={14} className="animate-spin" />
                    Thinking...
                  </span>
                ) : msg.content ? (
                  // Animation done: render full markdown
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="ml-2">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                      code: ({ children, className }) =>
                        className ? (
                          <code className="block bg-gray-200 dark:bg-gray-800 rounded p-2 text-xs overflow-x-auto my-2">{children}</code>
                        ) : (
                          <code className="bg-gray-200 dark:bg-gray-800 rounded px-1 py-0.5 text-xs">{children}</code>
                        ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-emerald-400 pl-3 italic text-gray-600 dark:text-gray-400 my-2">{children}</blockquote>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shrink-0 mb-4 pb-8 md:pb-4">

        {/* Locked overlay */}
        {isLocked && (
          <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              You have used your {ANON_LIMIT} free messages
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-full transition"
            >
              Sign in to continue
            </button>
          </div>
        )}

        <div
          className={`max-w-4xl mx-auto flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl px-4 py-3 transition-all shadow-sm ${
            isLocked
              ? "border-gray-200 dark:border-gray-700 opacity-50 pointer-events-none"
              : "border-gray-300 dark:border-gray-700 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50"
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLocked
                ? "Sign in to continue chatting..."
                : "Type your health-related question..."
            }
            disabled={isLocked || isStreaming}
            className="flex-1 bg-transparent text-gray-900 dark:text-white px-2 py-1 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLocked || isStreaming}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            aria-label="Send message"
          >
            {isStreaming ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {!isLoggedIn && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
            <button
              onClick={() => navigate("/auth")}
              className="text-emerald-500 hover:underline font-medium"
            >
              Sign in
            </button>
            {" "}to save your chat history
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Typewriter component ─────────────────────────────────────────────────────
// Reveals text word-by-word at a steady rate, decoupled from how fast
// chunks arrive from the backend stream.

const WORD_INTERVAL_MS = 38; // ~26 words/sec

function StreamingText({ full, onCaughtUp }: { full: string; onCaughtUp: () => void }) {
  const [shown, setShown] = useState(0);
  const fullRef = useRef(full);
  const onCaughtUpRef = useRef(onCaughtUp);

  useEffect(() => { fullRef.current = full; });
  useEffect(() => { onCaughtUpRef.current = onCaughtUp; });

  useEffect(() => {
    if (shown >= fullRef.current.length) {
      onCaughtUpRef.current();
    }
  }, [shown]);

  useEffect(() => {
    const id = setInterval(() => {
      setShown(prev => {
        const target = fullRef.current;
        if (prev >= target.length) {
          return prev;
        }

        // Catch up faster if we're falling behind (> 80 chars behind)
        const lag = target.length - prev;
        const steps = lag > 80 ? 3 : 1;

        let i = prev;
        for (let s = 0; s < steps && i < target.length; s++) {
          // advance to end of current word
          while (i < target.length && target[i] !== " " && target[i] !== "\n") i++;
          if (i < target.length) i++; // include the space/newline
        }
        return i;
      });
    }, WORD_INTERVAL_MS);

    return () => clearInterval(id);
  }, []); // runs once for the lifetime of this component

  return (
    <span className="whitespace-pre-wrap">
      {full.slice(0, shown)}
      <span className="inline-block w-0.5 h-[1.1em] ml-0.5 bg-emerald-500 animate-pulse align-middle" />
    </span>
  );
}
