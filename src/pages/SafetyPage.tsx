import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AuroraShaders from "@/components/ui/aurora";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative isolate">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders />
      </div>
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Safety & Privacy
          </h1>
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-800 space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-200">
              Here is plainly how MediSpace handles your health information.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>All connections are encrypted (HTTPS), from your device to us and from us to the services we use</li>
              <li>Only you can see your health profile and saved chats from your account</li>
              <li>To write replies, your message and health profile are sent to our AI provider, Groq</li>
              <li>Your account and chats are stored with Supabase, and payments are handled by Paystack, so we never see your card or Mobile Money details</li>
              <li>We don't sell your data or use it for advertising</li>
              <li>You can ask us to delete your data at any time</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300">
              MediSpace gives general information, not medical advice. In an emergency, call 112.
              Read the full <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">privacy policy</Link> and{" "}
              <Link to="/disclaimer" className="text-emerald-600 dark:text-emerald-400 hover:underline">medical disclaimer</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

