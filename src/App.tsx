import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

import HomePage from "./pages/HomePage";
import Chat from "./pages/Chat";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FeaturesPage from "./pages/FeaturesPage";
import FaqPage from "./pages/FaqPage";
import PricingPage from "./pages/PricingPage";
import SafetyPage from "./pages/SafetyPage";
import ServicesPage from "./pages/ServicesPage";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>
    </ThemeProvider>
  );
}

