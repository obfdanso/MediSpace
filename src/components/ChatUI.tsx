import { useState, useRef, useEffect, useCallback, memo } from "react";
import { ArrowUp, Loader2, Copy, Check, X, Lock, AlertTriangle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { getMessages } from "@/lib/supabase";
import { sendChatMessage, getUsage } from "@/lib/api";
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

// Shown only until the server reports the real allowance (it enforces the limit)
const DEFAULT_ANON_LIMIT = 3;

const SUGGESTIONS = [
  "What could be causing my headaches?",
  "How much water should I drink a day?",
  "Tips for better sleep",
  "Explain my blood pressure reading",
];

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-4 last:mb-0">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-6 mb-4 space-y-1.5">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="pl-1">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-xl font-semibold mb-3 mt-6 first:mt-0">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-lg font-semibold mb-2 mt-5 first:mt-0">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-emerald-700 dark:text-emerald-400 underline underline-offset-2">{children}</a>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    className ? (
      <code className="block bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-[13px] overflow-x-auto my-3 font-mono">{children}</code>
    ) : (
      <code className="bg-stone-100 dark:bg-stone-800 rounded px-1.5 py-0.5 text-[0.9em] font-mono">{children}</code>
    ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-emerald-500 pl-4 text-stone-600 dark:text-stone-400 my-3">{children}</blockquote>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-4"><table className="w-full text-sm border-collapse">{children}</table></div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => <th className="border-b border-stone-300 dark:border-stone-700 px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }: { children?: React.ReactNode }) => <td className="border-b border-stone-200 dark:border-stone-800 px-3 py-2">{children}</td>,
};

