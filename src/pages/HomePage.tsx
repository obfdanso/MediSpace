import Navbar from "@/components/Navbar";
import LandingPage from "@/components/LandingPage";
import AuroraShaders from "@/components/ui/aurora";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative isolate">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders />
      </div>
      <Navbar />
      <div className="pt-16">
        <LandingPage />
      </div>
    </div>
  );
}

