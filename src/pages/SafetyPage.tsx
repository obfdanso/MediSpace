import Navbar from "@/components/Navbar";
import AuroraShaders from "@/components/ui/aurora";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders
          speed={0.5}
          intensity={0.3}
          vibrancy={0.8}
          frequency={1.2}
          stretch={1.5}
        />
      </div>
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Safety & Privacy
          </h1>
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-800 space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-200">
              Your health data is protected with enterprise-grade encryption and security
              measures.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>End-to-end encryption</li>
              <li>HIPAA compliant</li>
              <li>No data sharing with third parties</li>
              <li>Regular security audits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

