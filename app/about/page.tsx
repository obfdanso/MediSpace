import Navbar from "@/components/Navbar";
import AuroraShaders from "@/components/ui/aurora";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders speed={0.5} intensity={0.3} vibrancy={0.8} frequency={1.2} stretch={1.5} />
      </div>
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">About MediCare AI</h1>
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
              MediCare AI is your trusted medical assistant powered by advanced artificial intelligence.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Our mission is to provide accessible, accurate, and personalized health information to everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
