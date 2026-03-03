import Link from 'next/link'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="home" className="max-w-6xl mx-auto px-6 pt-40 pb-24 scroll-mt-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight font-pt-serif">
            Your entire health journey in one place
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Add your medical records and health data. Get AI-powered insights. 
            Have your personal health assistant work for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link href="/chat" className="bg-emerald-600 text-white dark:text-gray-900 px-8 py-4 rounded-full text-base font-medium hover:opacity-90 transition">
              Get Started
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            We are HIPAA compliant and available 24/7
          </p>
        </div>
      </section>

      {/* Subheading */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white leading-tight mb-6 font-pt-serif">
          AI Is Better When It Has All Your Health Context
        </h2>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          ChatGPT doesn't know your medical history. Google doesn't track your medications. 
          MediCare AI has everything in one place.
        </p>
      </section>

      {/* Main Feature - Chat */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-32 scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight font-pt-serif">
            Powerful Features for Your Health
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage your health in one intelligent platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            { 
              title: 'Allergy Checker', 
              desc: 'Instantly check food and medication allergies against your profile',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            { 
              title: 'Drug Interactions', 
              desc: 'Get warnings about potential medication interactions',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )
            },
            { 
              title: 'Dietary Guidance', 
              desc: 'Personalized nutrition advice based on your health goals',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )
            },
            { 
              title: 'Symptom Analysis', 
              desc: 'AI-powered symptom checker with medical insights',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )
            },
            { 
              title: 'Health Tracking', 
              desc: 'Monitor vitals, medications, and health metrics over time',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            { 
              title: 'AI Consultation', 
              desc: '24/7 access to AI-powered medical consultation',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )
            }
          ].map((feature) => (
            <div key={feature.title} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition">
              <div className="text-emerald-600 dark:text-emerald-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/chat" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-full text-base font-medium hover:bg-emerald-700 transition">
            Try All Features
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 mb-32">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight font-pt-serif">
              All Your Health Data In One Place
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
              Store medical records, prescriptions, and test results. Everything automatically organized and searchable.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Intelligent Storage</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">All records are auto-tagged and categorized</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Secure & Private</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Enterprise-grade encryption and HIPAA compliant</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Sharing</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Share with healthcare providers instantly</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-3xl p-16 flex items-center justify-center min-h-[400px]">
            <svg className="w-32 h-32 text-blue-400 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl p-16 flex items-center justify-center min-h-[400px]">
            <svg className="w-32 h-32 text-purple-400 dark:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight font-pt-serif">
              Smart Health Monitoring
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
              Track symptoms, medications, and vitals. Get AI-powered insights to stay on top of your health.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Medication Reminders</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Never miss a dose with smart notifications</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Symptom Tracking</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Log and analyze symptoms over time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Health Insights</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">AI-powered trends and recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Use Cases */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16 leading-tight font-pt-serif">
          For Everyone Who Cares About Their Health
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Patients', desc: 'Manage chronic conditions and medications' },
            { title: 'Parents', desc: 'Keep family health records organized' },
            { title: 'Caregivers', desc: 'Coordinate care for loved ones' },
            { title: 'Athletes', desc: 'Track performance and recovery' },
            { title: 'Seniors', desc: 'Easy access to health information' },
            { title: 'Health Enthusiasts', desc: 'Optimize wellness with AI' }
          ].map((item) => (
            <div key={item.title} className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight font-lobster">
            Experience MediCare AI Today
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Your entire health journey, in one place.
          </p>
          <Link href="/chat" className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-full text-lg font-medium hover:opacity-90 transition">
            Get Started Free
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
            We are HIPAA compliant and available 24/7
          </p>
        </div>
      </section>

            {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-32 scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight font-pt-serif">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your health needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { 
              name: 'Free', 
              price: '$0', 
              features: ['Basic AI consultation', '5 queries per day', 'Email support', 'Health tracking'],
              popular: false
            },
            { 
              name: 'Pro', 
              price: '$19', 
              features: ['Unlimited AI consultation', 'Priority support', 'Advanced health tracking', 'Personalized plans', 'Drug interaction checker'],
              popular: true
            },
            { 
              name: 'Enterprise', 
              price: '$49', 
              features: ['Everything in Pro', 'Dedicated support', 'API access', 'Custom integrations', 'Family accounts (up to 5)'],
              popular: false
            }
          ].map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 border-2 transition ${
                plan.popular 
                  ? 'border-emerald-500 dark:border-emerald-500 shadow-xl scale-105' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
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
                href="/chat" 
                className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition ${
                  plan.popular
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All plans include HIPAA compliance and 256-bit encryption
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
