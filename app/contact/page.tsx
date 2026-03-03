import Navbar from "@/components/Navbar";
import AuroraShaders from "@/components/ui/aurora";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders speed={0.5} intensity={0.3} vibrancy={0.8} frequency={1.2} stretch={1.5} />
      </div>
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">Contact Us</h1>
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-800">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea rows={5} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
              </div>
              <button type="submit" className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