export default function ChatUI({
  onNewMessage,
  messageCount = 0,
  conversationId,
  onConversationCreated,
}: ChatUIProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn, user, profile } = useAuth();
  const topic = searchParams.get("topic");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  // Today's allowance as reported by the server
  const [usage, setUsage] = useState<{ left: number; limit: number } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Tracks which AI message IDs have finished their typewriter animation
  const [animDone, setAnimDone] = useState<Set<string>>(new Set());
  const markAnimDone = useCallback((id: string) => {
    setAnimDone(prev => new Set(prev).add(id));
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Bumped whenever the visible conversation changes, so a reply that is
  // still streaming for the previous chat can't write into the new one
  const viewSeq = useRef(0);

  const remainingMessages = usage ? usage.left : Math.max(0, DEFAULT_ANON_LIMIT - messageCount);
  const allowance = usage?.limit ?? DEFAULT_ANON_LIMIT;

  // Ask the server for the real count on load and whenever sign-in changes
  useEffect(() => {
    let cancelled = false;
    getUsage().then((u) => {
      if (!cancelled && u) setUsage({ left: u.usageLeft, limit: u.usageLimit });
    });
    return () => { cancelled = true; };
  }, [isLoggedIn, user?.id]);
  const firstName = profile?.full_name?.trim().split(/\s+/)[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Grow the composer with its content, up to a cap
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [input]);

  // Load conversation when conversationId prop changes, or reset for new chat
  useEffect(() => {
    if (conversationId !== activeConversationId) {
      viewSeq.current++;
      setErrorBanner(null);
      setIsStreaming(false);
    }
    if (!isLoggedIn || !user) {
      // Signed out: don't leave a saved conversation on screen
      if (activeConversationId) {
        setMessages([]);
        setActiveConversationId(null);
      }
      return;
    }

    if (conversationId) {
      // Already on screen (just created by the reply we streamed)
      if (conversationId === activeConversationId) return;

      let cancelled = false;
      const load = async () => {
        const msgs = await getMessages(conversationId);
        if (cancelled) return;
        // Saved replies render straight away instead of being typed out again
        setAnimDone((prev) => {
          const next = new Set(prev);
          msgs.forEach((m) => next.add(m.id));
          return next;
        });
        setMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role === "assistant" ? "ai" : "user",
            content: m.content,
          }))
        );
        setActiveConversationId(conversationId);
      };
      load();
      return () => { cancelled = true; };
    } else {
      setMessages([]);
      setActiveConversationId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isLoggedIn, user?.id]);

  const handleSend = async (text?: string) => {
    const userContent = (text ?? input).trim();
    if (!userContent || isStreaming) return;

    if (!isLoggedIn && remainingMessages <= 0) {
      navigate("/auth");
      return;
    }

    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    // Optimistically add the user message and an empty reply placeholder
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: userContent },
      { id: aiMsgId, role: "ai", content: "", streaming: true },
    ]);
    setInput("");
    setErrorBanner(null);
    setIsStreaming(true);
    const seq = viewSeq.current;
    const stillHere = () => viewSeq.current === seq;

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
        // Unlock as soon as the reply is complete; a new chat's title is
        // still being written on the server after this
        onDone: (done) => {
          if (!stillHere()) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, streaming: false } : m
            )
          );
          setUsage({ left: done.usageLeft, limit: done.usageLimit });
          setIsStreaming(false);
        },
      });

      if (!stillHere()) return;

      // In case the stream ended without a "done" event
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

      setUsage({ left: result.usageLeft, limit: result.usageLimit });

      // Only answered messages count against the free allowance
      if (onNewMessage) onNewMessage();
    } catch (err: unknown) {
      if (!stillHere()) return;
      // Remove the empty streaming placeholder
      setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));

      const error = err as { message?: string; status?: number }
      setErrorBanner(error.message ?? "Something went wrong. Please try again.");
      if (error.status === 429) setUsage((u) => ({ left: 0, limit: u?.limit ?? allowance }));

      // Rate limited — redirect to auth for anonymous users
      if (error.status === 429 && !isLoggedIn) {
        setTimeout(() => navigate("/auth"), 2000);
      }
    } finally {
      if (stillHere()) {
        setIsStreaming(false);
        textareaRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(c => (c === msg.id ? null : c)), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const isLocked = !isLoggedIn && remainingMessages <= 0;
  const isEmpty = messages.length === 0;

  const composer = (
    <div className="w-full">
      {/* Notices sit right above the composer instead of as full-width bars */}
      {errorBanner && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <p className="flex-1">{errorBanner}</p>
          <button onClick={() => setErrorBanner(null)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {isLocked ? (
        <div className="mb-2 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/60 px-4 py-3 text-sm text-stone-600 dark:text-stone-300">
          <span className="flex items-center gap-2">
            <Lock size={15} className="text-emerald-600 dark:text-emerald-400" />
            You've used your {allowance} free messages
          </span>
          <button
            onClick={() => navigate("/auth")}
            className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-full transition"
          >
            Sign in to continue
          </button>
        </div>
      ) : !isLoggedIn && remainingMessages === 1 ? (
        <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300">
          <span>Last free message. Sign in to keep chatting.</span>
          <button onClick={() => navigate("/auth")} className="font-semibold hover:underline whitespace-nowrap">
            Sign in
          </button>
        </div>
      ) : null}

      <div
        className={`rounded-2xl border bg-white dark:bg-stone-800 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-none transition ${
          isLocked
            ? "border-stone-200 dark:border-stone-700 opacity-50 pointer-events-none"
            : "border-stone-200 dark:border-stone-700 focus-within:border-stone-300 dark:focus-within:border-stone-600 focus-within:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.12)]"
        }`}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder={isLocked ? "Sign in to continue chatting..." : isEmpty ? "How can I help you today?" : "Reply to MediSpace..."}
          disabled={isLocked}
          className="block w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[15px] leading-relaxed text-stone-900 dark:text-stone-100 outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500 disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            {topic && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {topic}
              </span>
            )}
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLocked || isStreaming}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:bg-stone-200 disabled:text-stone-400 dark:disabled:bg-stone-700 dark:disabled:text-stone-500 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-stone-400 dark:text-stone-500">
        MediSpace can make mistakes and is not a substitute for professional medical advice.
        {!isLoggedIn && (
          <>
            {" "}
            <button onClick={() => navigate("/auth")} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              Sign in
            </button>{" "}
            to save your chats.
          </>
        )}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Slim top bar */}
      <div className="flex items-center justify-between gap-3 pl-14 md:pl-5 pr-4 h-14 shrink-0">
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400 truncate">
          {isEmpty ? "" : "MediSpace"}
        </span>
        <div className="flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <span
                className={`hidden sm:inline text-xs font-medium ${
                  remainingMessages <= 1 ? "text-red-600 dark:text-red-400" : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {remainingMessages > 0
                  ? `${remainingMessages} free message${remainingMessages !== 1 ? "s" : ""} left`
                  : "Free limit reached"}
              </span>
              <button
                onClick={() => navigate("/auth")}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg transition"
              >
                Sign in
              </button>
            </>
          ) : usage !== null ? (
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {usage.left} messages left today
            </span>
          ) : null}
        </div>
      </div>

      {isEmpty ? (
        // Empty state: greeting and composer centred, like a fresh page
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 pb-[10vh]">
          <div className="w-full max-w-2xl">
            <h1 className="text-center font-pt-serif text-3xl md:text-4xl text-stone-800 dark:text-stone-100 mb-8 flex items-center justify-center gap-3">
              <span className="text-emerald-600 dark:text-emerald-400 text-2xl md:text-3xl" aria-hidden>✻</span>
              {topic ? `Let's talk about ${topic}` : `${timeGreeting()}${firstName ? `, ${firstName}` : ""}`}
            </h1>
            {composer}
            {!isLocked && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-full border border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/50 px-3.5 py-1.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-white hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="max-w-3xl mx-auto w-full pt-4 pb-10 space-y-8">
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-stone-200/70 dark:bg-stone-800 px-4 py-2.5 text-[15px] leading-relaxed text-stone-900 dark:text-stone-100 whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="group">
                    <div className="text-[15px] leading-7 text-stone-800 dark:text-stone-200 break-words">
                      {(msg.streaming || !animDone.has(msg.id)) && msg.content ? (
                        // Typewriter animation: word by word, steady rate
                        <StreamingText
                          full={msg.content}
                          streaming={!!msg.streaming}
                          onCaughtUp={() => { if (!msg.streaming) markAnimDone(msg.id); }}
                        />
                      ) : msg.streaming && !msg.content ? (
                        <span className="inline-flex items-center gap-2 text-stone-400 dark:text-stone-500">
                          <span className="text-emerald-600 dark:text-emerald-400 text-lg animate-spin [animation-duration:2.5s]" aria-hidden>✻</span>
                          Thinking...
                        </span>
                      ) : (
                        <Markdown text={msg.content} />
                      )}
                    </div>
                    {!msg.streaming && animDone.has(msg.id) && (
                      <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                        <button
                          onClick={() => handleCopy(msg)}
                          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-stone-500 hover:bg-stone-200/70 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
                          aria-label="Copy reply"
                        >
                          {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                          {copiedId === msg.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Composer pinned to the bottom */}
          <div className="shrink-0 px-4 pb-4 md:pb-5">
            <div className="max-w-3xl mx-auto">{composer}</div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Typewriter component ─────────────────────────────────────────────────────
// Reveals text word-by-word at a steady rate, decoupled from how fast
// chunks arrive from the backend stream.

const WORD_INTERVAL_MS = 38; // ~26 words/sec

function StreamingText({ full, streaming, onCaughtUp }: { full: string; streaming: boolean; onCaughtUp: () => void }) {
  const [shown, setShown] = useState(0);
  const fullRef = useRef(full);
  const onCaughtUpRef = useRef(onCaughtUp);

  useEffect(() => { fullRef.current = full; });
  useEffect(() => { onCaughtUpRef.current = onCaughtUp; });

  // Also re-checks when streaming ends, in case the text had already caught up
  useEffect(() => {
    if (shown >= fullRef.current.length) {
      onCaughtUpRef.current();
    }
  }, [shown, streaming]);

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

  // Render the revealed part as markdown straight away, so headings, bullets
  // and bold appear formatted while typing instead of snapping in at the end
  return (
    <div>
      <Markdown text={closeOpenMarkers(full.slice(0, shown))} />
      <span className="inline-block w-2 h-2 mt-1 rounded-full bg-emerald-500 animate-pulse" />
    </div>
  );
}

// Temporarily closes a half-typed **bold**, `code` span or code block so
// its markers never flash on screen as raw symbols
function closeOpenMarkers(text: string): string {
  const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
  if (count(text, /```/g) % 2 === 1) return text + "\n```";
  let out = text;
  if (count(out, /\*\*/g) % 2 === 1) out += "**";
  if (count(out.replace(/```/g, ""), /`/g) % 2 === 1) out += "`";
  return out;
}

// ─── Markdown, block by block ─────────────────────────────────────────────────
// Splits on blank lines (never inside a code block) and memoises each block,
// so while a reply types out only the last paragraph is re-parsed.

// A blank line only ends a block when what follows can't belong to a list
// above it: indented lines and new list items stay with the list, otherwise
// loose lists would lose their nesting or turn into code blocks.
const LIST_ITEM = /^\s*([-*+]|\d+[.)])\s/;

function splitBlocks(text: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  let blankPending = false;
  for (const line of text.split("\n")) {
    const isFence = /^\s*```/.test(line);
    if (!inFence && line.trim() === "") {
      if (current.length) blankPending = true;
      continue;
    }
    if (blankPending) {
      const inList = current.some((l) => LIST_ITEM.test(l));
      if (inList && (/^\s/.test(line) || LIST_ITEM.test(line))) {
        current.push("");
      } else {
        blocks.push(current.join("\n"));
        current = [];
      }
      blankPending = false;
    }
    if (isFence) inFence = !inFence;
    current.push(line);
  }
  if (current.length) blocks.push(current.join("\n"));
  return blocks;
}

const MarkdownBlock = memo(function MarkdownBlock({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {text}
    </ReactMarkdown>
  );
});

function Markdown({ text }: { text: string }) {
  return (
    <>
      {splitBlocks(text).map((block, i) => (
        <MarkdownBlock key={i} text={block} />
      ))}
    </>
  );
}
