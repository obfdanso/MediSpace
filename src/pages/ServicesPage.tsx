import Navbar from "@/components/Navbar";
import AuroraShaders from "@/components/ui/aurora";

export default function ServicesPage() {
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
            Our Services
          </h1>
          <div className="space-y-6">
            {[
              "24/7 AI Health Consultation",
              "Personalized Health Plans",
              "Medical Records Management",
              "Prescription Tracking",
            ].map((service) => (
              <div
                key={service}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-800"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {service}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive {service.toLowerCase()} tailored to your needs.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

