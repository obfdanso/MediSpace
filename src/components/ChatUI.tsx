import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Paperclip } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface ChatUIProps {
  onNewMessage?: () => void;
  messageCount?: number;
}

const FREE_MESSAGE_LIMIT = 3;

export default function ChatUI({ onNewMessage, messageCount = 0 }: ChatUIProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topic = searchParams.get("topic");

  const [messages, setMessages] = useState<Message[]>(() => {
    const hour = new Date().getHours();
    let timeGreeting = "tonight";
    if (hour >= 5 && hour < 12) timeGreeting = "this morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "this afternoon";
    else if (hour >= 17 && hour < 21) timeGreeting = "this evening";

    return [
      {
        id: "1",
        role: "ai",
        content: topic
          ? `Hello! I see you are interested in ${topic}. How can I help you with that ${timeGreeting}?`
          : `Hello! How can I help you ${timeGreeting}?`
      }
    ];
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!localStorage.getItem("token");
  const remainingMessages = FREE_MESSAGE_LIMIT - messageCount;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Check if free limit reached
    if (!isLoggedIn && messageCount >= FREE_MESSAGE_LIMIT) {
      navigate("/auth");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Notify parent to increment count
    if (onNewMessage) onNewMessage();

    // Simulate AI response
    setTimeout(() => {
      const topicReplies: Record<string, string> = {
        "Allergy Checker": "I can help you check for allergy risks. Tell me the medication or ingredient you want to check, and I'll flag any common allergy concerns.",
        "Drug Interactions": "I can help you spot risky drug combinations. List the medications you're taking (prescription or OTC) and I'll check for dangerous interactions.",
        "Drug Information Lookup": "I can look up detailed drug info for you — uses, dosage, side effects, and warnings. Which medication would you like to know about?",
        "Symptom Analysis": "I can help you understand your symptoms. Describe what you're experiencing and I'll give you some guidance on what it might mean and when to seek help.",
        "Emergency Guidance": "If this is a medical emergency, please call emergency services immediately. Otherwise, tell me the situation (e.g. suspected overdose or severe reaction) and I'll walk you through the steps.",
        "AI Consultation": "I'm here for any health-related questions you have. Ask me anything — medications, symptoms, general health advice, and more.",
      };
      const reply = topic && topicReplies[topic]
        ? topicReplies[topic]
        : "I'm here to help with your health questions! What would you like to know?";
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleFileUpload = () => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    // TODO: handle actual file upload
    alert("File upload coming soon!");
  };

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden">

      {/* Chat Header */}
      <div className="relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg font-pt-serif">MediSpace AI Assistant</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Always here to help</p>
          </div>
        </div>

        {/* Free usage badge */}
        {!isLoggedIn && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              remainingMessages <= 1
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                remainingMessages <= 1 ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
              {remainingMessages > 0
                ? `${remainingMessages} free message${remainingMessages !== 1 ? 's' : ''} left`
                : 'Free limit reached'}
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-full transition"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Context Badge */}
      {topic && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/50 px-6 py-2.5 flex items-center justify-center shrink-0 shadow-sm z-0">
          <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-sm font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Active Context: {topic}
          </div>
        </div>
      )}

      {/* Free limit warning banner */}
      {!isLoggedIn && remainingMessages === 1 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last free message! Sign in to keep chatting.
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-full transition"
          >
            Sign In Free
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
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shrink-0 mb-4 pb-8 md:pb-4">

        {/* Locked overlay message */}
        {!isLoggedIn && messageCount >= FREE_MESSAGE_LIMIT && (
          <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              You've used your 3 free messages
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-full transition"
            >
              Sign in to continue →
            </button>
          </div>
        )}

        <div className={`max-w-4xl mx-auto flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border rounded-2xl px-4 py-3 transition-all shadow-sm ${
          !isLoggedIn && messageCount >= FREE_MESSAGE_LIMIT
            ? 'border-gray-200 dark:border-gray-700 opacity-50 pointer-events-none'
            : 'border-gray-300 dark:border-gray-700 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50'
        }`}>

          {/* File upload button */}
          <button
            onClick={handleFileUpload}
            className="text-gray-400 hover:text-emerald-500 transition flex-shrink-0"
            title={isLoggedIn ? "Upload document" : "Sign in to upload documents"}
          >
            <Paperclip size={20} />
            {!isLoggedIn && (
              <span className="sr-only">Sign in to upload</span>
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !isLoggedIn && messageCount >= FREE_MESSAGE_LIMIT
                ? "Sign in to continue chatting..."
                : "Type your health-related question..."
            }
            disabled={!isLoggedIn && messageCount >= FREE_MESSAGE_LIMIT}
            className="flex-1 bg-transparent text-gray-900 dark:text-white px-2 py-1 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || (!isLoggedIn && messageCount >= FREE_MESSAGE_LIMIT)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            aria-label="Send message"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* File upload hint for logged out users */}
        {!isLoggedIn && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
            <button onClick={() => navigate("/auth")} className="text-emerald-500 hover:underline font-medium">
              Sign in
            </button>
            {" "}to upload documents and save your chat history
          </p>
        )}
      </div>
    </div>
  );
}