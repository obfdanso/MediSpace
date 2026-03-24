import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthContext";

import HomePage from "./pages/HomePage";
import Chat from "./pages/Chat";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FeaturesPage from "./pages/FeaturesPage";
import FaqPage from "./pages/FaqPage";
import SafetyPage from "./pages/SafetyPage";
import ServicesPage from "./pages/ServicesPage";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <AuthProvider>
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>
    </ThemeProvider>
    </AuthProvider>
  );
}