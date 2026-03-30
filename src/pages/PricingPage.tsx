import Navbar from "@/components/Navbar";
import AuroraShaders from "@/components/ui/aurora";
import { Link } from "react-router-dom";

export default function PricingPage() {
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Pricing Plans
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                features: ["Basic AI consultation", "5 queries per day", "Email support"],
              },
              {
                name: "Pro",
                price: "$19",
                features: [
                  "Unlimited AI consultation",
                  "Priority support",
                  "Health tracking",
                  "Personalized plans",
                ],
              },
              {
                name: "Enterprise",
                price: "$49",
                features: [
                  "Everything in Pro",
                  "Dedicated support",
                  "API access",
                  "Custom integrations",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_10px_40px_rgba(16,185,129,0.2)]"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
                  {plan.price}
                  <span className="text-lg text-gray-600 dark:text-gray-400">/mo</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/chat"
                  className="block w-full text-center px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:-translate-y-1"
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

