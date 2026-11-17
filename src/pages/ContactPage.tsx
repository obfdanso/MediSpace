import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import AuroraShaders from "@/components/ui/aurora";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name: name.trim(), email: email.trim(), message: message.trim() });
    setSending(false);
    if (error) {
      setStatus({ type: "error", text: "We couldn't send your message. Please try again later." });
      return;
    }
    setName("");
    setEmail("");
    setMessage("");
    setStatus({ type: "success", text: "Thanks, your message has been sent." });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative isolate">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders />
      </div>
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Contact Us
          </h1>
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status && (
                <p
                  role="status"
                  className={`text-sm rounded-lg px-4 py-3 ${
                    status.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  {status.text}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

