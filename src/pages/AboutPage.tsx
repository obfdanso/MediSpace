import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AuroraShaders from "@/components/ui/aurora";
import { SUPPORT_EMAIL } from "@/lib/site";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative isolate">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders />
      </div>
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            About MediSpace
          </h1>
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-800 space-y-4 text-gray-600 dark:text-gray-300">
            <p className="text-lg text-gray-700 dark:text-gray-200">
              MediSpace is an AI health assistant built in Ghana. It helps you understand your
              symptoms and medicines in plain language, at any hour, so you can walk into a
              clinic or pharmacy knowing what to ask.
            </p>
            <p>
              Good health information shouldn't depend on who you know or how long the queue is.
              MediSpace gives clear, careful answers that take your own health profile into
              account, and it always points you to a professional when you need one.
            </p>
            <p>
              MediSpace does not replace doctors, nurses or pharmacists. It gives general
              information, not a diagnosis. Read our{" "}
              <Link to="/disclaimer" className="text-emerald-600 dark:text-emerald-400 hover:underline">medical disclaimer</Link>{" "}
              and how we handle your data on the{" "}
              <Link to="/safety" className="text-emerald-600 dark:text-emerald-400 hover:underline">safety and privacy</Link> page.
            </p>
            <p>
              Questions, feedback or partnership ideas? Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">{SUPPORT_EMAIL}</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

