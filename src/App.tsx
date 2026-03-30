import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthContext";
import { useAuth } from "@/components/AuthContext";

import HomePage from "./pages/HomePage";
import Chat from "./pages/Chat";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FeaturesPage from "./pages/FeaturesPage";
import FaqPage from "./pages/FaqPage";
import SafetyPage from "./pages/SafetyPage";
import ServicesPage from "./pages/ServicesPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import BillingPage from "./pages/BillingPage";

// Redirects to onboarding when user is logged in but hasn't completed it
// Also handles the case where profile is null (no DB row yet after signup)
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, profile, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }
  if (isLoggedIn && (!profile || !profile.onboarding_completed)) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

// Redirects already-logged-in users away from the auth page
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, profile, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
  if (isLoggedIn) {
    if (!profile || !profile.onboarding_completed) return <Navigate to="/onboarding" replace />
    return <Navigate to="/chat" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthGuard><AuthPage /></AuthGuard>} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/chat" element={<OnboardingGuard><Chat /></OnboardingGuard>} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/billing" element={<BillingPage />} />
    </Routes>
  )
}

function AuthCallbackPage() {
  const { isLoggedIn, profile, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completing sign in...</p>
        </div>
      </div>
    )
  }
  if (!isLoggedIn) return <Navigate to="/auth" replace />
  if (!profile || !profile.onboarding_completed) return <Navigate to="/onboarding" replace />
  return <Navigate to="/chat" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
