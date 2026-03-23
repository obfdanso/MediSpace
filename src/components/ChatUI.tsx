import { useState, useRef, useEffect } from "react";
import { Send, User, MessageCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export default function ChatUI() {
  const [searchParams] = useSearchParams();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden">
      {/* Chat Header */}
      <div className="relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
          <MessageCircle size={24} />
        </div>
        <div>
          <h2 className="text-gray-900 dark:text-white font-semibold text-lg font-pt-serif">MediSpace AI Assistant</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Always here to help</p>
        </div>
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
                  msg.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {msg.role === "user" ? <User size={20} /> : <MessageCircle size={20} />}
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
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl px-4 py-3 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your health-related question..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white px-2 py-1 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            aria-label="Send message"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
