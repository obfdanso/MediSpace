import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthContext";
import { useAuth } from "@/components/AuthContext";

import HomePage from "./pages/HomePage";
const Chat = lazy(() => import("./pages/Chat"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const SafetyPage = lazy(() => import("./pages/SafetyPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
// Pages load only when opened, so the first visit downloads less
const legal = () => import("./pages/LegalPages");
const TermsPage = lazy(() => legal().then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => legal().then((m) => ({ default: m.PrivacyPage })));
const RefundPage = lazy(() => legal().then((m) => ({ default: m.RefundPage })));
const DisclaimerPage = lazy(() => legal().then((m) => ({ default: m.DisclaimerPage })));

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

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
  // Only once the profile has loaded, so a signed-in user whose profile is
  // still being fetched isn't bounced to onboarding by mistake
  if (isLoggedIn && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

// Redirects already-logged-in users away from the auth page
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

// Gives each page its own browser tab title
const TITLES: Record<string, string> = {
  "/": "MediSpace - AI Health Assistant",
  "/auth": "Sign in",
  "/auth/callback": "Signing in",
  "/services": "Features",
  "/onboarding": "Set up your profile",
  "/chat": "Chat",
  "/about": "About",
  "/contact": "Contact",
  "/features": "Features",
  "/faq": "FAQ",
  "/safety": "Safety & Privacy",
  "/billing": "Plans & Billing",
  "/terms": "Terms of Service",
  "/privacy": "Privacy Policy",
  "/refunds": "Refund Policy",
  "/disclaimer": "Medical Disclaimer",
};

function usePageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = TITLES[pathname];
    document.title = pathname === "/" ? TITLES["/"] : `${title ?? "Page not found"} | MediSpace`;
  }, [pathname]);
}

function AppRoutes() {
  usePageTitle();
  return (
    <Suspense fallback={<PageSpinner />}>
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
      <Route path="/services" element={<Navigate to="/features" replace />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refunds" element={<RefundPage />} />
      <Route path="/disclaimer" element={<DisclaimerPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
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
  return <Navigate to="/" replace />
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
