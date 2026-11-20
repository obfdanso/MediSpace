import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has moved.
        </p>
        <div className="flex gap-3">
          <Link to="/" className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors">
            Go home
          </Link>
          <Link to="/chat" className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors">
            Open chat
          </Link>
        </div>
      </main>
    </div>
  );
}
