import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import App from "./App";
import ErrorBoundary from "@/components/ErrorBoundary";
import "../app/globals.css";

// After a new deploy, old page files disappear; reload once to fetch the new ones
window.addEventListener("vite:preloadError", () => {
  try {
    if (sessionStorage.getItem("reloaded-for-update")) return;
    sessionStorage.setItem("reloaded-for-update", "1");
  } catch {}
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);

