import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  AlertTriangle,
  BookOpenText,
  ClipboardList,
  FileSearch,
  FlaskConical,
  MessageCircle,
  ShieldCheck,
  GraduationCap,
  Pill,
  ShieldAlert,
  Bot,
} from "lucide-react";
import Footer from './Footer'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" }
  })
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section id="home" className="max-w-6xl mx-auto px-6 pt-40 pb-24 scroll-mt-20">
        <div className="text-center">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight font-pt-serif"
          >
            Your entire health journey in one place
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            Add your medical records and health data. Get AI-powered insights.
            Have your personal health assistant work for you.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
          >
            <Link to="/auth" className="inline-block bg-emerald-600 text-white dark:text-gray-900 px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:-translate-y-1">
              Get Started
            </Link>
          </motion.div>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="text-sm text-gray-500 dark:text-gray-500"
          >
            We are HIPAA compliant and available 24/7
          </motion.p>
        </div>
      </section>

      {/* Subheading */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-5xl mx-auto px-6 py-20"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white leading-tight mb-6 font-pt-serif">
          AI Is Better When It Has All Your Health Context
        </h2>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          ChatGPT doesn't know your medical history. Google doesn't track your medications.
          MediCare AI has everything in one place.
        </p>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-32 scroll-mt-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight font-pt-serif">
            Powerful Features for Your Health
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage your health in one intelligent platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            { title: 'Allergy Checker', desc: 'Flag common allergy risks for medications and ingredients.', Icon: ShieldCheck },
            { title: 'Drug Interactions', desc: 'Spot risky combinations with prescriptions and OTC meds.', Icon: FlaskConical },
            { title: 'Drug Information Lookup', desc: 'Uses, dosage, side effects, warnings — in one place.', Icon: FileSearch },
            { title: 'Symptom Analysis', desc: 'Understand symptoms and when to seek medical help.', Icon: ClipboardList },
            { title: 'Emergency Guidance', desc: 'Quick steps for overdose or severe reactions.', Icon: AlertTriangle },
            { title: 'AI Consultation', desc: "Ask questions in plain language, anytime you're unsure.", Icon: MessageCircle },
            { title: "Drug Categories", desc: "Browse by pain relief, antibiotics, cold & flu, and more.", Icon: BookOpenText }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={i * 0.1}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition will-change-transform hover:scale-[1.01] hover:border-emerald-500/70 dark:hover:border-emerald-400/60 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.20)]"
            >
              <div className="text-emerald-600 dark:text-emerald-400 mb-4">
                <feature.Icon className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 -mt-6 mb-12 max-w-3xl mx-auto"
        >
          This platform provides general medical information and does not replace professional medical advice.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/auth" className="inline-block bg-emerald-600 text-white dark:text-gray-900 px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:-translate-y-1">
            Try All Features
          </Link>
        </motion.div>
      </section>

      {/* Health Data Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 mb-32">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight font-pt-serif">
              All Your Health Data In One Place
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
              Store medical records, prescriptions, and test results. Everything automatically organized and searchable.
            </p>
            <div className="space-y-4">
              {[
                { title: 'Intelligent Storage', desc: 'All records are auto-tagged and categorized' },
                { title: 'Secure & Private', desc: 'Enterprise-grade encryption and HIPAA compliant' },
                { title: 'Easy Sharing', desc: 'Share with healthcare providers instantly' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="flex items-start gap-3"
                >
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-3xl p-16 flex items-center justify-center min-h-[400px]"
          >
            <svg className="w-32 h-32 text-blue-400 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl p-16 flex items-center justify-center min-h-[400px]"
          >
            <svg className="w-32 h-32 text-purple-400 dark:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight font-pt-serif">
              Smart Health Monitoring
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
              Track symptoms, medications, and vitals. Get AI-powered insights to stay on top of your health.
            </p>
            <div className="space-y-4">
              {[
                { title: 'Medication Reminders', desc: 'Never miss a dose with smart notifications' },
                { title: 'Symptom Tracking', desc: 'Log and analyze symptoms over time' },
                { title: 'Health Insights', desc: 'AI-powered trends and recommendations' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="flex items-start gap-3"
                >
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight font-pt-serif">
            Built for Students Who Need Fast & Safe Medical Guidance
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Helping students make informed decisions about medications without unnecessary trips to the pharmacy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Students', desc: 'Quickly access drug information for common illnesses on campus.', Icon: GraduationCap },
            { title: 'Self-Medication Support', desc: 'Get guidance on what medications to take for minor health issues.', Icon: Pill },
            { title: 'Safe Drug Usage', desc: 'Avoid harmful drug combinations and incorrect dosage.', Icon: ShieldAlert },
            { title: 'AI Assistance', desc: 'Ask health-related questions and get instant AI-powered responses.', Icon: Bot }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={i}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:border-emerald-500/50 dark:hover:border-emerald-400/50"
            >
              <div className="text-emerald-600 dark:text-emerald-400 mb-4">
                <item.Icon className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto"
        >
          Disclaimer: This platform provides general medical guidance and does not replace professional healthcare advice.
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-6xl mx-auto px-6 py-32"
      >
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight font-lobster">
            Experience MediCare AI Today
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Your entire health journey, in one place.
          </p>
          <Link to="/auth" className="inline-block bg-emerald-600 text-white dark:text-gray-900 px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:-translate-y-1">
            Try AI Chat
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
            We are HIPAA compliant and available 24/7
          </p>
        </div>
      </motion.section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-32 scroll-mt-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight font-pt-serif">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your health needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { name: 'Free', price: '$0', features: ['Basic AI consultation', '5 queries per day', 'Email support', 'Health tracking'], popular: false },
            { name: 'Pro', price: '$19', features: ['Unlimited AI consultation', 'Priority support', 'Advanced health tracking', 'Personalized plans', 'Drug interaction checker'], popular: true },
            { name: 'Enterprise', price: '$49', features: ['Everything in Pro', 'Dedicated support', 'API access', 'Custom integrations', 'Family accounts (up to 5)'], popular: false }
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={i}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_10px_40px_rgba(16,185,129,0.2)]"
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">{plan.name}</h3>
              <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                {plan.price}
                <span className="text-lg text-gray-600 dark:text-gray-400">/mo</span>
              </p>
              <ul className="space-y-3 mb-8 mt-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className="block w-full text-center px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:-translate-y-1"
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All plans include HIPAA compliance and 256-bit encryption
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}