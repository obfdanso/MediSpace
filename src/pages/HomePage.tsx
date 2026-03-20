import Navbar from "@/components/Navbar";
import LandingPage from "@/components/LandingPage";
import AuroraShaders from "@/components/ui/aurora";

export default function HomePage() {
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
      <div className="pt-16">
        <LandingPage />
      </div>
    </div>
  );
}

