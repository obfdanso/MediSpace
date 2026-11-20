import { Link } from "react-router-dom";
import { MessageCircle, UserRound, Pill, ShieldAlert, Stethoscope, History } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuroraShaders from "@/components/ui/aurora";

// Only things the app really does today
const FEATURES = [
  { title: "Health Chat, Any Time", desc: "Ask health questions in plain language and get a clear answer in seconds, day or night.", Icon: MessageCircle },
  { title: "Answers That Fit You", desc: "Add your age, conditions, allergies and medicines once, and answers take them into account.", Icon: UserRound },
  { title: "Medicine Information", desc: "What a medicine is for, how it's usually taken, side effects and who should avoid it.", Icon: Pill },
  { title: "Drug Interactions", desc: "List the medicines you take and see which combinations to raise with your pharmacist.", Icon: ShieldAlert },
  { title: "Symptom Guidance", desc: "Understand possible causes of how you feel and when it's time to see a doctor.", Icon: Stethoscope },
  { title: "Saved Conversations", desc: "Signed-in users can come back to earlier chats from any device.", Icon: History },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative isolate">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders />
      </div>
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">Features</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-12">
            What MediSpace can help you with. It gives general information, not a diagnosis, so always check with a health professional.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ title, desc, Icon }) => (
              <div
                key={title}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-800"
              >
                <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/chat"
              className="inline-block px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
            >
              Start a chat
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
